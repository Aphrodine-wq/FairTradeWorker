const testimonials = [
  {
    quote:
      "No lead fees, quality homeowners, and the Voice AI estimator saves me hours every week. I've grown my business 40% since joining.",
    name: "Marcus Johnson",
    company: "Johnson & Sons Construction",
    location: "Oxford, MS",
    role: "General Contractor",
  },
  {
    quote:
      "I was spending $400 a month on leads that went nowhere. Switched to FairTradeWorker and landed three jobs in my first two weeks. The escrow system means I actually get paid on time.",
    name: "David Ramirez",
    company: "Ramirez Electric",
    location: "San Antonio, TX",
    role: "Electrician",
  },
  {
    quote:
      "We needed our master bathroom redone and had no idea what it should cost. Posted on FairTradeWorker, got four bids within 48 hours, and every contractor was licensed and insured. The whole process felt transparent.",
    name: "Sarah Chen",
    company: null,
    location: "Houston, TX",
    role: "Homeowner",
  },
  {
    quote:
      "The AI estimator is a game changer. I used to spend an hour putting together a bid. Now I walk the site, talk through the scope, and Hunter has a full estimate ready before I'm back in the truck.",
    name: "Tommy Williams",
    company: "Williams Plumbing Co.",
    location: "Dallas, TX",
    role: "Plumber",
  },
  {
    quote:
      "I've tried three different platforms. This is the only one where I feel like the contractors actually want to be there. The bids were detailed, communication was professional, and escrow gave me peace of mind.",
    name: "Angela Morrison",
    company: null,
    location: "Round Rock, TX",
    role: "Homeowner",
  },
  {
    quote:
      "My crew is on the Team plan and it changed how we operate. Everyone sees the same dashboard, assignments are clear, and I can track job costing without a spreadsheet. Should have had this years ago.",
    name: "Carlos Medina",
    company: "Medina Renovations",
    location: "El Paso, TX",
    role: "Remodeling Contractor",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#FDFBF8] py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-14">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-3">
            What People Are Saying
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Trusted by contractors and homeowners across Mississippi.
          </h2>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-border rounded-xl p-8 flex flex-col"
            >
              <blockquote className="text-base text-gray-700 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-sm font-bold text-gray-900">{t.name}</p>
                {t.company && (
                  <p className="text-sm text-gray-500">{t.company}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.role} — {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
