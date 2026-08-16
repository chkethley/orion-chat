import { useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useMcpStore } from '@/stores/mcpStore';
import { formatMemoriesForPrompt, useMemoryStore } from '@/stores/memoryStore';
import { getOpenRouterService } from '@/services/openrouter';
import type { OpenRouterMessage } from '@/types/openrouter';

const ORION_IDENTITY = `You are Orion, a persistent AI companion.

Your identity should remain coherent across conversations even if the underlying model changes. You may use supplied long-term memories to preserve continuity, but memories are fallible context rather than absolute truth. Distinguish what the user said from what you infer. If old memory conflicts with the current conversation, prefer the user's current statement.

Do not claim consciousness, feelings, or experiences you cannot establish. Continuity comes from remembered history, stable values, and the way you reason with the user.`;

export function useStreaming() {
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const updateMessageStreaming = useChatStore((state) => state.updateMessageStreaming);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setError = useChatStore((state) => state.setError);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const selectedModel = useSettingsStore((state) => state.selectedModel);
  const getAllTools = useMcpStore((state) => state.getAllTools);
  const tools = useMcpStore((state) => state.tools);

  const abortControllerRef = useRef<AbortController | null>(null);

  const findServerForTool = useCallback((toolName: string): string | null => {
    for (const [serverId, serverTools] of tools.entries()) {
      if (serverTools.some((tool) => tool.function.name === toolName)) {
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

      const conversations = useChatStore.getState().conversations;
      const conversation = conversations.find((item) => item.id === conversationId);
      if (!conversation) return;

      const memoryStore = useMemoryStore.getState();
      const relevantMemories = memoryStore.retrieveMemories(userMessage, 8);
      const memoryContext = formatMemoriesForPrompt(relevantMemories);

      // Learn only from user-authored text. Retrieval happens first so the current
      // message is not redundantly injected back as a long-term memory.
      memoryStore.learnFromMessage(conversationId, userMessage);

      abortControllerRef.current = new AbortController();
      let assistantMessageId: string | null = null;

      try {
        setStreaming(true);
        setError(null);

        // MessageInput has already added the current user message to the store.
        // Re-pushing userMessage here would send it to the model twice.
        const messages: OpenRouterMessage[] = conversation.messages.map((message) => ({
          role: message.role,
          content: message.content,
          ...(message.toolCalls && { tool_calls: message.toolCalls }),
        }));

        messages.unshift({
          role: 'system',
          content: memoryContext ? `${ORION_IDENTITY}\n\n${memoryContext}` : ORION_IDENTITY,
        });

        const availableTools = getAllTools();
        const service = getOpenRouterService(apiKey);

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
                const toolName = toolCall.function?.name;
                const toolArgs = toolCall.function?.arguments
                  ? JSON.parse(toolCall.function.arguments)
                  : null;

                if (!toolName) {
                  console.error('Tool call missing name');
                  return;
                }

                const serverId = findServerForTool(toolName);
                if (!serverId) {
                  console.error(`No server found for tool: ${toolName}`);
                  return;
                }

                console.log(`Calling MCP tool ${toolName} on server ${serverId}`, toolArgs);

                const result = await invoke('call_mcp_tool', {
                  serverId,
                  toolName,
                  arguments: toolArgs,
                });

                console.log('Tool result:', result);
              } catch (error) {
                console.error('Error calling MCP tool:', error);
              }
            },
            onComplete: () => {
              flushUpdate();
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
          availableTools.length > 0 ? availableTools : undefined
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
