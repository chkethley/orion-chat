import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  ExternalLink,
  Sparkles,
  Package,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useMcpStore } from '@/stores/mcpStore';
import { fetchSmitheryServers } from '@/services/smithery';
import type { SmitheryServer } from '@/types/smithery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface SmitheryBrowseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmitheryBrowseDialog({ open, onOpenChange }: SmitheryBrowseDialogProps) {
  const { addServer, servers: installedServers } = useMcpStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [servers, setServers] = useState<SmitheryServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serversLoaded, setServersLoaded] = useState(false);
  const [installing, setInstalling] = useState<Set<string>>(new Set());
  const [installResults, setInstallResults] = useState<Map<string, 'success' | 'error'>>(
    new Map()
  );

  useEffect(() => {
    if (open) {
      loadServers();
    }
  }, [open]);

  const loadServers = async () => {
    setIsLoading(true);
    try {
      const fetchedServers = await fetchSmitheryServers();
      setServers(fetchedServers);
      setServersLoaded(true);
    } catch (error) {
      console.error('Failed to load Smithery servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) {
      return servers;
    }

    const query = searchQuery.toLowerCase();
    return servers.filter(
      (server) =>
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        server.author.toLowerCase().includes(query) ||
        server.id.toLowerCase().includes(query) ||
        server.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [servers, searchQuery]);

  const featuredServers = filteredServers.filter((s) => s.featured);
  const otherServers = filteredServers.filter((s) => !s.featured);

  const isInstalled = (serverId: string) => {
    return installedServers.some((s) => s.name === serverId || s.args.includes(serverId));
  };

  const handleInstall = async (server: SmitheryServer) => {
    if (isInstalled(server.id) || installing.has(server.id)) return;

    setInstalling((prev) => new Set(prev).add(server.id));
    setInstallResults((prev) => {
      const next = new Map(prev);
      next.delete(server.id);
      return next;
    });

    try {
      // Prepare environment variables (prompt for required ones)
      const env: Record<string, string> = { ...server.env };

      // Check if server requires API keys or configuration
      const requiresConfig = Object.keys(env).length > 0;
      if (requiresConfig) {
        // For now, just add empty placeholders
        // TODO: Show a configuration dialog for required env vars
        console.log('Server requires configuration:', env);
      }

      // Add server to MCP store
      await addServer({
        name: server.id,
        command: server.command,
        args: server.args,
        env: Object.keys(env).length > 0 ? env : undefined,
        autoStart: false, // Don't auto-start servers that need configuration
      });

      setInstallResults((prev) => new Map(prev).set(server.id, 'success'));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setInstallResults((prev) => {
          const next = new Map(prev);
          next.delete(server.id);
          return next;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to install server:', error);
      setInstallResults((prev) => new Map(prev).set(server.id, 'error'));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setInstallResults((prev) => {
          const next = new Map(prev);
          next.delete(server.id);
          return next;
        });
      }, 3000);
    } finally {
      setInstalling((prev) => {
        const next = new Set(prev);
        next.delete(server.id);
        return next;
      });
    }
  };

  const getInstallButtonContent = (server: SmitheryServer) => {
    const isServerInstalled = isInstalled(server.id);
    const isInstalling = installing.has(server.id);
    const result = installResults.get(server.id);

    if (isServerInstalled) {
      return (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Installed
        </>
      );
    }

    if (isInstalling) {
      return (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Installing...
        </>
      );
    }

    if (result === 'success') {
      return (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Installed!
        </>
      );
    }

    if (result === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4" />
          Failed
        </>
      );
    }

    return (
      <>
        <Download className="h-4 w-4" />
        Install
      </>
    );
  };

  const ServerCard = ({ server }: { server: SmitheryServer }) => {
    const isServerInstalled = isInstalled(server.id);
    const isInstalling = installing.has(server.id);
    const result = installResults.get(server.id);

    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/30 hover:bg-white/[0.07]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                server.featured
                  ? 'bg-primary/15 text-primary'
                  : 'bg-white/10 text-muted-foreground'
              }`}
            >
              {server.featured ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <Package className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{server.name}</h3>
              <p className="text-xs text-muted-foreground">by {server.author}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleInstall(server)}
            disabled={isServerInstalled || isInstalling}
            variant={
              result === 'success'
                ? 'default'
                : result === 'error'
                  ? 'destructive'
                  : isServerInstalled
                    ? 'secondary'
                    : 'default'
            }
            className="h-8 flex-shrink-0"
          >
            {getInstallButtonContent(server)}
          </Button>
        </div>

        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {server.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {server.tags && server.tags.length > 0 && (
            <>
              {server.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </>
          )}
          {server.repository && (
            <a
              href={server.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Repo
            </a>
          )}
        </div>

        {server.env && Object.keys(server.env).length > 0 && (
          <div className="mt-2 rounded-lg bg-yellow-500/10 px-2 py-1 text-xs text-yellow-500">
            ⚠️ Requires configuration
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Browse MCP Servers</DialogTitle>
          <DialogDescription>
            Discover and install MCP servers from the Smithery.ai registry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search servers by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl border-white/10 bg-white/5 pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 flex-shrink-0 rounded-xl border-white/20 bg-white/5"
              onClick={loadServers}
              disabled={isLoading}
              title="Refresh server list"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {serversLoaded && (
            <p className="text-xs text-muted-foreground">
              {filteredServers.length} servers available
            </p>
          )}

          {/* Server List */}
          <ScrollArea className="h-[450px] pr-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                <RefreshCw className="mb-2 h-8 w-8 animate-spin" />
                Loading servers...
              </div>
            ) : filteredServers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                No servers found
              </div>
            ) : (
              <div className="space-y-4">
                {featuredServers.length > 0 && (
                  <div>
                    <Label className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Featured Servers
                    </Label>
                    <div className="space-y-3">
                      {featuredServers.map((server) => (
                        <ServerCard key={server.id} server={server} />
                      ))}
                    </div>
                  </div>
                )}

                {otherServers.length > 0 && (
                  <div>
                    {featuredServers.length > 0 && (
                      <Label className="mb-3 block text-sm text-muted-foreground">
                        All Servers
                      </Label>
                    )}
                    <div className="space-y-3">
                      {otherServers.map((server) => (
                        <ServerCard key={server.id} server={server} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
