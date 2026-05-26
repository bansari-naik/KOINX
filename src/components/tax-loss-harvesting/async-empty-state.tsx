import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AsyncEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "error";
  compact?: boolean;
};

export function AsyncEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = "default",
  compact = false,
}: AsyncEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[22px] border border-dashed px-6 py-10 text-center",
        tone === "error"
          ? "border-red-500/20 bg-red-500/5 text-red-50"
          : "border-white/10 bg-white/[0.02] text-white",
        compact && "px-5 py-8",
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
          tone === "error" ? "bg-red-500/10 text-red-300" : "bg-[#1b2340] text-[#8cb1ff]",
        )}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 max-w-[460px] text-sm leading-6 text-white/70">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

