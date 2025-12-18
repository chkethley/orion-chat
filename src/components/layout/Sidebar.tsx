import { useState, useMemo } from 'react';
import { Plus, MessageSquare, Trash2, Search, Edit2, Check, X, Download } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const createConversation = useChatStore((state) => state.createConversation);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const updateConversationTitle = useChatStore((state) => state.updateConversationTitle);
  const selectedModel = useSettingsStore((state) => state.selectedModel);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleNewChat = () => {
    createConversation(selectedModel);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleStartEdit = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveEdit = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleExportConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;

    const exportData = {
      title: conversation.title,
      model: conversation.model,
      createdAt: new Date(conversation.createdAt).toISOString(),
      updatedAt: new Date(conversation.updatedAt).toISOString(),
      messages: conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.messages.some((m) => m.content.toLowerCase().includes(query))
      );
    }

    // Sort by most recent
    return [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations, searchQuery]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-gradient-to-b from-white/10 via-[#0f192c]/80 to-[#0b101c]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 via-primary to-[#4ae0d0] text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(61,210,195,0.45)]">
            OR
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Orion</p>
            <p className="text-xs text-muted-foreground">Conversational canvas</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <Button
        onClick={handleNewChat}
        className="w-full bg-gradient-to-r from-primary via-[#45e3d2] to-[#f8bf6b] text-sm font-semibold text-[#051510] shadow-[0_12px_45px_rgba(61,210,195,0.45)] hover:brightness-110 border-none"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>

      {/* Search Bar */}
      {conversations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl border-white/10 bg-white/5 pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Conversation List */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-2 shadow-inner">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">History</span>
          <span className="text-[11px] text-muted-foreground">{conversations.length} total</span>
        </div>
        <ScrollArea className="max-h-[calc(100vh-270px)] pr-1">
          <div className="space-y-2 pb-2">
            {conversations.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No conversations yet.
                <br />
                Start a new chat!
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() =>
                    editingId !== conversation.id && setActiveConversation(conversation.id)
                  }
                  className={cn(
                    'group relative flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5',
                    editingId !== conversation.id && 'cursor-pointer',
                    activeConversationId === conversation.id &&
                      'border-primary/50 bg-primary/10 shadow-[0_15px_40px_rgba(61,210,195,0.25)]'
                  )}
                >
                  {editingId === conversation.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(conversation.id);
                          if (e.key === 'Escape') handleCancelEdit(e as any);
                        }}
                        className="h-8 rounded-lg border-white/10 bg-background/40 text-sm"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0 border border-transparent hover:border-white/10"
                        onClick={() => handleSaveEdit(conversation.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0 border border-transparent hover:border-white/10"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        </div>
                        <span className="flex-1 truncate font-medium">{conversation.title}</span>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 border border-transparent hover:border-white/10"
                            onClick={(e) => handleStartEdit(conversation.id, conversation.title, e)}
                            title="Rename"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 border border-transparent hover:border-white/10"
                            onClick={(e) => handleExportConversation(conversation.id, e)}
                            title="Export"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 border border-transparent hover:border-white/10"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-white/5 px-2 py-1">
                          {conversation.messages.length} msgs
                        </span>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span>{formatDate(conversation.updatedAt)}</span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
