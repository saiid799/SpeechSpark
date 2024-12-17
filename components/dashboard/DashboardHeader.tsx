import React from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import { useNotifications } from "@/hooks/useNotifications";

const DashboardHeader = () => {
  const { user } = useUser();
  const { notifications, hasUnread, markAsRead, clearAll } = useNotifications();

  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">
            Good {timeOfDay()},{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              {user?.firstName || "there"}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your learning progress
          </p>
        </motion.div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 bg-background/50 border-foreground/10 focus:border-primary/50"
            />
          </div>
          <NotificationsPopover
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onClearAll={clearAll}
            hasUnread={hasUnread}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
