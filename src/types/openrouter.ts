import { ToolCall } from './chat';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
}

export interface McpTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  tools?: McpTool[];
}

export interface OpenRouterStreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      tool_calls?: ToolCall[];
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}
