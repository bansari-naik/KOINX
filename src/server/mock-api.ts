import capitalGains from "@/data/capital-gains.json";
import holdings from "@/data/holdings.json";
import { ApiCapitalGainsResponse, Holding } from "@/lib/types";

export function getMockHoldings(): Holding[] {
  return holdings as Holding[];
}

export function getMockCapitalGains(): ApiCapitalGainsResponse {
  return capitalGains as ApiCapitalGainsResponse;
}

