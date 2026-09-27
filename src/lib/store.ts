import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface UserPersona {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  appearance?: string;
  gender?: string;
  age?: string;
  basicInfo: string;
}

export interface AppState {
  likedBots: string[];
  toggleLike: (botId: string) => void;
  botStats: Record<string, { chatCount: number, likesCount: number }>;
  subscribeToBotStats: (botId: string) => () => void;
  resetState: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      likedBots: [],
      toggleLike: (botId) => {
        set((state) => {
          const isLiked = state.likedBots.includes(botId);
          const newLikes = isLiked
            ? state.likedBots.filter((id) => id !== botId)
            : [...state.likedBots, botId];
          
          const currentStats = state.botStats[botId] || { chatCount: 0, likesCount: 0 };
          const newStats = {
            ...state.botStats,
            [botId]: {
              ...currentStats,
              likesCount: Math.max(0, currentStats.likesCount + (isLiked ? -1 : 1))
            }
          };

          return { likedBots: newLikes, botStats: newStats };
        });
      },
      botStats: {},
      subscribeToBotStats: (botId) => {
        // No-op for local gallery mode
        return () => {};
      },
      resetState: () => set({
        likedBots: [],
        botStats: {},
      }),
    }),
    {
      name: 'meimeicorner-storage-gallery',
      version: 5,
    }
  )
);
