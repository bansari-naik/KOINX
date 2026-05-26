"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

type ValueTooltipProps = {
  children: React.ReactNode;
  tooltip: string;
  align?: "left" | "center" | "right";
  className?: string;
};

export function ValueTooltip({
  children,
  tooltip,
  align = "center",
  className,
}: ValueTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span tabIndex={0} aria-describedby={tooltipId} className="inline-flex cursor-default outline-none">
        {children}
      </span>
      <AnimatePresence>
        {open ? (
          <motion.span
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "pointer-events-none absolute z-30 whitespace-nowrap rounded-xl border border-[#d9deea] bg-white px-3 py-2 font-mono text-xs font-medium tabular-nums text-[#11131a] shadow-[0_16px_40px_rgba(0,0,0,0.22)]",
              align === "left" && "bottom-full left-0 mb-2",
              align === "center" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
              align === "right" && "bottom-full right-0 mb-2",
            )}
          >
            {tooltip}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
