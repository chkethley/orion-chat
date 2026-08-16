import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useMemoryStore } from '@/stores/memoryStore';
import { getOpenRouterService, resetOpenRouterService } from '@/services/openrouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain, Eye, EyeOff, ExternalLink, Globe, Plus, Trash2 } from 'lucide-react';
import { McpServerList } from '@/components/mcp/McpServerList';
import { McpServerDialog } from '@/components/mcp/McpServerDialog';
import { SmitheryBrowseDialog } from '@/components/mcp/SmitheryBrowseDialog';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const memories = useMemoryStore((state) => state.memories);
  const forgetMemory = useMemoryStore((state) => state.forgetMemory);
  const clearMemories = useMemoryStore((state) => state.clearMemories);

  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showMcpDialog, setShowMcpDialog] = useState(false);
  const [showSmitheryDialog, setShowSmitheryDialog] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      if (localApiKey.trim()) {
        getOpenRouterService(localApiKey.trim());
        setApiKey(localApiKey.trim());
        setSaveStatus('success');

        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } else {
        setApiKey('');
        resetOpenRouterService();
        setSaveStatus('success');

        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalApiKey(apiKey || '');
    setSaveStatus('idle');
    onOpenChange(false);
  };

  const handleClearMemories = () => {
    if (window.confirm('Erase all of Orion\'s long-term memories? This cannot be undone.')) {
      clearMemories();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure Orion, its tools, and its long-term memory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key">OpenRouter API Key</Label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Get API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to Orion's own servers.
            </p>
          </div>

          {saveStatus === 'success' && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
              Settings saved successfully!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Failed to save settings. Please check your API key.
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <Label>Long-term Memory</Label>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {memories.length}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearMemories}
                disabled={memories.length === 0}
                className="h-8"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Clear all
              </Button>
            </div>

            <div className="max-h-[190px] space-y-2 overflow-y-auto rounded-md border border-border bg-muted/20 p-2">
              {memories.length === 0 ? (
                <div className="flex min-h-[90px] items-center justify-center px-4 text-center text-xs text-muted-foreground">
                  Orion has not formed any long-term memories yet. Facts, preferences, goals, and meaningful episodes will appear here.
                </div>
              ) : (
                memories.slice(0, 12).map((memory) => (
                  <div
                    key={memory.id}
                    className="group flex items-start gap-2 rounded-md border border-white/5 bg-background/50 p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                        {memory.kind}
                      </div>
                      <p className="text-xs leading-relaxed text-foreground/85">{memory.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => forgetMemory(memory.id)}
                      className="rounded p-1 text-muted-foreground opacity-60 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label="Forget memory"
                      title="Forget memory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Memories stay on this device. Orion retrieves only a small relevant set for each reply.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>MCP Servers</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSmitheryDialog(true)}
                  className="h-8"
                >
                  <Globe className="mr-1 h-4 w-4" />
                  Browse Smithery
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMcpDialog(true)}
                  className="h-8"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Manually
                </Button>
              </div>
            </div>

            <div className="h-[200px] rounded-md border border-border bg-muted/20">
              <McpServerList />
            </div>

            <p className="text-xs text-muted-foreground">
              MCP servers provide tools that the AI can use during conversations.
            </p>
          </div>

          <McpServerDialog open={showMcpDialog} onOpenChange={setShowMcpDialog} />
          <SmitheryBrowseDialog open={showSmitheryDialog} onOpenChange={setShowSmitheryDialog} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
