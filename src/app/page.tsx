import Image from "next/image";

import { TaxHarvestingDashboard } from "@/components/tax-loss-harvesting/tax-harvesting-dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-background bg-page-glow text-text">
      <div className="border-b border-white/5 bg-[#151a27]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center px-4 py-5 md:px-8">
          <Image
            src="/koinx-logo.png"
            alt="KoinX"
            width={111}
            height={37}
            priority
            className="h-auto w-[88px] md:w-[111px]"
          />
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 md:py-8">
        <TaxHarvestingDashboard />
      </div>
    </main>
  );
}
