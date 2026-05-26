"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BarChart3, SearchX } from "lucide-react";

import {
  CapitalGainsCard,
  CapitalGainsCardError,
  CapitalGainsCardSkeleton,
} from "@/components/tax-loss-harvesting/capital-gains-card";
import { DisclaimerAccordion } from "@/components/tax-loss-harvesting/disclaimer-accordion";
import {
  HoldingsFilterMode,
  HoldingsTable,
} from "@/components/tax-loss-harvesting/holdings-table";
import { ToastItem, ToastRegion, ToastTone } from "@/components/ui/toast-region";
import {
  calculateHarvestMetrics,
  normalizeCapitalGainsInput,
  preciseAdd,
  preciseCompare,
  toPreciseAmount,
} from "@/lib/finance";
import { formatSavings } from "@/lib/formatters";
import { getHoldingKey } from "@/lib/holdings";
import { ApiCapitalGainsResponse, CapitalGains, Holding } from "@/lib/types";
import { useDelayedVisibility } from "@/lib/use-delayed-visibility";

type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type SortDirection = "asc" | "desc";

const HOW_IT_WORKS = [
  "See your capital gains for FY 2024-25 in the left card.",
  "Check boxes for assets you plan on selling to reduce your tax liability.",
  "Instantly see your updated tax liability in the right card.",
];

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function mapCapitalGainsResponse(payload: ApiCapitalGainsResponse): CapitalGains {
  return normalizeCapitalGainsInput({
    shortTerm: payload?.capitalGains?.stcg,
    longTerm: payload?.capitalGains?.ltcg,
  });
}

export function TaxHarvestingDashboard() {
  const [holdingsState, setHoldingsState] = useState<ResourceState<Holding[]>>({
    data: null,
    loading: true,
    error: null,
  });
  const [capitalGainsState, setCapitalGainsState] = useState<ResourceState<CapitalGains>>({
    data: null,
    loading: true,
    error: null,
  });
  const [selectedHoldingKeys, setSelectedHoldingKeys] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showAll, setShowAll] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<HoldingsFilterMode>("all");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const toastId = useRef(0);

  const showHoldingsSkeleton = useDelayedVisibility(holdingsState.loading && !holdingsState.data, 180);
  const showCapitalGainsSkeleton = useDelayedVisibility(
    capitalGainsState.loading && !capitalGainsState.data,
    180,
  );

  const pushToast = useCallback((title: string, description: string, tone: ToastTone) => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const fetchHoldings = useCallback(
    async (preserveData = false) => {
      setHoldingsState((current) => ({
        data: preserveData ? current.data : current.data,
        loading: true,
        error: null,
      }));

      try {
        const response = await fetch("/api/holdings");
        if (!response.ok) {
          throw new Error("Holdings service is temporarily unavailable.");
        }

        const payload: Holding[] = await response.json();
        setHoldingsState({
          data: payload,
          loading: false,
          error: null,
        });
      } catch (error) {
        const message = normalizeError(
          error,
          "We could not refresh your holdings right now. Please try again.",
        );
        setHoldingsState((current) => ({
          data: current.data,
          loading: false,
          error: message,
        }));
        pushToast("Holdings sync failed", message, isOffline ? "warning" : "error");
      }
    },
    [isOffline, pushToast],
  );

  const fetchCapitalGains = useCallback(
    async (preserveData = false) => {
      setCapitalGainsState((current) => ({
        data: preserveData ? current.data : current.data,
        loading: true,
        error: null,
      }));

      try {
        const response = await fetch("/api/capital-gains");
        if (!response.ok) {
          throw new Error("Capital gains service is temporarily unavailable.");
        }

        const payload: ApiCapitalGainsResponse = await response.json();
        setCapitalGainsState({
          data: mapCapitalGainsResponse(payload),
          loading: false,
          error: null,
        });
      } catch (error) {
        const message = normalizeError(
          error,
          "We could not load capital gains right now. Please try again.",
        );
        setCapitalGainsState((current) => ({
          data: current.data,
          loading: false,
          error: message,
        }));
        pushToast("Capital gains sync failed", message, isOffline ? "warning" : "error");
      }
    },
    [isOffline, pushToast],
  );

  useEffect(() => {
    fetchHoldings();
    fetchCapitalGains();
  }, [fetchCapitalGains, fetchHoldings]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsOffline(!window.navigator.onLine);

    function handleOffline() {
      setIsOffline(true);
      pushToast(
        "You are offline",
        "Live portfolio refresh is paused until your connection is restored.",
        "warning",
      );
    }

    function handleOnline() {
      setIsOffline(false);
      pushToast("Connection restored", "Portfolio data is available again.", "success");
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [pushToast]);

  useEffect(() => {
    const validKeys = new Set((holdingsState.data ?? []).map((holding) => getHoldingKey(holding)));
    setSelectedHoldingKeys((current) => current.filter((key) => validKeys.has(key)));
  }, [holdingsState.data]);

  useEffect(() => {
    setShowAll(false);
  }, [searchQuery, filterMode]);

  const holdings = holdingsState.data ?? [];
  const selectedKeySet = useMemo(() => new Set(selectedHoldingKeys), [selectedHoldingKeys]);

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const left = preciseAdd(toPreciseAmount(a?.stcg?.gain), toPreciseAmount(a?.ltcg?.gain));
      const right = preciseAdd(toPreciseAmount(b?.stcg?.gain), toPreciseAmount(b?.ltcg?.gain));
      return sortDirection === "desc" ? preciseCompare(right, left) : preciseCompare(left, right);
    });
  }, [holdings, sortDirection]);

  const selectedHoldings = useMemo(() => {
    return sortedHoldings.filter((holding) => selectedKeySet.has(getHoldingKey(holding)));
  }, [selectedKeySet, sortedHoldings]);

  const filteredHoldings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortedHoldings.filter((holding) => {
      const matchesFilter =
        filterMode === "all"
          ? true
          : filterMode === "selected"
            ? selectedKeySet.has(getHoldingKey(holding))
            : preciseCompare(
                preciseAdd(toPreciseAmount(holding?.stcg?.gain), toPreciseAmount(holding?.ltcg?.gain)),
                0n,
              ) < 0;

      const matchesSearch =
        !query ||
        holding.coin.toLowerCase().includes(query) ||
        holding.coinName.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filterMode, searchQuery, selectedKeySet, sortedHoldings]);

  const harvestMetrics = useMemo(() => {
    if (!capitalGainsState.data) {
      return null;
    }

    return calculateHarvestMetrics(capitalGainsState.data, selectedHoldings);
  }, [capitalGainsState.data, selectedHoldings]);

  const holdingsEmptyReason = useMemo(() => {
    if (holdings.length === 0) {
      return "portfolio" as const;
    }

    if (searchQuery.trim()) {
      return "search" as const;
    }

    if (filterMode === "selected" && selectedHoldingKeys.length === 0) {
      return "selection" as const;
    }

    return "filter" as const;
  }, [filterMode, holdings.length, searchQuery, selectedHoldingKeys.length]);

  const afterHarvestingFooterMessage = useMemo(() => {
    if (!harvestMetrics) {
      return null;
    }

    if (selectedHoldings.length === 0) {
      return {
        tone: "info" as const,
        text: "Select holdings to preview how harvesting changes your realised capital gains.",
      };
    }

    if (harvestMetrics.taxImpact.state === "positive") {
      return {
        tone: "positive" as const,
        text: `${harvestMetrics.taxImpact.message} ${formatSavings(harvestMetrics.taxImpact.savings)}`,
      };
    }

    if (harvestMetrics.taxImpact.state === "negative") {
      return {
        tone: "negative" as const,
        text: harvestMetrics.taxImpact.message,
      };
    }

    return {
      tone: "neutral" as const,
      text: harvestMetrics.taxImpact.message,
    };
  }, [harvestMetrics, selectedHoldings.length]);

  function handleToggleCoin(holdingKey: string) {
    setSelectedHoldingKeys((current) => {
      const next = new Set(current);
      if (next.has(holdingKey)) {
        next.delete(holdingKey);
      } else {
        next.add(holdingKey);
      }

      return Array.from(next);
    });
  }

  function handleToggleAll() {
    const filteredKeys = filteredHoldings.map((holding) => getHoldingKey(holding));
    const everyFilteredSelected =
      filteredKeys.length > 0 && filteredKeys.every((key) => selectedHoldingKeys.includes(key));

    setSelectedHoldingKeys((current) => {
      if (everyFilteredSelected) {
        return current.filter((key) => !filteredKeys.includes(key));
      }

      return Array.from(new Set([...current, ...filteredKeys]));
    });
  }

  function clearFilters() {
    setSearchQuery("");
    setFilterMode("all");
    setShowAll(false);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[1.95rem] font-bold tracking-[-0.04em] text-white md:text-[2.2rem]">
              Tax Optimisation
            </h1>
            <div
              className="relative"
              onMouseEnter={() => setShowHowItWorks(true)}
              onMouseLeave={() => setShowHowItWorks(false)}
            >
              <button
                type="button"
                onClick={() => setShowHowItWorks((current) => !current)}
                className="group inline-flex items-center text-[15px] font-medium text-[#7aa5ff] transition duration-200 hover:-translate-y-0.5 hover:text-[#aecaff]"
              >
                <span className="relative">
                  How it works?
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-200 group-hover:scale-x-0" />
                </span>
              </button>
              <AnimatePresence>
                {showHowItWorks ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-10 z-20 w-[300px] rounded-xl border border-[#d7dce8] bg-white px-3 py-3 text-[13px] leading-5 text-[#11131a] shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
                  >
                    <div className="space-y-2">
                      {HOW_IT_WORKS.map((step) => (
                        <p key={step} className="flex gap-2">
                          <span className="mt-[2px] text-[10px] text-[#11131a]">{`\u2022`}</span>
                          <span>{step}</span>
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 leading-5">
                      <span className="font-semibold">Pro tip:</span> Experiment with different combinations
                      of your holdings to optimize your tax liability
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <DisclaimerAccordion />

        <div className="grid gap-6 xl:grid-cols-2">
          {capitalGainsState.error && !harvestMetrics ? (
            <>
              <CapitalGainsCardError
                title="Pre Harvesting"
                message={capitalGainsState.error}
                onRetry={() => fetchCapitalGains(true)}
              />
              <CapitalGainsCardError
                title="After Harvesting"
                message="After-harvest projections will resume once capital gains data is available."
                onRetry={() => fetchCapitalGains(true)}
                variant="blue"
              />
            </>
          ) : showCapitalGainsSkeleton ? (
            <>
              <CapitalGainsCardSkeleton />
              <CapitalGainsCardSkeleton variant="blue" />
            </>
          ) : null}

          {harvestMetrics ? (
            <>
              <motion.div
                className="h-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
              >
                <CapitalGainsCard
                  title="Pre Harvesting"
                  label="Realised Capital Gains"
                  gains={harvestMetrics.pre}
                />
              </motion.div>
              <motion.div
                className="h-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                <CapitalGainsCard
                  title="After Harvesting"
                  label="Effective Capital Gains"
                  gains={harvestMetrics.post}
                  variant="blue"
                />
              </motion.div>
            </>
          ) : null}
        </div>

        {!capitalGainsState.loading &&
        !capitalGainsState.error &&
        harvestMetrics &&
        selectedHoldings.length > 0 &&
        harvestMetrics.taxImpact.state === "negative" ? (
          <div className="rounded-[22px] border border-amber-500/15 bg-amber-500/8 px-4 py-3 text-sm text-amber-50">
            <p className="text-center">
              This basket increases taxable gains. Try combining it with loss-making positions to improve
              the harvest result.
            </p>
          </div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <HoldingsTable
            holdings={filteredHoldings}
            totalHoldingsCount={holdings.length}
            selectedHoldingKeys={selectedHoldingKeys}
            onToggleCoin={handleToggleCoin}
            onToggleAll={handleToggleAll}
            sortDirection={sortDirection}
            onToggleSort={() => setSortDirection((current) => (current === "desc" ? "asc" : "desc"))}
            showAll={showAll}
            onToggleViewAll={() => setShowAll((current) => !current)}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            loading={holdingsState.loading}
            showLoadingSkeleton={showHoldingsSkeleton}
            error={holdingsState.error}
            onRetry={() => fetchHoldings(true)}
            isOffline={isOffline}
            emptyReason={holdingsEmptyReason}
            onClearFilters={clearFilters}
          />
        </motion.div>

        {holdingsState.error && capitalGainsState.error ? (
          <div className="rounded-[22px] border border-red-500/15 bg-red-500/7 px-4 py-4 text-sm text-red-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              <div>
                <p className="font-semibold">Both data services need attention</p>
                <p className="mt-1 text-red-50/80">
                  Retry the holdings and capital gains requests once your connection is stable.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!holdingsState.loading &&
        !holdingsState.error &&
        holdings.length > 0 &&
        filteredHoldings.length > 0 &&
        selectedHoldings.length === 0 ? (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-[#d3defd]">
            <div className="flex items-start gap-3">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#87a8ff]" />
              <p>
                No holdings are selected yet. Choose assets from the table to compare pre-harvest and
                post-harvest capital gains in real time.
              </p>
            </div>
          </div>
        ) : null}

        {!holdingsState.loading &&
        !holdingsState.error &&
        holdings.length > 0 &&
        filteredHoldings.length === 0 &&
        searchQuery.trim() ? (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-[#d3defd]">
            <div className="flex items-start gap-3">
              <SearchX className="mt-0.5 h-5 w-5 shrink-0 text-[#87a8ff]" />
              <p>Search is active. Clear or broaden the query to bring holdings back into view.</p>
            </div>
          </div>
        ) : null}
      </div>

      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
