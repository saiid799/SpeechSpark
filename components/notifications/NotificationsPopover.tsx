import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, Settings, X, CheckCircle } from "lucide-react";
import { NotificationItem } from "@/types/notification";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  hasUnread: boolean;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  hasUnread,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { speak } = useSpeechSynthesis();

  // Optional: Speak notification when hovering
  const handleNotificationHover = (notification: NotificationItem) => {
    if (notification.learningLanguageText) {
      speak(notification.learningLanguageText, notification.learningLanguage);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/10"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white"
            >
              {notifications.filter((n) => !n.read).length}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-card/95 backdrop-blur-lg border border-primary/20"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={onClearAll}
            >
              Clear all
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 border-b border-border/10 hover:bg-primary/5 transition-colors relative group ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onMouseEnter={() => handleNotificationHover(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {notification.learningLanguageText}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.nativeLanguageText}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(
                            notification.timestamp
                          ).toLocaleTimeString()}
                        </span>
                        {notification.read && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Read
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
