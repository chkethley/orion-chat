import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
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
import { Eye, EyeOff, ExternalLink, Plus } from 'lucide-react';
import { McpServerList } from '@/components/mcp/McpServerList';
import { McpServerDialog } from '@/components/mcp/McpServerDialog';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);

  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showMcpDialog, setShowMcpDialog] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      if (localApiKey.trim()) {
        // Validate API key by trying to initialize the service
        getOpenRouterService(localApiKey.trim());
        setApiKey(localApiKey.trim());
        setSaveStatus('success');

        // Close dialog after short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } else {
        // Clear API key
        setApiKey('');
        resetOpenRouterService();
        setSaveStatus('success');

        // Close dialog after short delay
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenRouter API key and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* API Key Section */}
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
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* Status Messages */}
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

          {/* MCP Servers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>MCP Servers</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMcpDialog(true)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Server
              </Button>
            </div>

            <div className="rounded-md border border-border bg-muted/20 h-[200px]">
              <McpServerList />
            </div>

            <p className="text-xs text-muted-foreground">
              MCP servers provide tools that the AI can use during conversations.
            </p>
          </div>

          <McpServerDialog open={showMcpDialog} onOpenChange={setShowMcpDialog} />
        </div>

        {/* Actions */}
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
