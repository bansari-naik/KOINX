"use client";

import Image from "next/image";
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers3,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";

import { AsyncEmptyState } from "@/components/tax-loss-harvesting/async-empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { FinancialValue } from "@/components/ui/financial-value";
import { Skeleton } from "@/components/ui/skeleton";
import { toPreciseAmount } from "@/lib/finance";
import { formatUnits } from "@/lib/formatters";
import { getHoldingKey } from "@/lib/holdings";
import { Holding } from "@/lib/types";
import { cn } from "@/lib/utils";

export type HoldingsFilterMode = "all" | "harvestable" | "selected";

type HoldingsTableProps = {
  holdings: Holding[];
  totalHoldingsCount: number;
  selectedHoldingKeys: string[];
  onToggleCoin: (holdingKey: string) => void;
  onToggleAll: () => void;
  sortDirection: "asc" | "desc";
  onToggleSort: () => void;
  showAll: boolean;
  onToggleViewAll: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filterMode: HoldingsFilterMode;
  onFilterModeChange: (mode: HoldingsFilterMode) => void;
  loading?: boolean;
  showLoadingSkeleton?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isOffline?: boolean;
  emptyReason?: "portfolio" | "search" | "selection" | "filter";
  onClearFilters?: () => void;
};

const INITIAL_VISIBLE_ROWS = 6;

const filterOptions: Array<{ value: HoldingsFilterMode; label: string }> = [
  { value: "all", label: "All holdings" },
  { value: "harvestable", label: "Harvest candidates" },
  { value: "selected", label: "Selected" },
];

function HoldingsTableSkeleton() {
  return (
    <section className="rounded-[24px] border border-white/5 bg-[#151824] p-4 shadow-panel md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-28 rounded-full" />
          <Skeleton className="h-12 w-28 rounded-full" />
          <Skeleton className="h-12 w-24 rounded-full" />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/5">
        <div className="bg-[#0b0d16] px-4 py-4">
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[36px_1.7fr_1.2fr_1fr_1fr_1fr_1.1fr] gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-4"
            >
              <Skeleton className="h-5 w-5 rounded-md" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HoldingsTable({
  holdings,
  totalHoldingsCount,
  selectedHoldingKeys,
  onToggleCoin,
  onToggleAll,
  sortDirection,
  onToggleSort,
  showAll,
  onToggleViewAll,
  searchQuery,
  onSearchQueryChange,
  filterMode,
  onFilterModeChange,
  loading = false,
  showLoadingSkeleton = false,
  error,
  onRetry,
  isOffline = false,
  emptyReason = "portfolio",
  onClearFilters,
}: HoldingsTableProps) {
  const visibleRows = showAll ? holdings : holdings.slice(0, INITIAL_VISIBLE_ROWS);
  const allSelected = holdings.length > 0 && visibleRows.every((holding) => selectedHoldingKeys.includes(getHoldingKey(holding)));
  const canViewAll = holdings.length > INITIAL_VISIBLE_ROWS;

  if (loading && showLoadingSkeleton) {
    return <HoldingsTableSkeleton />;
  }

  return (
    <section className="rounded-[24px] border border-white/5 bg-[#151824] p-4 shadow-panel md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-white md:text-[1.55rem]">
            Holdings
          </h3>
          <p className="mt-1 text-sm text-[#93a3c7]">
            Showing {visibleRows.length} of {holdings.length} results from {totalHoldingsCount} holdings
          </p>
        </div>
        {canViewAll ? (
          <button
            type="button"
            onClick={onToggleViewAll}
            className="inline-flex w-fit self-start items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#cfe0ff] transition hover:border-white/20 hover:bg-white/10 md:self-auto"
          >
            {showAll ? "Show Less" : "View All"}
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101420] px-4 py-3">
          <Search className="h-4 w-4 text-[#89a5e6]" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search by asset or coin name"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7282a7]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterModeChange(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition",
                filterMode === option.value
                  ? "border-[#4b7cff] bg-[#183067] text-white"
                  : "border-white/10 bg-white/5 text-[#cfe0ff] hover:border-white/20 hover:bg-white/10",
              )}
            >
              {option.value === "all" ? <Layers3 className="h-4 w-4" /> : null}
              {option.value === "harvestable" ? <Filter className="h-4 w-4" /> : null}
              {option.value === "selected" ? <SlidersHorizontal className="h-4 w-4" /> : null}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !showLoadingSkeleton ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#cfe0ff]">
          Refreshing holdings and recalculating harvest view.
        </div>
      ) : null}

      {error ? (
        <div className="mt-5">
          <AsyncEmptyState
            icon={<RefreshCw className="h-5 w-5" />}
            title={isOffline ? "You appear to be offline" : "Could not load holdings"}
            description={
              isOffline
                ? "Check your internet connection and try again. Your gains cards can still load independently."
                : error
            }
            actionLabel="Retry holdings"
            onAction={onRetry}
            tone="error"
          />
        </div>
      ) : null}

      {!error && holdings.length === 0 ? (
        <div className="mt-5">
          {emptyReason === "portfolio" ? (
            <AsyncEmptyState
              icon={<Wallet className="h-5 w-5" />}
              title="Portfolio is empty"
              description="Once holdings are available, this table will surface assets, gains, and harvest candidates automatically."
            />
          ) : null}
          {emptyReason === "search" ? (
            <AsyncEmptyState
              icon={<Search className="h-5 w-5" />}
              title="No matching holdings"
              description="Try a different asset symbol or coin name. Your current search does not match any holdings."
              actionLabel="Clear search"
              onAction={onClearFilters}
            />
          ) : null}
          {emptyReason === "selection" ? (
            <AsyncEmptyState
              icon={<SlidersHorizontal className="h-5 w-5" />}
              title="No holdings selected"
              description="Select one or more rows to review how selling them affects your post-harvest capital gains."
              actionLabel="Show all holdings"
              onAction={onClearFilters}
            />
          ) : null}
          {emptyReason === "filter" ? (
            <AsyncEmptyState
              icon={<Filter className="h-5 w-5" />}
              title="Nothing matches this filter"
              description="The current filter removed all rows. Try a broader view or clear the active filters."
              actionLabel="Reset filters"
              onAction={onClearFilters}
            />
          ) : null}
        </div>
      ) : null}

      {!error && holdings.length > 0 ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="bg-[#0b0d16] text-left text-sm text-white">
                <tr>
                  <th className="w-14 px-4 py-4">
                    <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Select all holdings" />
                  </th>
                  <th className="px-4 py-4 font-medium">Asset</th>
                  <th className="px-4 py-4 font-medium">
                    Holdings
                    <span className="mt-1 block text-xs font-normal text-[#8c97b8]">Avg Buy Price</span>
                  </th>
                  <th className="px-4 py-4 font-medium">Current Price</th>
                  <th className="px-4 py-4 font-medium">
                    <button
                      type="button"
                      onClick={onToggleSort}
                      className="inline-flex items-center gap-2 text-left"
                    >
                      <ArrowUp className={cn("h-3.5 w-3.5 transition", sortDirection === "desc" && "rotate-180")} />
                      Short-Term
                    </button>
                  </th>
                  <th className="px-4 py-4 font-medium">Long-Term</th>
                  <th className="px-4 py-4 font-medium">Amount to Sell</th>
                </tr>
              </thead>
              <tbody className="bg-[#151824]">
                {visibleRows.map((holding) => {
                  const holdingKey = getHoldingKey(holding);
                  const isSelected = selectedHoldingKeys.includes(holdingKey);
                  const shortTermClass = holding.stcg.gain >= 0 ? "text-positive" : "text-negative";
                  const longTermClass = holding.ltcg.gain >= 0 ? "text-positive" : "text-negative";

                  return (
                    <tr
                      key={holdingKey}
                      className={cn(
                        "border-t border-white/6 transition",
                        isSelected ? "bg-[#17264d]" : "hover:bg-white/[0.03]",
                      )}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleCoin(holdingKey)}
                          aria-label={`Select ${holding.coin} ${holding.coinName}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10">
                            <Image
                              src={holding.logo}
                              alt={holding.coinName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <p className="max-w-[180px] truncate text-[15px] font-medium text-white md:max-w-[220px]">
                              {holding.coin}
                            </p>
                            <p className="max-w-[180px] truncate text-sm text-[#9aa7c7] md:max-w-[220px]">
                              {holding.coinName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-white">
                        <p className="text-[15px] font-medium">{formatUnits(holding.totalHolding, holding.coin)}</p>
                        <p className="mt-1 text-sm text-[#9aa7c7]">
                          <FinancialValue amount={toPreciseAmount(holding.averageBuyPrice)} align="left" />
                          <span>{` / ${holding.coin}`}</span>
                        </p>
                      </td>
                      <td className="px-4 py-4 text-[15px] font-medium text-white">
                        <FinancialValue amount={toPreciseAmount(holding.currentPrice)} align="left" />
                      </td>
                      <td className="px-4 py-4">
                        <FinancialValue
                          amount={toPreciseAmount(holding.stcg.gain)}
                          align="left"
                          className={cn("text-[15px] font-semibold", shortTermClass)}
                        />
                        <p className="mt-1 text-sm text-[#9aa7c7]">{formatUnits(holding.stcg.balance, holding.coin)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <FinancialValue
                          amount={toPreciseAmount(holding.ltcg.gain)}
                          align="left"
                          className={cn("text-[15px] font-semibold", longTermClass)}
                        />
                        <p className="mt-1 text-sm text-[#9aa7c7]">{formatUnits(holding.ltcg.balance, holding.coin)}</p>
                      </td>
                      <td className="px-4 py-4 text-[15px] font-medium text-white">
                        {isSelected ? formatUnits(holding.totalHolding, holding.coin) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
