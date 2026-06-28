import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationData } from "@/types";

export function useNotifications() {
  return useQuery<NotificationData[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids ? { ids } : { markAll: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: async (ids) => {
      await qc.cancelQueries();
      const prev = qc.getQueryData<NotificationData[]>(["notifications"]);
      qc.setQueryData<NotificationData[]>(["notifications"], (old) =>
        old?.map((n) => (!ids || ids.includes(n.id) ? { ...n, isRead: true } : n)) ?? []
      );
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) qc.setQueryData(["notifications"], ctx.prev);
    },
  });
}
