"use client";

import { useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PinInput({ value, onChange, error, disabled }: PinInputProps) {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/, "").slice(-1);
    const arr = value.padEnd(4, "").split("");
    arr[i] = digit;
    const next = arr.join("").slice(0, 4);
    onChange(next);
    if (digit && i < 3) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={refs[i]}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            className={cn(
              "h-14 w-14 text-center text-2xl font-bold rounded-xl border-2 bg-muted text-foreground transition-all focus:outline-none",
              error ? "border-red-500" : "border-border focus:border-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`PIN digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
