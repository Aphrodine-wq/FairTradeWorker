const steps = [
  {
    number: "1",
    title: "Post or browse",
    description: "Homeowners describe their job. Contractors browse what's available in their area.",
  },
  {
    number: "2",
    title: "Connect",
    description: "Get matched with verified pros. Send estimates. Message directly — no middleman.",
  },
  {
    number: "3",
    title: "Get it done",
    description: "Work happens. Escrow releases. Everyone gets paid what they agreed to.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
          {steps.map((step, i) => (
            <div key={step.number} className="flex lg:contents">
              <div className={i > 0 ? "mt-8 lg:mt-0" : ""}>
                <p className="text-sm font-bold text-brand-600 mb-2">{step.number}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex items-center self-start mt-3 flex-shrink-0">
                  <div className="h-px w-8 bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
