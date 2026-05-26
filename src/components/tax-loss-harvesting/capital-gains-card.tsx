import { AlertTriangle, RefreshCw } from "lucide-react";

import { FinancialValue } from "@/components/ui/financial-value";
import { Skeleton } from "@/components/ui/skeleton";
import { HarvestSnapshot } from "@/lib/finance";
import { cn } from "@/lib/utils";

type CardMessageTone = "info" | "positive" | "neutral" | "negative";

type CapitalGainsCardProps = {
  title: string;
  label: string;
  gains: HarvestSnapshot;
  variant?: "dark" | "blue";
};

export function CapitalGainsCard({
  title,
  label,
  gains,
  variant = "dark",
}: CapitalGainsCardProps) {
  const isBlue = variant === "blue";

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[24px] border px-5 py-5 shadow-panel md:px-6 md:py-5",
        isBlue
          ? "border-[#4f88ff] bg-card-blue text-white"
          : "border-white/5 bg-[#151824] text-white",
      )}
    >
      <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] md:text-[1.75rem]">{title}</h2>
      <div className="mt-7 grid grid-cols-[1.2fr_1fr_1fr] gap-y-4 text-[13px] md:text-[15px]">
        <div />
        <div className="text-center font-medium text-white/90">Short-term</div>
        <div className="text-right font-medium text-white/90">Long-term</div>

        <div className="text-white/85">Profits</div>
        <FinancialValue amount={gains.shortTerm.profits} className="justify-center text-center" />
        <FinancialValue amount={gains.longTerm.profits} align="right" className="justify-end text-right" />

        <div className="text-white/85">Losses</div>
        <FinancialValue amount={gains.shortTerm.losses} className="justify-center text-center" />
        <FinancialValue amount={gains.longTerm.losses} align="right" className="justify-end text-right" />

        <div className="text-white/85">Net Capital Gains</div>
        <FinancialValue amount={gains.shortTerm.net} className="justify-center text-center" />
        <FinancialValue amount={gains.longTerm.net} align="right" className="justify-end text-right" />
      </div>

      <div className="mt-auto pt-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-white">
          <span className="text-[1.05rem] font-semibold leading-[1.1] md:text-[1.15rem]">{label}:</span>
          <FinancialValue
            amount={gains.realizedCapitalGains}
            align="right"
            className="justify-end text-right text-[1.6rem] font-bold leading-[1] tracking-[-0.04em] md:text-[1.95rem]"
          />
        </div>
      </div>
    </section>
  );
}

type CapitalGainsCardSkeletonProps = {
  variant?: "dark" | "blue";
};

export function CapitalGainsCardSkeleton({ variant = "dark" }: CapitalGainsCardSkeletonProps) {
  const isBlue = variant === "blue";

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[24px] border px-5 py-5 shadow-panel md:px-6 md:py-5",
        isBlue ? "border-[#4f88ff]/40 bg-[#2b7bff]" : "border-white/5 bg-[#151824]",
      )}
    >
      <Skeleton className="h-8 w-44" />
      <div className="mt-7 grid grid-cols-[1.2fr_1fr_1fr] gap-y-4">
        <Skeleton className="h-4 w-16 opacity-0" />
        <Skeleton className="mx-auto h-4 w-20" />
        <Skeleton className="ml-auto h-4 w-20" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="contents">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-end gap-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
    </section>
  );
}

type CapitalGainsCardErrorProps = {
  title: string;
  onRetry: () => void;
  message: string;
  variant?: "dark" | "blue";
};

export function CapitalGainsCardError({
  title,
  onRetry,
  message,
  variant = "dark",
}: CapitalGainsCardErrorProps) {
  const isBlue = variant === "blue";

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[24px] border px-5 py-5 shadow-panel md:px-6 md:py-5",
        isBlue ? "border-[#4f88ff]/40 bg-card-blue text-white" : "border-white/5 bg-[#151824] text-white",
      )}
    >
      <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] md:text-[1.75rem]">{title}</h2>
      <div className="mt-8 rounded-[20px] border border-white/12 bg-black/10 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd5db]" />
          <div>
            <p className="text-sm font-semibold">Capital gains unavailable</p>
            <p className="mt-1 text-sm leading-6 text-white/75">{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/15"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </section>
  );
}
