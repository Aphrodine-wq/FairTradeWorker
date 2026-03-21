export function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Decorative giant quote mark */}
          <div
            className="absolute top-0 left-0 font-serif text-gray-100 leading-none select-none pointer-events-none"
            style={{ fontSize: "200px", lineHeight: 1 }}
            aria-hidden="true"
          >
            &ldquo;
          </div>

          {/* Actual quote, overlapping the decorative mark */}
          <div className="relative pt-16 sm:pt-24">
            <blockquote className="text-2xl sm:text-3xl text-gray-800 italic leading-relaxed max-w-3xl">
              No lead fees, quality homeowners, and the Voice AI estimator saves me hours every
              week. I&apos;ve grown my business 40% since joining.
            </blockquote>
            <p className="mt-8 text-sm text-gray-500">
              &mdash; Marcus Johnson, Johnson &amp; Sons Construction, Austin TX
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
