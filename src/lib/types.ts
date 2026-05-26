export type GainBucket = {
  balance: number;
  gain: number;
};

export type Holding = {
  coin: string;
  coinName: string;
  logo: string;
  currentPrice: number;
  totalHolding: number;
  averageBuyPrice: number;
  stcg: GainBucket;
  ltcg: GainBucket;
};

export type CapitalGainsBucket = {
  profits: number;
  losses: number;
};

export type ApiCapitalGainsResponse = {
  capitalGains: {
    stcg: CapitalGainsBucket;
    ltcg: CapitalGainsBucket;
  };
};

export type CapitalGains = {
  shortTerm: CapitalGainsBucket;
  longTerm: CapitalGainsBucket;
};
