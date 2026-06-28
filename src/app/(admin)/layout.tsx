"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Receipt, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") router.push("/dashboard");
  }, [status, session, router]);

  if (status === "loading" || !session) return null;
  if ((session.user as any).role !== "admin") return null;

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    toast.success("Signed out");
  };

  const nav = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <span className="text-sm font-bold">SnowBank Admin</span>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", active ? "bg-purple-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          );
        })}
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <LayoutDashboard className="h-4 w-4" />User Dashboard
        </Link>
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut className="h-4 w-4" />Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">{nav}</aside>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25 }} className="fixed left-0 top-0 z-50 flex flex-col w-64 bg-card h-screen lg:hidden shadow-2xl">{nav}</motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted"><Menu className="h-5 w-5" /></button>
          <span className="text-sm font-semibold text-purple-400">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
