export function Features() {
  return (
    <section id="features" className="divide-y divide-border">

      {/* Feature 1 — Talk to Hunter */}
      <div className="bg-[#FDFBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
            <div className="lg:flex-1">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-5">
                Talk to Hunter.
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                Our voice AI builds estimates while you drive to the job site.
                Describe the scope, Hunter writes the line items. Three minutes, done.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:flex-shrink-0 lg:text-right" aria-hidden="true">
              <div className="text-7xl font-bold text-gray-200 leading-none tabular-nums select-none">
                3 min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2 — Zero fees */}
      <div className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">

            {/* Left — comparison lines */}
            <div className="lg:flex-shrink-0 space-y-2 mb-8 lg:mb-0 lg:pt-2">
              <p className="text-sm text-red-500 line-through">Other platforms: $50–100 per lead</p>
              <p className="text-sm text-brand-600 font-bold">FairTradeWorker: $0 per lead</p>
              <p className="text-sm text-gray-500">Savings: $6,000+/year</p>
            </div>

            {/* Right — heading + body */}
            <div className="lg:flex-1 lg:text-right">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-5">
                Your money stays your money.
              </h2>
              <p className="text-lg text-gray-500 max-w-lg ml-auto leading-relaxed">
                One flat monthly subscription. That&apos;s it. No commissions, no per-lead charges,
                no hidden fees that eat your margin. The average contractor saves $6,000 a year
                switching from the big platforms. That&apos;s real money.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Feature 3 — Escrow */}
      <div className="bg-[#FDFBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-5">
            Escrow. Every job.
          </h2>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed mb-8">
            Every project runs through escrow. Money moves when work is verified.
            No chasing invoices. No bounced checks. No &ldquo;I&apos;ll pay you next week.&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
            <div className="border-l-2 border-brand-600 pl-4">
              <p className="text-sm text-gray-700 font-medium">Homeowners fund milestones upfront</p>
            </div>
            <div className="border-l-2 border-brand-600 pl-4">
              <p className="text-sm text-gray-700 font-medium">Contractors get paid when verified</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
