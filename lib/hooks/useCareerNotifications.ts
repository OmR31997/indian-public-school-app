"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export interface CareerNotificationRecord extends Record<string, unknown> {
  id?: string;
  publicId?: string;
  _id?: string;
  applicationNo?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  postTitle?: string;
  isRead?: boolean;
  status?: string;
  createdAt?: string;
}

export interface CareerNotificationState {
  unreadCount: number;
  unreadNotifications: CareerNotificationRecord[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useCareerNotifications(
  apiUrl: string,
  token?: string,
  applicationsData?: Record<string, unknown>[],
  onApplicationsUpdated?: () => void
): CareerNotificationState {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<CareerNotificationRecord[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const refreshNotifications = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    try {
      const headers = tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
      const res = await axios.get(`${apiUrl}/careers/applications/notifications/unread`, { headers });
      const body = res.data;
      let count = 0;
      let itemsList: CareerNotificationRecord[] = [];

      if (body) {
        if (typeof body.unreadCount === "number") {
          count = body.unreadCount;
        } else if (body.data && typeof (body.data as any).unreadCount === "number") {
          count = (body.data as any).unreadCount;
        }

        if (Array.isArray(body.items)) {
          itemsList = body.items;
        } else if (body.data && Array.isArray((body.data as any).items)) {
          itemsList = (body.data as any).items;
        } else if (Array.isArray(body.data)) {
          itemsList = body.data;
        }

        if (count === 0 && itemsList.length > 0) {
          count = itemsList.length;
        }
      }

      setUnreadCount(count);
      setUnreadNotifications(itemsList);
    } catch {
      if (applicationsData && Array.isArray(applicationsData)) {
        const unread = (applicationsData as CareerNotificationRecord[]).filter((app) => !app.isRead);
        setUnreadCount(unread.length);
        setUnreadNotifications(unread);
      }
    }
  }, [apiUrl, applicationsData]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        const headers = tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
        await axios.patch(`${apiUrl}/careers/applications/${id}/status`, { isRead: true }, { headers });

        setUnreadNotifications((prev) =>
          prev.filter((item) => String(item.id || item._id || item.publicId) !== id)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        if (onApplicationsUpdated) onApplicationsUpdated();
      } catch (err) {
        console.error("Failed to mark application as read:", err);
      }
    },
    [apiUrl, onApplicationsUpdated]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const headers = tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
      await axios.patch(`${apiUrl}/careers/applications/notifications/mark-all-read`, {}, { headers });

      setUnreadNotifications([]);
      setUnreadCount(0);

      if (onApplicationsUpdated) onApplicationsUpdated();
    } catch (err) {
      console.error("Failed to mark all applications as read:", err);
    }
  }, [apiUrl, onApplicationsUpdated]);

  useEffect(() => {
    void refreshNotifications();

    const handleFocus = () => {
      void refreshNotifications();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshNotifications();
      }
    };

    const interval = setInterval(() => {
      if (!document.hidden) {
        void refreshNotifications();
      }
    }, 60000);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshNotifications]);

  return {
    unreadCount,
    unreadNotifications,
    isNotificationOpen,
    setIsNotificationOpen,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}
