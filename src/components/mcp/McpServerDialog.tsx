import { useState } from 'react';
import { useMcpStore } from '@/stores/mcpStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { McpServerConfig } from '@/types/mcp';

interface McpServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function McpServerDialog({ open, onOpenChange }: McpServerDialogProps) {
  const { addServer } = useMcpStore();
  const [config, setConfig] = useState<Partial<McpServerConfig>>({
    name: '',
    command: 'node',
    args: [],
    env: {},
    autoStart: true,
  });
  const [argsInput, setArgsInput] = useState('');
  const [envInput, setEnvInput] = useState('');

  const handleSave = async () => {
    if (!config.name || !config.command) {
      return;
    }

    // Parse args from space-separated string
    const args = argsInput.trim() ? argsInput.trim().split(/\s+/) : [];

    // Parse env from KEY=VALUE format (newline separated)
    const env: Record<string, string> = {};
    if (envInput.trim()) {
      envInput.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }

    const fullConfig: McpServerConfig = {
      name: config.name,
      command: config.command,
      args,
      env,
      autoStart: config.autoStart ?? true,
    };

    await addServer(fullConfig);
    onOpenChange(false);

    // Reset form
    setConfig({ name: '', command: 'node', args: [], env: {}, autoStart: true });
    setArgsInput('');
    setEnvInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add MCP Server</DialogTitle>
          <DialogDescription>
            Configure a Model Context Protocol server to provide tools to the AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              placeholder="My MCP Server"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="command">Command</Label>
            <Input
              id="command"
              placeholder="node"
              value={config.command}
              onChange={(e) => setConfig({ ...config, command: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              The executable to run (e.g., node, python, npx)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="args">Arguments</Label>
            <Input
              id="args"
              placeholder="/path/to/server.js --option value"
              value={argsInput}
              onChange={(e) => setArgsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Space-separated command line arguments
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="env">Environment Variables (optional)</Label>
            <textarea
              id="env"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="API_KEY=your-key&#10;NODE_ENV=production"
              value={envInput}
              onChange={(e) => setEnvInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              One per line in KEY=VALUE format
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoStart"
              className="h-4 w-4 rounded border-input bg-background"
              checked={config.autoStart}
              onChange={(e) => setConfig({ ...config, autoStart: e.target.checked })}
            />
            <Label htmlFor="autoStart" className="cursor-pointer">
              Auto-start when added
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!config.name || !config.command}>
            Add Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
