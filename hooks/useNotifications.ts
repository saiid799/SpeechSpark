import { useState, useEffect, useCallback } from "react";
import { NotificationItem } from "@/types/notification";
import { toast } from "react-hot-toast";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
      setHasUnread(
        data.some((notification: NotificationItem) => !notification.read)
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotification = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create notification");
      const newNotification = await response.json();
      setNotifications((prev) => [newNotification, ...prev]);
      setHasUnread(true);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });
        if (!response.ok)
          throw new Error("Failed to mark notification as read");

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );

        // Check if there are any remaining unread notifications
        setHasUnread(() =>
          notifications.some(
            (notification) =>
              notification.id !== notificationId && !notification.read
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to update notification");
      }
    },
    [notifications]
  );

  const clearAll = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to clear notifications");
      setNotifications([]);
      setHasUnread(false);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up interval for daily notifications
  useEffect(() => {
    // Check if it's a new day since last notification
    const checkAndCreateNotification = async () => {
      const lastNotification = notifications[0];
      if (!lastNotification) {
        await createNotification();
        return;
      }

      const lastNotificationDate = new Date(lastNotification.timestamp);
      const now = new Date();

      if (
        lastNotificationDate.getDate() !== now.getDate() ||
        lastNotificationDate.getMonth() !== now.getMonth() ||
        lastNotificationDate.getFullYear() !== now.getFullYear()
      ) {
        await createNotification();
      }
    };

    checkAndCreateNotification();

    // Set up daily check
    const interval = setInterval(checkAndCreateNotification, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, [notifications, createNotification]);

  return {
    notifications,
    hasUnread,
    loading,
    markAsRead,
    clearAll,
    createNotification,
    fetchNotifications,
  };
};
