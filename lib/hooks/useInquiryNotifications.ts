"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export interface NotificationRecord extends Record<string, unknown> {
  id?: string;
  publicId?: string;
  _id?: string;
  name?: string;
  inquiryType?: string;
  email?: string;
  contact?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface InquiryNotificationState {
  unreadCount: number;
  unreadNotifications: NotificationRecord[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

/**
 * Custom React hook following SOLID principles for Inquiry Notifications.
 *
 * Responsibilities:
 * 1. Single Responsibility: Manages notification state, HTTP sync, and optimistic UI updates.
 * 2. High Performance & Zero Extra Server Load:
 *    - Automatically pauses polling when browser tab is inactive (`document.hidden`).
 *    - Instantly triggers an update when tab regains focus (`window.onfocus`).
 *    - Uses a gentle 60s fallback interval while tab is actively focused.
 * 3. Dependable State Syncing: Fallback parsing for NestJS TransformInterceptor response format.
 */
export function useInquiryNotifications(
  apiUrl: string,
  token?: string,
  inquiriesData?: Record<string, unknown>[],
  onInquiriesUpdated?: () => void
): InquiryNotificationState {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationRecord[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const refreshNotifications = useCallback(async () => {
    // 🛑 Zero Server Load: Skip HTTP requests completely if browser tab is hidden/inactive
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    try {
      const res = await axios.get(`${apiUrl}/inquiries/notifications/unread`);
      const body = res.data;
      let count = 0;
      let itemsList: NotificationRecord[] = [];

      if (body) {
        if (typeof body.unreadCount === "number") {
          count = body.unreadCount;
        } else if (body.meta && typeof body.meta.unreadCount === "number") {
          count = body.meta.unreadCount;
        }

        if (Array.isArray(body.items)) {
          itemsList = body.items;
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
      // Fallback: Derivation from loaded inquiries dataset
      if (inquiriesData && Array.isArray(inquiriesData)) {
        const unread = (inquiriesData as NotificationRecord[]).filter((inq) => !inq.isRead);
        setUnreadCount(unread.length);
        setUnreadNotifications(unread);
      }
    }
  }, [apiUrl, inquiriesData]);

  const markAsRead = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const headers = tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
      await axios.patch(`${apiUrl}/inquiries/${id}`, { isRead: true }, { headers });

      // Optimistic local state update (0 delay)
      setUnreadNotifications((prev) => prev.filter((item) => String(item.id || item._id || item.publicId) !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (onInquiriesUpdated) onInquiriesUpdated();
    } catch (err) {
      console.error("Failed to mark inquiry as read:", err);
    }
  }, [apiUrl, onInquiriesUpdated]);

  const markAllAsRead = useCallback(async () => {
    try {
      const headers = tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
      await axios.patch(`${apiUrl}/inquiries/mark-all-read`, {}, { headers });

      // Optimistic local state update (0 delay)
      setUnreadNotifications([]);
      setUnreadCount(0);

      if (onInquiriesUpdated) onInquiriesUpdated();
    } catch (err) {
      console.error("Failed to mark all inquiries as read:", err);
    }
  }, [apiUrl, onInquiriesUpdated]);

  // Smart Visibility-Aware Event Listeners & Gentle Polling
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

    // 60s polling interval ONLY when user is actively looking at tab
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

  // Derived state sync when inquiries data changes in parent component
  useEffect(() => {
    if (inquiriesData && Array.isArray(inquiriesData)) {
      const unread = (inquiriesData as NotificationRecord[]).filter((inq) => !inq.isRead);
      if (unread.length > 0) {
        setUnreadCount((prev) => Math.max(prev, unread.length));
      }
    }
  }, [inquiriesData]);

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
