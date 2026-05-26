import { PreciseAmount } from "@/lib/finance";
import { formatPreciseCurrencyValue, formatPreciseRawCurrencyValue } from "@/lib/formatters";

import { ValueTooltip } from "@/components/ui/value-tooltip";

type FinancialValueProps = {
  amount: PreciseAmount;
  currency?: "USD" | "INR";
  align?: "left" | "center" | "right";
  className?: string;
};

export function FinancialValue({
  amount,
  currency = "USD",
  align = "center",
  className,
}: FinancialValueProps) {
  return (
    <ValueTooltip tooltip={formatPreciseRawCurrencyValue(amount, currency)} align={align} className={className}>
      <span>{formatPreciseCurrencyValue(amount, currency)}</span>
    </ValueTooltip>
  );
}
