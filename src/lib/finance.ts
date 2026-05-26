import { CapitalGains, CapitalGainsBucket, Holding } from "@/lib/types";

export const FINANCIAL_SCALE = 12n;
const FINANCIAL_BASE = 10n ** FINANCIAL_SCALE;
const ZERO = 0n;
const CENT = 10n ** (FINANCIAL_SCALE - 2n);

export type PreciseAmount = bigint;

export type FinancialBucketMetrics = {
  profits: PreciseAmount;
  losses: PreciseAmount;
  net: PreciseAmount;
};

export type HarvestSnapshot = {
  shortTerm: FinancialBucketMetrics;
  longTerm: FinancialBucketMetrics;
  realizedCapitalGains: PreciseAmount;
};

export type TaxImpactState = "positive" | "neutral" | "negative";

export type TaxImpact = {
  state: TaxImpactState;
  savings: PreciseAmount;
  message: string;
};

export type HarvestMetrics = {
  pre: HarvestSnapshot;
  post: HarvestSnapshot;
  taxImpact: TaxImpact;
};

function expandExponentialString(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed.includes("e")) {
    return trimmed;
  }

  const [coefficient, exponentPart] = trimmed.split("e");
  const exponent = Number.parseInt(exponentPart, 10);

  if (!Number.isFinite(exponent)) {
    return "0";
  }

  const negative = coefficient.startsWith("-");
  const normalized = coefficient.replace("-", "");
  const [whole = "0", fraction = ""] = normalized.split(".");
  const digits = `${whole}${fraction}`;
  const decimalIndex = whole.length + exponent;

  if (decimalIndex <= 0) {
    return `${negative ? "-" : ""}0.${"0".repeat(Math.abs(decimalIndex))}${digits}`.replace(/\.?0+$/, (match) =>
      match.startsWith(".") ? match : "",
    );
  }

  if (decimalIndex >= digits.length) {
    return `${negative ? "-" : ""}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }

  const integerPart = digits.slice(0, decimalIndex);
  const fractionalPart = digits.slice(decimalIndex);
  return `${negative ? "-" : ""}${integerPart}.${fractionalPart}`;
}

export function sanitizeNumericValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toPreciseAmount(value: unknown): PreciseAmount {
  const numericValue = sanitizeNumericValue(value);
  const plain = expandExponentialString(numericValue.toString());
  const negative = plain.startsWith("-");
  const normalized = negative ? plain.slice(1) : plain;
  const [whole = "0", fraction = ""] = normalized.split(".");
  const safeWhole = whole.replace(/\D/g, "") || "0";
  const safeFraction = fraction.replace(/\D/g, "");
  const scaledFraction = `${safeFraction}${"0".repeat(Number(FINANCIAL_SCALE))}`.slice(0, Number(FINANCIAL_SCALE));
  const combined = `${safeWhole}${scaledFraction}`.replace(/^0+(?=\d)/, "");
  const amount = BigInt(combined || "0");
  return negative ? -amount : amount;
}

export function preciseAdd(...values: PreciseAmount[]) {
  return values.reduce((sum, value) => sum + value, ZERO);
}

export function preciseSubtract(left: PreciseAmount, right: PreciseAmount) {
  return left - right;
}

export function preciseAbs(value: PreciseAmount) {
  return value < ZERO ? -value : value;
}

export function preciseCompare(left: PreciseAmount, right: PreciseAmount) {
  if (left === right) {
    return 0;
  }

  return left > right ? 1 : -1;
}

export function isNegligibleAmount(value: PreciseAmount) {
  return preciseCompare(preciseAbs(value), CENT) < 0;
}

function buildBucket(profits: unknown, losses: unknown): FinancialBucketMetrics {
  const preciseProfits = toPreciseAmount(profits);
  const preciseLosses = toPreciseAmount(losses);

  return {
    profits: preciseProfits,
    losses: preciseLosses,
    net: calculateNetCapitalGains(preciseProfits, preciseLosses),
  };
}

export function calculateNetCapitalGains(profits: PreciseAmount, losses: PreciseAmount) {
  return preciseSubtract(profits, losses);
}

function buildSnapshot(capitalGains: CapitalGains): HarvestSnapshot {
  const shortTerm = buildBucket(capitalGains.shortTerm.profits, capitalGains.shortTerm.losses);
  const longTerm = buildBucket(capitalGains.longTerm.profits, capitalGains.longTerm.losses);

  return {
    shortTerm,
    longTerm,
    realizedCapitalGains: preciseAdd(shortTerm.net, longTerm.net),
  };
}

function normalizeBucketInput(bucket: Partial<CapitalGainsBucket> | null | undefined): CapitalGainsBucket {
  return {
    profits: sanitizeNumericValue(bucket?.profits),
    losses: sanitizeNumericValue(bucket?.losses),
  };
}

export function normalizeCapitalGainsInput(capitalGains: Partial<CapitalGains> | null | undefined): CapitalGains {
  return {
    shortTerm: normalizeBucketInput(capitalGains?.shortTerm),
    longTerm: normalizeBucketInput(capitalGains?.longTerm),
  };
}

function accumulateGain(
  bucket: FinancialBucketMetrics,
  gain: unknown,
): FinancialBucketMetrics {
  const preciseGain = toPreciseAmount(gain);

  if (preciseCompare(preciseGain, ZERO) > 0) {
    const profits = preciseAdd(bucket.profits, preciseGain);
    return {
      profits,
      losses: bucket.losses,
      net: calculateNetCapitalGains(profits, bucket.losses),
    };
  }

  if (preciseCompare(preciseGain, ZERO) < 0) {
    const losses = preciseAdd(bucket.losses, preciseAbs(preciseGain));
    return {
      profits: bucket.profits,
      losses,
      net: calculateNetCapitalGains(bucket.profits, losses),
    };
  }

  return bucket;
}

function derivePostHarvestSnapshot(base: HarvestSnapshot, selectedHoldings: Holding[]): HarvestSnapshot {
  let shortTerm = { ...base.shortTerm };
  let longTerm = { ...base.longTerm };

  for (const holding of selectedHoldings) {
    shortTerm = accumulateGain(shortTerm, holding?.stcg?.gain);
    longTerm = accumulateGain(longTerm, holding?.ltcg?.gain);
  }

  return {
    shortTerm,
    longTerm,
    realizedCapitalGains: preciseAdd(shortTerm.net, longTerm.net),
  };
}

export function calculateSavings(preHarvest: PreciseAmount, postHarvest: PreciseAmount) {
  return preciseSubtract(preHarvest, postHarvest);
}

export function calculateTaxImpact(preHarvest: PreciseAmount, postHarvest: PreciseAmount): TaxImpact {
  const savings = calculateSavings(preHarvest, postHarvest);
  const comparison = preciseCompare(savings, ZERO);

  if (comparison === 0) {
    return {
      state: "neutral",
      savings,
      message: "No meaningful tax impact detected.",
    };
  }

  if (isNegligibleAmount(savings)) {
    return {
      state: "neutral",
      savings,
      message: "Tax impact is negligible.",
    };
  }

  if (comparison > 0) {
    return {
      state: "positive",
      savings,
      message: "You're going to save",
    };
  }

  if (comparison < 0) {
    return {
      state: "negative",
      savings,
      message: "This selection increases taxable gains.",
    };
  }

  return {
    state: "neutral",
    savings,
    message: "No meaningful tax impact detected.",
  };
}

export function calculateHarvestMetrics(capitalGains: Partial<CapitalGains> | null | undefined, selectedHoldings: Holding[]) {
  const normalizedCapitalGains = normalizeCapitalGainsInput(capitalGains);
  const pre = buildSnapshot(normalizedCapitalGains);
  const post = derivePostHarvestSnapshot(pre, selectedHoldings);
  const taxImpact = calculateTaxImpact(pre.realizedCapitalGains, post.realizedCapitalGains);

  return {
    pre,
    post,
    taxImpact,
  } satisfies HarvestMetrics;
}

function roundToMinorUnit(value: PreciseAmount, decimalPlaces = 2) {
  const places = BigInt(decimalPlaces);
  const factor = 10n ** (FINANCIAL_SCALE - places);
  const negative = value < ZERO;
  const absolute = preciseAbs(value);
  const rounded = (absolute + factor / 2n) / factor;
  return {
    rounded,
    negative,
    factor,
  };
}

function addThousandsSeparators(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCurrencySymbol(currency: "USD" | "INR") {
  return currency === "INR" ? "\u20b9" : "$";
}

export function formatPreciseCurrency(value: PreciseAmount, currency: "USD" | "INR" = "USD") {
  const { rounded, negative } = roundToMinorUnit(value, 2);
  const integerPart = rounded / 100n;
  const decimalPart = (rounded % 100n).toString().padStart(2, "0");
  const sign = negative ? "-" : "";

  return `${sign}${getCurrencySymbol(currency)}${addThousandsSeparators(integerPart.toString())}.${decimalPart}`;
}

export function formatPreciseRawCurrency(value: PreciseAmount, currency: "USD" | "INR" = "USD") {
  const sign = value < ZERO ? "-" : "";
  const absolute = preciseAbs(value);
  const integerPart = absolute / FINANCIAL_BASE;
  const decimalPart = (absolute % FINANCIAL_BASE).toString().padStart(Number(FINANCIAL_SCALE), "0").replace(/0+$/, "");

  return `${sign}${getCurrencySymbol(currency)}${addThousandsSeparators(integerPart.toString())}${
    decimalPart ? `.${decimalPart}` : ""
  }`;
}

export function preciseAmountToNumber(value: PreciseAmount) {
  return Number(value) / Number(FINANCIAL_BASE);
}
