import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { invoke } from '@tauri-apps/api/core';
import type { McpServer, McpTool, McpServerConfig } from '@/types/mcp';

interface McpStore {
  servers: McpServer[];
  tools: Map<string, McpTool[]>;

  // Actions
  addServer: (config: McpServerConfig) => Promise<string>;
  removeServer: (id: string) => Promise<void>;
  startServer: (id: string) => Promise<void>;
  stopServer: (id: string) => Promise<void>;
  updateServerStatus: (id: string, status: McpServer['status'], pid?: number) => void;
  setServerTools: (serverId: string, tools: McpTool[]) => void;
  getServerTools: (serverId: string) => McpTool[];
  getAllTools: () => McpTool[];
}

export const useMcpStore = create<McpStore>()(
  persist(
    (set, get) => ({
      servers: [],
      tools: new Map(),

      addServer: async (config: McpServerConfig) => {
        const id = nanoid();
        const newServer: McpServer = {
          id,
          name: config.name,
          command: config.command,
          args: config.args,
          env: config.env,
          status: 'stopped',
        };

        set((state) => ({
          servers: [...state.servers, newServer],
        }));

        // Auto-start if configured
        if (config.autoStart) {
          await get().startServer(id);
        }

        return id;
      },

      removeServer: async (id: string) => {
        // Stop server first if running
        const server = get().servers.find((s) => s.id === id);
        if (server && server.status === 'running') {
          await get().stopServer(id);
        }

        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
        }));

        // Remove tools
        const newTools = new Map(get().tools);
        newTools.delete(id);
        set({ tools: newTools });
      },

      startServer: async (id: string) => {
        const server = get().servers.find((s) => s.id === id);
        if (!server) return;

        // Update status to starting
        get().updateServerStatus(id, 'starting');

        try {
          // Call Tauri command to start MCP server
          await invoke('start_mcp_server', {
            config: {
              id,
              name: server.name,
              command: server.command,
              args: server.args,
              env: server.env || {},
            },
          });

          get().updateServerStatus(id, 'running');

          // List tools from the server
          const tools = await invoke<McpTool[]>('list_mcp_tools', { serverId: id });
          get().setServerTools(id, tools);
        } catch (error) {
          console.error('Failed to start MCP server:', error);
          get().updateServerStatus(id, 'error');
        }
      },

      stopServer: async (id: string) => {
        try {
          // Call Tauri command to stop MCP server
          await invoke('stop_mcp_server', { serverId: id });

          get().updateServerStatus(id, 'stopped');

          // Clear tools
          const newTools = new Map(get().tools);
          newTools.delete(id);
          set({ tools: newTools });
        } catch (error) {
          console.error('Failed to stop MCP server:', error);
          get().updateServerStatus(id, 'error');
        }
      },

      updateServerStatus: (id: string, status: McpServer['status'], pid?: number) => {
        set((state) => ({
          servers: state.servers.map((server) =>
            server.id === id
              ? { ...server, status, ...(pid !== undefined && { pid }) }
              : server
          ),
        }));
      },

      setServerTools: (serverId: string, tools: McpTool[]) => {
        const newTools = new Map(get().tools);
        newTools.set(serverId, tools);
        set({ tools: newTools });
      },

      getServerTools: (serverId: string) => {
        return get().tools.get(serverId) || [];
      },

      getAllTools: () => {
        const allTools: McpTool[] = [];
        get().tools.forEach((tools) => {
          allTools.push(...tools);
        });
        return allTools;
      },
    }),
    {
      name: 'orion-mcp-storage',
      partialize: (state) => ({
        servers: state.servers,
        // Don't persist tools, they'll be fetched when servers start
      }),
    }
  )
);
