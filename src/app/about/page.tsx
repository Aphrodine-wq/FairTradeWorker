import { Navbar } from "@marketplace/components/navbar";
import { Footer } from "@marketplace/components/footer";
import { Separator } from "@shared/ui/separator";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            We got tired of the same broken system.
          </h1>

          {/* Story */}
          <div className="mt-10 space-y-6 text-lg text-gray-600 leading-relaxed max-w-3xl">
            <p>
              A contractor bids on a lead from HomeAdvisor. Pays $75. The homeowner
              already hired someone. He bids again next week. Same thing. By the end
              of the month, he&apos;s out $400 and hasn&apos;t landed a job. That&apos;s not a bad
              week — that&apos;s how the whole system was designed. Pay to play, whether
              you win or not.
            </p>
            <p>
              On the other side, a homeowner posts her bathroom remodel and gets six
              calls in two hours. None of them actually looked at the job. The
              estimates range from $4,000 to $18,000. She has no idea who to trust
              or why the numbers are so far apart. She ends up picking the guy in the
              middle and hoping for the best.
            </p>
            <p>
              FairTradeWorker exists because both of those people deserved better.
              Contractors should earn work on merit, not whoever can outspend the
              algorithm. Homeowners should get honest estimates from contractors who
              actually show up. We built a marketplace that works both ways — no lead
              fees, no mystery pricing, no games.
            </p>
          </div>

          <Separator className="my-14" />

          {/* What we believe */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              What we believe.
            </h2>
            <div className="space-y-5">
              {[
                "Contractors should keep what they earn.",
                "Homeowners deserve honest estimates.",
                "Trust is built, not bought.",
                "The best contractor for the job should get the job.",
              ].map((value) => (
                <p
                  key={value}
                  className="text-lg font-medium text-gray-800 border-l-4 border-brand-600 pl-4"
                >
                  {value}
                </p>
              ))}
            </div>
          </section>

          <Separator className="my-14" />

          {/* Team */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Built in Texas. By people who&apos;ve swung a hammer.
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              We&apos;re a small team based in Austin. Some of us came from construction.
              Some from software. All of us got tired of watching a good industry get
              exploited by bad marketplaces. We&apos;re building what should have existed
              ten years ago — and we&apos;re starting right here in Texas.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
