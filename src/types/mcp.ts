export interface McpServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  status: 'stopped' | 'starting' | 'running' | 'error';
  pid?: number;
}

export interface McpTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface McpToolCallRequest {
  serverId: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

export interface McpServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  autoStart?: boolean;
}

// JSON-RPC types for MCP protocol
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: {
    tools?: Record<string, unknown>;
    resources?: Record<string, unknown>;
    prompts?: Record<string, unknown>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface McpToolsListResult {
  tools: McpTool[];
}

export interface McpToolCallResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}
