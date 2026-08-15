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

interface MemoryStore