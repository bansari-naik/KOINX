"use client";

import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";

const disclaimerItems = [
  {
    title: "Price Source Disclaimer",
    description:
      "Please note that the current price of your coins may differ from exchange prices because we use CoinGecko as a default source for certain assets.",
  },
  {
    title: "Country-specific Availability",
    description:
      "Tax loss harvesting may not be supported in all countries. Consult your local tax advisor or accountant before acting on your exchange holdings.",
  },
  {
    title: "Utilization of Losses",
    description:
      "Harvested losses can often offset capital gains, but their usability depends on your applicable tax rules and existing gains.",
  },
];

export function DisclaimerAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-2xl border border-[#2957c8] bg-[#102252] shadow-panel"
    >
      <Collapsible.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-white md:px-6">
        <span className="flex items-center gap-3 text-base">
          <Info className="h-5 w-5 text-[#93b7ff]" />
          Important Notes And Disclaimers
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[#c5d9ff] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Collapsible.Trigger>

      <AnimatePresence initial={false}>
        {open ? (
          <Collapsible.Content forceMount asChild>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-white/10 px-5 py-4 text-sm leading-7 text-[#e6eeff] md:px-6">
                {disclaimerItems.map((item) => (
                  <p key={item.title} className="pl-4">
                    <span className="mr-2 text-[#9fc1ff]">{`\u2022`}</span>
                    <span className="font-semibold">{item.title}:</span> {item.description}
                  </p>
                ))}
              </div>
            </motion.div>
          </Collapsible.Content>
        ) : null}
      </AnimatePresence>
    </Collapsible.Root>
  );
}
