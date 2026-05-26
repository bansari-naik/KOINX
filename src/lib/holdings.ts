import { Holding } from "@/lib/types";

export function getHoldingKey(holding: Holding) {
  return `${holding.coin}::${holding.coinName}`;
}

