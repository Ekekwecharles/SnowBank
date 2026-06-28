"use client";

import { Bell, X, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  transaction: "bg-blue-500",
  security: "bg-red-500",
  system: "bg-purple-500",
  promo: "bg-green-500",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const { mutate: markRead } = useMarkNotificationsRead();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm">Notifications</span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={() => markRead(undefined)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Check className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <div className={cn("mt-1 h-2 w-2 rounded-full flex-shrink-0", typeColors[n.type] ?? "bg-gray-400")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
