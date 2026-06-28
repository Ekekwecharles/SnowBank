"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
      {(["light", "dark", "system"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs capitalize transition-colors",
            theme === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`Set ${t} theme`}
        >
          {t === "light" && <Sun className="h-3 w-3" />}
          {t === "dark" && <Moon className="h-3 w-3" />}
          {t === "system" && <Monitor className="h-3 w-3" />}
          <span className="hidden sm:inline">{t}</span>
        </button>
      ))}
    </div>
  );
}
