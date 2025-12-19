import { useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useMcpStore } from '@/stores/mcpStore';
import { getOpenRouterService } from '@/services/openrouter';
import type { OpenRouterMessage } from '@/types/openrouter';
import type { ToolCall, ToolResult } from '@/types/chat';

export function useStreaming() {
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const updateMessageStreaming = useChatStore((state) => state.updateMessageStreaming);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setError = useChatStore((state) => state.setError);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const selectedModel = useSettingsStore((state) => state.selectedModel);
  const getAllTools = useMcpStore((state) => state.getAllTools);
  const servers = useMcpStore((state) => state.servers);
  const tools = useMcpStore((state) => state.tools);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to find which server has a specific tool
  const findServerForTool = useCallback((toolName: string): string | null => {
    for (const [serverId, serverTools] of tools.entries()) {
      if (serverTools.some((t) => t.name === toolName)) {
        return serverId;
      }
    }
    return null;
  }, [tools]);

  const sendMessage = useCallback(
    async (conversationId: string, userMessage: string) => {
      if (!apiKey) {
        setError('Please set your OpenRouter API key in settings');
        return;
      }

      // Get conversation to build message history
      const conversations = useChatStore.getState().conversations;
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      // Create abort controller
      abortControllerRef.current = new AbortController();

      let assistantMessageId: string | null = null;

      try {
        setStreaming(true);
        setError(null);

        // Build message history for API
        const messages: OpenRouterMessage[] = conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          ...(msg.toolCalls && { tool_calls: msg.toolCalls }),
        }));

        // Add current user message
        messages.push({
          role: 'user',
          content: userMessage,
        });

        // Get available MCP tools
        const tools = getAllTools();

        // Initialize OpenRouter service
        const service = getOpenRouterService(apiKey);

        // Create assistant message placeholder
        assistantMessageId = addMessage(conversationId, {
          role: 'assistant',
          content: '',
          isStreaming: true,
          model: selectedModel,
        });

        if (!assistantMessageId) {
          setStreaming(false);
          return;
        }

        const messageId = assistantMessageId;

        let accumulatedContent = '';
        let pendingUpdate: number | null = null;
        let lastUpdateAt = 0;
        const updateIntervalMs = 60;

        const flushUpdate = () => {
          if (pendingUpdate !== null) {
            window.clearTimeout(pendingUpdate);
            pendingUpdate = null;
          }
          lastUpdateAt = Date.now();
          updateMessage(conversationId, messageId, accumulatedContent);
        };

        const scheduleUpdate = () => {
          if (pendingUpdate !== null) return;

          const now = Date.now();
          const delay = Math.max(0, updateIntervalMs - (now - lastUpdateAt));
          pendingUpdate = window.setTimeout(() => {
            pendingUpdate = null;
            lastUpdateAt = Date.now();
            updateMessage(conversationId, messageId, accumulatedContent);
          }, delay);
        };

        // Stream the response
        await service.streamChat(
          messages,
          selectedModel,
          {
            onContent: (content: string) => {
              accumulatedContent += content;

              scheduleUpdate();
            },
            onToolCall: async (toolCall: any) => {
              try {
                // Extract tool information from the call
                const toolName = toolCall.function?.name;
                const toolArgs = toolCall.function?.arguments
                  ? JSON.parse(toolCall.function.arguments)
                  : null;

                if (!toolName) {
                  console.error('Tool call missing name');
                  return;
                }

                // Find which server has this tool
                const serverId = findServerForTool(toolName);
                if (!serverId) {
                  console.error(`No server found for tool: ${toolName}`);
                  return;
                }

                console.log(`Calling MCP tool ${toolName} on server ${serverId}`, toolArgs);

                // Call the tool via Tauri backend
                const result = await invoke('call_mcp_tool', {
                  serverId,
                  toolName,
                  arguments: toolArgs,
                });

                console.log('Tool result:', result);

                // TODO: Add tool call and result to the message
                // This would require updating the message structure to include tool calls
                // For now, we just log it
              } catch (error) {
                console.error('Error calling MCP tool:', error);
              }
            },
            onComplete: () => {
              flushUpdate();
              // Mark streaming as complete
              updateMessageStreaming(conversationId, messageId, false);
              setStreaming(false);
            },
            onError: (error: Error) => {
              flushUpdate();
              setError(error.message);
              updateMessageStreaming(conversationId, messageId, false);
              setStreaming(false);
            },
            signal: abortControllerRef.current.signal,
          },
          tools.length > 0 ? tools : undefined
        );
      } catch (error) {
        if (error instanceof Error && error.message !== 'Request aborted') {
          setError(error.message);
        }
        if (assistantMessageId) {
          updateMessageStreaming(conversationId, assistantMessageId, false);
        }
        setStreaming(false);
      }
    },
    [
      apiKey,
      selectedModel,
      addMessage,
      updateMessage,
      updateMessageStreaming,
      setStreaming,
      setError,
      getAllTools,
      findServerForTool,
    ]
  );

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreaming(false);
    }
  }, [setStreaming]);

  return {
    sendMessage,
    cancelStreaming,
  };
}
