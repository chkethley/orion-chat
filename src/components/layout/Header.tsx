import { useState, useMemo, useEffect } from 'react';
import {
  Settings,
  ChevronDown,
  Search,
  Sparkles,
  Check,
  Keyboard,
  RefreshCw,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { fetchOpenRouterModels, type ModelInfo } from '@/services/openrouterModels';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [allModels, setAllModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const selectedModel = useSettingsStore((state) => state.selectedModel);
  const setSelectedModel = useSettingsStore((state) => state.setSelectedModel);
  const setAvailableModels = useSettingsStore((state) => state.setAvailableModels);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await fetchOpenRouterModels();
      setAllModels(models);
      setAvailableModels(models.map((m) => m.id));
      setModelsLoaded(true);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const getModelInfo = (modelId: string): ModelInfo => {
    const model = allModels.find((m) => m.id === modelId);
    if (model) return model;

    return {
      id: modelId,
      name: modelId.split('/')[1]?.replace(/-/g, ' ') || modelId,
      provider: modelId.split('/')[0] || 'Unknown',
      contextWindow: 'N/A',
    };
  };

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) {
      return allModels;
    }

    const query = modelSearch.toLowerCase();
    return allModels.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query)
    );
  }, [allModels, modelSearch]);

  const featuredModels = filteredModels.filter((m) => m.featured);
  const otherModels = filteredModels.filter((m) => !m.featured);

  const currentModel = getModelInfo(selectedModel);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-gradient-to-r from-white/10 via-transparent to-transparent px-6">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
          Model deck
        </span>

        <DropdownMenu open={isModelMenuOpen} onOpenChange={setIsModelMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="min-w-[260px] h-auto min-h-[56px] justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-left shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex flex-col text-left">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  Current model
                </span>
                <span className="text-sm font-semibold leading-tight">{currentModel.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {currentModel.provider} • {currentModel.contextWindow}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-[420px] border border-white/10 bg-[#0d1524] p-0 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="space-y-2 border-b border-white/5 p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="h-9 rounded-lg border-white/10 bg-white/5 pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 rounded-lg border-white/20 bg-white/5"
                  onClick={loadModels}
                  disabled={isLoadingModels}
                  title="Refresh models list"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {modelsLoaded && (
                <p className="text-xs text-muted-foreground">{allModels.length} models available</p>
              )}
            </div>

            <ScrollArea className="max-h-[420px]">
              {isLoadingModels ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Loading models...
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No models found
                </div>
              ) : (
                <>
                  {featuredModels.length > 0 && (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Featured picks
                      </DropdownMenuLabel>
                      {featuredModels.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelMenuOpen(false);
                            setModelSearch('');
                          }}
                          className="cursor-pointer px-3 py-3 transition-colors hover:bg-primary/5"
                        >
                          <div className="flex flex-1 items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="font-medium">{model.name}</span>
                                {selectedModel === model.id && (
                                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                )}
                              </div>
                              <div className="space-y-0.5 text-xs text-muted-foreground">
                                <div>{model.provider}</div>
                                <div className="flex items-center gap-3">
                                  <span>Context: {model.contextWindow}</span>
                                  {model.pricing && <span>•</span>}
                                  {model.pricing && <span>{model.pricing}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {otherModels.length > 0 && <DropdownMenuSeparator className="bg-white/5" />}
                    </>
                  )}

                  {otherModels.length > 0 && (
                    <>
                      {featuredModels.length > 0 && (
                        <DropdownMenuLabel className="py-2 text-muted-foreground">
                          All Models
                        </DropdownMenuLabel>
                      )}
                      {otherModels.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelMenuOpen(false);
                            setModelSearch('');
                          }}
                          className="cursor-pointer px-3 py-3 transition-colors hover:bg-primary/5"
                        >
                          <div className="flex flex-1 items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
                              <Keyboard className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="font-medium">{model.name}</span>
                                {selectedModel === model.id && (
                                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                )}
                              </div>
                              <div className="space-y-0.5 text-xs text-muted-foreground">
                                <div>{model.provider}</div>
                                <div className="flex items-center gap-3">
                                  <span>Context: {model.contextWindow}</span>
                                  {model.pricing && <span>•</span>}
                                  {model.pricing && <span>{model.pricing}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border border-white/5 bg-white/5 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
          onClick={() => {
            const refs = (window as any).__orionRefs;
            if (refs) refs.setShowShortcuts(true);
          }}
          title="Keyboard shortcuts (Ctrl+/)"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border border-white/5 bg-white/5 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
          onClick={() => setIsSettingsOpen(true)}
          title="Settings (Ctrl+,)"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </header>
  );
}
