"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftRight, Phone, Zap, FileText } from "lucide-react";

const actions = [
  { label: "Transfer", href: "/transfer", icon: ArrowLeftRight, color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" },
  { label: "Airtime", href: "/airtime", icon: Phone, color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" },
  { label: "Pay Bills", href: "/bills", icon: Zap, color: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" },
  { label: "Statements", href: "/transactions", icon: FileText, color: "bg-green-500/10 text-green-400 hover:bg-green-500/20" },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map(({ label, href, icon: Icon, color }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Link
              href={href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${color}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
