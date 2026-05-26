"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, WifiOff, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastTone = "error" | "warning" | "success";

export type ToastItem = {
  id: number;
  title: string;
  description: string;
  tone: ToastTone;
};

type ToastRegionProps = {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
};

const toneMap = {
  error: {
    icon: AlertTriangle,
    className: "border-red-500/20 bg-[#25131a] text-red-50",
    iconClassName: "text-red-300",
  },
  warning: {
    icon: WifiOff,
    className: "border-amber-500/20 bg-[#241a0f] text-amber-50",
    iconClassName: "text-amber-300",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/20 bg-[#102119] text-emerald-50",
    iconClassName: "text-emerald-300",
  },
};

export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toneMap[toast.tone];
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.34)] backdrop-blur",
                config.className,
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClassName)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="mt-1 text-xs leading-5 opacity-85">{toast.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="rounded-full p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

