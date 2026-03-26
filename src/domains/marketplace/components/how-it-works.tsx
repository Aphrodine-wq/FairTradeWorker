const contractorSteps = [
  {
    number: "1",
    title: "Sign up and get verified",
    description:
      "Add your trade and service area. We verify your license, insurance, and identity. Most contractors are approved within 24 hours.",
  },
  {
    number: "2",
    title: "Browse jobs and bid",
    description:
      "See local jobs filtered by trade and distance. Review the scope, submit your bid with a detailed estimate. Smart Matching on Solo+ brings the best-fit jobs to you.",
  },
  {
    number: "3",
    title: "Win the job and get to work",
    description:
      "Homeowner accepts your bid, escrow is funded. Track milestones and message the homeowner directly. No middleman.",
  },
  {
    number: "4",
    title: "Get paid when the work is done",
    description:
      "Complete a milestone, homeowner confirms, escrow releases. No chasing invoices, no bounced checks.",
  },
];

const homeownerSteps = [
  {
    number: "1",
    title: "Describe your project",
    description:
      "Post a job with the details and photos. Takes about two minutes. The more detail, the more accurate your bids.",
  },
  {
    number: "2",
    title: "Review bids from verified contractors",
    description:
      "Licensed, insured contractors submit competitive bids. Compare pricing, read reviews, and message directly before you decide.",
  },
  {
    number: "3",
    title: "Hire with confidence",
    description:
      "Accept a bid, fund escrow. Your money is held until you confirm the work is done. Release payment when you're satisfied.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Simple for both sides.
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl">
            No algorithms to game. No credits to buy. No middlemen.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contractor flow */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-8 pb-3 border-b border-border">
              For Contractors
            </h3>
            <div className="space-y-10">
              {contractorSteps.map((step) => (
                <div key={step.number} className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Homeowner flow */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-8 pb-3 border-b border-border">
              For Homeowners
            </h3>
            <div className="space-y-10">
              {homeownerSteps.map((step) => (
                <div key={step.number} className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
