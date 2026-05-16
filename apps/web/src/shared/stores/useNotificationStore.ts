import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'quest' | 'system' | 'reward' | 'social';
  isRead: boolean;
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: Notification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (title, message, type = 'system') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          notifications: [
            { id, title, message, type, isRead: false, createdAt: Date.now() },
            ...state.notifications,
          ].slice(0, 50), // Keep last 50
        }));
      },
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'sv-notifications',
    }
  )
);
