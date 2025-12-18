import type { OpenRouterMessage, OpenRouterStreamChunk, McpTool } from '@/types/openrouter';

export interface StreamOptions {
  onContent: (content: string) => void;
  onToolCall?: (toolCall: any) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async *streamChatCompletion(
    messages: OpenRouterMessage[],
    model: string,
    tools?: McpTool[]
  ): AsyncGenerator<OpenRouterStreamChunk, void, unknown> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Orion AI Chat',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        ...(tools && tools.length > 0 && { tools }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6); // Remove 'data: ' prefix
          if (data === '[DONE]') return;

          try {
            const parsed: OpenRouterStreamChunk = JSON.parse(data);
            yield parsed;
          } catch (e) {
            console.error('Failed to parse SSE chunk:', e, 'Data:', data);
          }
        }
      }
    } finally {
      reader.cancel();
    }
  }

  async streamChat(
    messages: OpenRouterMessage[],
    model: string,
    options: StreamOptions,
    tools?: McpTool[]
  ): Promise<void> {
    try {
      let fullContent = '';
      const toolCalls: any[] = [];

      for await (const chunk of this.streamChatCompletion(messages, model, tools)) {
        // Check if aborted
        if (options.signal?.aborted) {
          throw new Error('Request aborted');
        }

        const choice = chunk.choices[0];
        if (!choice) continue;

        // Handle content delta
        const content = choice.delta?.content;
        if (content) {
          fullContent += content;
          options.onContent(content);
        }

        // Handle tool calls
        const toolCallDeltas = choice.delta?.tool_calls;
        if (toolCallDeltas && options.onToolCall) {
          toolCallDeltas.forEach((tc) => {
            options.onToolCall!(tc);
          });
        }

        // Check for completion
        if (choice.finish_reason) {
          options.onComplete?.();
          break;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Request aborted') {
        options.onError?.(error);
      }
      throw error;
    }
  }

  // Fetch available models from OpenRouter
  async fetchModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }
}

// Singleton instance management
let serviceInstance: OpenRouterService | null = null;

export function getOpenRouterService(apiKey?: string): OpenRouterService {
  if (apiKey) {
    serviceInstance = new OpenRouterService(apiKey);
  }

  if (!serviceInstance) {
    throw new Error('OpenRouter service not initialized. Please provide an API key.');
  }

  return serviceInstance;
}

export function resetOpenRouterService(): void {
  serviceInstance = null;
}
