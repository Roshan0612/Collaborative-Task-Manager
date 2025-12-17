import React, { createContext, useContext, useMemo, useState } from 'react';

export type Notification = {
  id: string;
  message: string;
  createdAt: Date;
};

type NotificationsContextValue = {
  notifications: Notification[];
  addNotification: (message: string) => void;
  removeNotification: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [{ id, message, createdAt: new Date() }, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = useMemo(() => ({ notifications, addNotification, removeNotification }), [notifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white shadow border rounded p-3">
            <div className="text-sm">{n.message}</div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{n.createdAt.toLocaleTimeString()}</span>
              <button className="underline" onClick={() => removeNotification(n.id)}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
