import {
  formatPreciseCurrency,
  formatPreciseRawCurrency,
  PreciseAmount,
  sanitizeNumericValue,
  toPreciseAmount,
} from "@/lib/finance";

export function formatCurrency(value: number, currency: "USD" | "INR" = "USD") {
  return formatPreciseCurrency(toPreciseAmount(value), currency);
}

export function formatRawCurrency(value: number, currency: "USD" | "INR" = "USD") {
  return formatPreciseRawCurrency(toPreciseAmount(value), currency);
}

export function formatPreciseCurrencyValue(value: PreciseAmount, currency: "USD" | "INR" = "USD") {
  return formatPreciseCurrency(value, currency);
}

export function formatPreciseRawCurrencyValue(value: PreciseAmount, currency: "USD" | "INR" = "USD") {
  return formatPreciseRawCurrency(value, currency);
}

export function formatGainValue(value: number) {
  return formatCurrency(value);
}

export function formatUnits(value: number, symbol: string) {
  const safeValue = sanitizeNumericValue(value);

  if (safeValue === 0) {
    return `0 ${symbol}`;
  }

  if (Math.abs(safeValue) >= 1) {
    return `${safeValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })} ${symbol}`;
  }

  return `${safeValue.toLocaleString("en-US", {
    maximumFractionDigits: 12,
  })} ${symbol}`;
}

export function formatPrice(value: number) {
  return formatCurrency(value);
}

export function formatSavings(value: PreciseAmount) {
  return formatPreciseCurrency(value, "INR");
}
