import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export type MemoryKind = 'fact' | 'preference' | 'goal' | 'episode';

export interface OrionMemory {
  id: string;
  kind: MemoryKind;
  content: string;
  sourceConversationId: string;
  importance: number;
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
}

interface MemoryStore {
  memories: OrionMemory[];
  addMemory: (
    memory: Omit<OrionMemory, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount'>
  ) => string | null;
  learnFromMessage: (conversationId: string, message: string) => OrionMemory[];
  retrieveMemories: (query: string, limit?: number) => OrionMemory[];
  forgetMemory: (id: string) => void;
  clearMemories: () => void;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'than', 'to', 'of', 'in', 'on', 'at',
  'for', 'from', 'with', 'about', 'into', 'through', 'after', 'before', 'is', 'am', 'are', 'was',
  'were', 'be', 'been', 'being', 'it', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'mine',
  'you', 'your', 'we', 'our', 'they', 'them', 'he', 'she', 'do', 'does', 'did', 'have', 'has',
  'had', 'can', 'could', 'would', 'should', 'will', 'just', 'really', 'very', 'so', 'some', 'any',
]);

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9'\s-]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

function classifySentence(sentence: string): MemoryKind | null {
  const text = sentence.toLowerCase();

  if (/\b(my goal|i want to|i'm trying to|i am trying to|i plan to|i hope to|i need to build|i want my)\b/.test(text)) {
    return 'goal';
  }

  if (/\b(i prefer|i like|i love|i hate|i enjoy|my favorite|i don't like|i do not like)\b/.test(text)) {
    return 'preference';
  }

  if (/\b(my name is|i am|i'm|i have|i've|i work|i live|i use|i own|my job|my age|i was born)\b/.test(text)) {
    return 'fact';
  }

  if (/\b(today|yesterday|last night|last week|last month|earlier|when i|this morning|tonight)\b/.test(text)) {
    return 'episode';
  }

  return null;
}

function estimateImportance(sentence: string, kind: MemoryKind): number {
  let score = kind === 'goal' ? 0.82 : kind === 'preference' ? 0.72 : kind === 'fact' ? 0.68 : 0.55;
  const text = sentence.toLowerCase();

  if (/\b(important|always|never|deeply|major|biggest|main goal|remember)\b/.test(text)) score += 0.12;
  if (sentence.length > 160) score += 0.04;

  return Math.min(1, score);
}

function extractCandidates(message: string): Array<{ kind: MemoryKind; content: string; importance: number }> {
  const normalized = normalize(message);
  if (!normalized) return [];

  const sentences = normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map(normalize)
    .filter((sentence) => sentence.length >= 8 && sentence.length <= 320);

  const candidates: Array<{ kind: MemoryKind; content: string; importance: number }> = [];

  for (const sentence of sentences) {
    const kind = classifySentence(sentence);
    if (!kind) continue;

    candidates.push({
      kind,
      content: sentence,
      importance: estimateImportance(sentence, kind),
    });
  }

  return candidates.slice(0, 5);
}

function similarity(query: string, memory: OrionMemory): number {
  const queryTokens = tokenize(query);
  const memoryTokens = tokenize(memory.content);
  if (queryTokens.size === 0 || memoryTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of queryTokens) {
    if (memoryTokens.has(token)) overlap += 1;
  }

  const lexical = overlap / Math.sqrt(queryTokens.size * memoryTokens.size);
  const ageDays = Math.max(0, Date.now() - memory.createdAt) / 86_400_000;
  const recency = 1 / (1 + ageDays / 30);
  const familiarity = Math.min(1, Math.log2(memory.accessCount + 2) / 5);

  return lexical * 0.68 + memory.importance * 0.2 + recency * 0.08 + familiarity * 0.04;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: [],

      addMemory: (memoryData) => {
        const content = normalize(memoryData.content);
        if (!content) return null;

        const duplicate = get().memories.find(
          (memory) => memory.content.toLowerCase() === content.toLowerCase()
        );

        if (duplicate) return duplicate.id;

        const now = Date.now();
        const memory: OrionMemory = {
          id: nanoid(),
          ...memoryData,
          content,
          createdAt: now,
          lastAccessedAt: now,
          accessCount: 0,
        };

        set((state) => ({ memories: [memory, ...state.memories].slice(0, 2_000) }));
        return memory.id;
      },

      learnFromMessage: (conversationId, message) => {
        const learned: OrionMemory[] = [];

        for (const candidate of extractCandidates(message)) {
          const beforeIds = new Set(get().memories.map((memory) => memory.id));
          const id = get().addMemory({
            ...candidate,
            sourceConversationId: conversationId,
          });

          if (!id || beforeIds.has(id)) continue;
          const memory = get().memories.find((item) => item.id === id);
          if (memory) learned.push(memory);
        }

        return learned;
      },

      retrieveMemories: (query, limit = 8) => {
        const ranked = get().memories
          .map((memory) => ({ memory, score: similarity(query, memory) }))
          .filter(({ score }) => score >= 0.12)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(({ memory }) => memory);

        if (ranked.length > 0) {
          const accessed = new Set(ranked.map((memory) => memory.id));
          const now = Date.now();
          set((state) => ({
            memories: state.memories.map((memory) =>
              accessed.has(memory.id)
                ? { ...memory, lastAccessedAt: now, accessCount: memory.accessCount + 1 }
                : memory
            ),
          }));
        }

        return ranked;
      },

      forgetMemory: (id) => {
        set((state) => ({ memories: state.memories.filter((memory) => memory.id !== id) }));
      },

      clearMemories: () => set({ memories: [] }),
    }),
    {
      name: 'orion-memory-storage-v1',
      partialize: (state) => ({ memories: state.memories }),
    }
  )
);

export function formatMemoriesForPrompt(memories: OrionMemory[]): string {
  if (memories.length === 0) return '';

  const lines = memories.map(
    (memory) => `- [${memory.kind}] ${memory.content}`
  );

  return [
    'Relevant long-term memories from earlier interactions:',
    ...lines,
    '',
    'Use these only when relevant. Treat them as fallible remembered context, not unquestionable truth.',
    'Never pretend to remember details that are not present here or in the current conversation.',
  ].join('\n');
}
