"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualCardProps {
  name: string;
}

export function VirtualCard({ name }: VirtualCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto" style={{ perspective: "1000px" }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1.586/1] cursor-pointer"
        onClick={() => setFlipped(f => !f)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #0a1628 0%, #1a2b4a 40%, #0f1f3d 70%, #1a0a2e 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex justify-between items-start mb-8">
            <span className="text-white font-bold text-lg tracking-wider">SNOWBANK</span>
            <span className="text-yellow-300 font-bold text-xl italic">VISA</span>
          </div>

          {/* Chip */}
          <div className="mb-6">
            <div className="w-10 h-8 rounded-md" style={{ background: "linear-gradient(135deg, #d4a843, #f0d060, #c49020)", opacity: 0.9 }}>
              <div className="h-full w-full rounded-md grid grid-cols-2 gap-px p-1 opacity-60">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-yellow-900/40 rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          <p className="text-white/70 font-mono text-sm tracking-[0.2em] mb-4">
            4521 •••• •••• 8834
          </p>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Card Holder</p>
              <p className="text-white font-medium uppercase tracking-wider text-sm">{name}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Expires</p>
              <p className="text-white font-medium text-sm">12/28</p>
            </div>
          </div>

          <div className="absolute bottom-3 right-4">
            <p className="text-white/20 text-xs">Tap to flip</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #0a1628 0%, #1a2b4a 40%, #0f1f3d 70%, #1a0a2e 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="h-10 bg-black/60 mt-8" />
          <div className="px-6 mt-4">
            <div className="h-10 bg-white/10 rounded flex items-center justify-end px-3 gap-2">
              <span className="text-white font-mono text-sm">{showCvv ? "123" : "•••"}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowCvv(v => !v); }}
                className="text-white/60 hover:text-white"
              >
                {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-white/40 text-xs mt-2">CVV</p>
          </div>
          <div className="px-6 mt-6">
            <p className="text-white/30 text-xs leading-relaxed">
              This card is issued by SnowBank and is governed by the terms and conditions of your card agreement.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
