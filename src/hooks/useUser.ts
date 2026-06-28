import { useQuery } from "@tanstack/react-query";
import type { UserData } from "@/types";

export function useUser() {
  return useQuery<UserData>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
