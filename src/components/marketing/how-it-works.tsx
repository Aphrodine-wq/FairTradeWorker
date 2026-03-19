"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const homeownerSteps = [
  {
    number: "01",
    title: "Post Your Job",
    description:
      "Describe your project, upload photos, and set your budget range. Takes less than 5 minutes — no account required to browse.",
  },
  {
    number: "02",
    title: "Compare Estimates",
    description:
      "Receive detailed estimates from verified contractors in your area. Every estimate breaks down labor, materials, and timeline so you can compare apples to apples.",
  },
  {
    number: "03",
    title: "Hire with Confidence",
    description:
      "Choose your contractor, fund escrow, and track every milestone. Funds release only when work is approved — protecting both sides of every deal.",
  },
];

const contractorSteps = [
  {
    number: "01",
    title: "Browse Jobs",
    description:
      "See every open job in your trade and service area. Filter by budget, urgency, and job type. No more cold leads or pay-per-click ads.",
  },
  {
    number: "02",
    title: "Send Estimates",
    description:
      "Use Hunter, our Voice AI, to generate professional, itemized estimates in minutes. Stand out from the competition with clear, detailed proposals.",
  },
  {
    number: "03",
    title: "Get Paid Fair",
    description:
      "Escrow ensures you get paid at every milestone — no chasing invoices, no payment disputes. Your work, your rate, your timeline.",
  },
];

interface StepProps {
  number: string;
  title: string;
  description: string;
  isLast: boolean;
}

function Step({ number, title, description, isLast }: StepProps) {
  return (
    <div className="relative flex flex-col items-center text-center flex-1">
      {/* Connector line (between steps) */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-8 left-[calc(50%+2.75rem)] right-[calc(-50%+2.75rem)] h-px bg-border"
          aria-hidden="true"
        />
      )}

      {/* Number circle */}
      <div className="relative z-10 w-16 h-16 rounded-full border-2 border-brand-200 bg-white flex items-center justify-center mb-5 flex-shrink-0">
        <span className="text-xl font-bold text-brand-600 tabular-nums">
          {number}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            The Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            A straightforward process built for both sides of the marketplace.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="homeowners" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="h-12 p-1 rounded-xl bg-gray-100">
              <TabsTrigger
                value="homeowners"
                className={cn(
                  "px-8 h-10 rounded-lg text-sm font-semibold transition-all",
                  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                )}
              >
                For Homeowners
              </TabsTrigger>
              <TabsTrigger
                value="contractors"
                className={cn(
                  "px-8 h-10 rounded-lg text-sm font-semibold transition-all",
                  "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                )}
              >
                For Contractors
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="homeowners">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6">
              {homeownerSteps.map((step, i) => (
                <Step
                  key={step.number}
                  {...step}
                  isLast={i === homeownerSteps.length - 1}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contractors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6">
              {contractorSteps.map((step, i) => (
                <Step
                  key={step.number}
                  {...step}
                  isLast={i === contractorSteps.length - 1}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
