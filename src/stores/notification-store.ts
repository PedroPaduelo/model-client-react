import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Notification, NotificationPriority } from '@/types/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
  updateNotification: (id: number, updates: Partial<Notification>) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now(), // ID temporário para notificações locais
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => {
          const updated = [newNotification, ...state.notifications];
          const unreadCount = updated.filter(n => !n.is_read).length;

          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      removeNotification: (id) => {
        set((state) => {
          const updated = state.notifications.filter(n => n.id !== id);
          const unreadCount = updated.filter(n => !n.is_read).length;

          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
          );
          const unreadCount = updated.filter(n => !n.is_read).length;

          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        set({
          notifications,
          unreadCount,
        });
      },

      updateNotification: (id, updates) => {
        set((state) => {
          const updated = state.notifications.map(n =>
            n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
          );
          const unreadCount = updated.filter(n => !n.is_read).length;

          return {
            notifications: updated,
            unreadCount,
          };
        });
      },
    }),
    {
      name: 'notification-store',
    }
  )
);

// Hook para mostrar notificações toast
export function useToastNotifications() {
  const { addNotification } = useNotificationStore();

  const showSuccess = (title: string, message?: string, options?: {
    projectId?: number;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }) => {
    addNotification({
      title,
      message: message || '',
      priority: NotificationPriority.BAIXA,
      is_read: false,
      user_id: '', // Será preenchido pela API
      ...options,
    });
  };

  const showError = (title: string, message?: string, options?: {
    projectId?: number;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }) => {
    addNotification({
      title,
      message: message || '',
      priority: NotificationPriority.ALTA,
      is_read: false,
      user_id: '', // Será preenchido pela API
      ...options,
    });
  };

  const showWarning = (title: string, message?: string, options?: {
    projectId?: number;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }) => {
    addNotification({
      title,
      message: message || '',
      priority: NotificationPriority.MEDIA,
      is_read: false,
      user_id: '', // Será preenchido pela API
      ...options,
    });
  };

  const showInfo = (title: string, message?: string, options?: {
    projectId?: number;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }) => {
    addNotification({
      title,
      message: message || '',
      priority: NotificationPriority.BAIXA,
      is_read: false,
      user_id: '', // Será preenchido pela API
      ...options,
    });
  };

  const showUrgent = (title: string, message?: string, options?: {
    projectId?: number;
    metadata?: Record<string, any>;
  }) => {
    addNotification({
      title,
      message: message || '',
      priority: NotificationPriority.URGENTE,
      is_read: false,
      user_id: '', // Será preenchido pela API
      ...options,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showUrgent,
  };
}

export default useNotificationStore;