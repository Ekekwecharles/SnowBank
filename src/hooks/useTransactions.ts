import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse, TransactionData } from "@/types";

interface TransactionFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  direction?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });

  return useQuery<PaginatedResponse<TransactionData>>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });
}
