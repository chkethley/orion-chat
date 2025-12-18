import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  apiKey: string | null;
  selectedModel: string;
  availableModels: string[];

  // Actions
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKey: null,
      selectedModel: 'openai/gpt-4',
      availableModels: [
        'openai/gpt-4',
        'openai/gpt-4-turbo',
        'openai/gpt-3.5-turbo',
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3-opus',
        'google/gemini-pro',
        'meta-llama/llama-3.1-70b-instruct',
      ],

      setApiKey: (key: string) => {
        set({ apiKey: key });
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model });
      },

      setAvailableModels: (models: string[]) => {
        set({ availableModels: models });
      },
    }),
    {
      name: 'orion-settings-storage',
    }
  )
);
