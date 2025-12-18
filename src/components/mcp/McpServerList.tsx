import { useMcpStore } from '@/stores/mcpStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Square, Trash2, Wrench } from 'lucide-react';

export function McpServerList() {
  const { servers, startServer, stopServer, removeServer, getServerTools } = useMcpStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'starting':
        return 'text-yellow-400';
      case 'stopped':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '●';
      case 'starting':
        return '◐';
      case 'stopped':
        return '○';
      case 'error':
        return '✕';
      default:
        return '○';
    }
  };

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <Wrench className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">No MCP servers configured</p>
        <p className="text-xs mt-2">Add a server to enable AI tools</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {servers.map((server) => {
          const tools = getServerTools(server.id);

          return (
            <div
              key={server.id}
              className="bg-muted rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`text-lg ${getStatusColor(server.status)}`}>
                    {getStatusIcon(server.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{server.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {server.command} {server.args.join(' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {server.status === 'running' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => stopServer(server.id)}
                      title="Stop server"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startServer(server.id)}
                      disabled={server.status === 'starting'}
                      title="Start server"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeServer(server.id)}
                    title="Remove server"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {tools.length > 0 && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="font-medium">{tools.length} tools:</span>{' '}
                  {tools.map((t) => t.name).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
