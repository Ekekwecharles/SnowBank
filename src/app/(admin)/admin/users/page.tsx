"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, role, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/users?${params}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">User Management</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Search users..." />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-border bg-muted text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !data?.data?.length ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {["Name", "Email", "Account No", "Balance", "Role", "Status", "Joined"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((u: any) => (
                    <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-primary transition-colors">{u.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 font-mono text-xs">{u.accountNumber}</td>
                      <td className="px-4 py-3">{formatCurrency(u.balance)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", u.role === "admin" ? "bg-purple-500/10 text-purple-400" : "bg-muted text-muted-foreground")}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", u.isRestricted ? "bg-red-500/10 text-red-400" : u.isSuspended ? "bg-orange-500/10 text-orange-400" : "bg-green-500/10 text-green-400")}>
                          {u.isRestricted ? "Restricted" : u.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Page {page} of {data.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
