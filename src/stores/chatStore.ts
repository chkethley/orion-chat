import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Conversation, Message } from '@/types/chat';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  error: string | null;

  // Actions
  createConversation: (model: string) => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  updateMessageStreaming: (conversationId: string, messageId: string, isStreaming: boolean) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setError: (error: string | null) => void;
  clearConversations: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      error: null,

      createConversation: (model: string) => {
        const id = nanoid();
        const newConversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model,
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      setActiveConversation: (id: string) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId: string, messageData) => {
        const message: Message = {
          id: nanoid(),
          timestamp: Date.now(),
          ...messageData,
        };

        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const updatedConv = {
                ...conv,
                messages: [...conv.messages, message],
                updatedAt: Date.now(),
              };

              // Auto-generate title from first user message
              if (updatedConv.title === 'New Conversation' && message.role === 'user') {
                updatedConv.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
              }

              return updatedConv;
            }
            return conv;
          }),
        }));
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content } : msg
                ),
                updatedAt: Date.now(),
              };
            }
            return conv;
          }),
        }));
      },

      updateMessageStreaming: (conversationId: string, messageId: string, isStreaming: boolean) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, isStreaming } : msg
                ),
              };
            }
            return conv;
          }),
        }));
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const newConversations = state.conversations.filter((conv) => conv.id !== id);
          const newActiveId =
            state.activeConversationId === id
              ? newConversations[0]?.id || null
              : state.activeConversationId;

          return {
            conversations: newConversations,
            activeConversationId: newActiveId,
          };
        });
      },

      updateConversationTitle: (id: string, title: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
          ),
        }));
      },

      setStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearConversations: () => {
        set({ conversations: [], activeConversationId: null });
      },
    }),
    {
      name: 'orion-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);
