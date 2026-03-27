"use client";

import * as React from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = React.useState(0);
  const frameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active, target, duration]);

  return count;
}

const STATS = [
  { value: 12847, suffix: "+", prefix: "", label: "Jobs completed" },
  { value: 3200, suffix: "+", prefix: "", label: "Verified contractors" },
  { value: 98, suffix: "%", prefix: "", label: "Homeowner satisfaction" },
  { value: 0, suffix: "", prefix: "$", label: "Lead fees" },
] as const;

export function StatsBar() {
  const [active, setActive] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-y border-border bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {STATS.map((stat, i) => {
            const count = useCountUp(stat.value, 1800, active);
            return (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="hidden sm:block w-px h-8 bg-border" />}
                <div className="flex items-baseline gap-2 px-2">
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">
                    {stat.prefix}{count.toLocaleString()}{stat.suffix}
                  </span>
                  <span className="text-sm text-gray-400 hidden sm:inline">
                    {stat.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
