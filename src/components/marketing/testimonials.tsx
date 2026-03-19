import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockReviews } from "@/lib/mock-data";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
          )}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color based on first char
  const colors = [
    "bg-brand-600",
    "bg-blue-600",
    "bg-purple-600",
    "bg-amber-600",
    "bg-rose-600",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
        bg
      )}
    >
      {initials}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            What People Are Saying
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Real results from real homeowners and contractors across Texas.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-border rounded-xl p-7 flex flex-col gap-5 hover:shadow-md transition-shadow duration-200"
            >
              {/* Stars */}
              <StarRating rating={review.rating} />

              {/* Quote */}
              <blockquote className="text-gray-600 text-sm leading-relaxed italic flex-1">
                &ldquo;{review.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-border">
                <AuthorAvatar name={review.authorName} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {review.authorName}
                  </p>
                  <Badge
                    variant={
                      review.role === "contractor" ? "success" : "info"
                    }
                    className="mt-0.5"
                  >
                    {review.role === "contractor" ? "Contractor" : "Homeowner"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
