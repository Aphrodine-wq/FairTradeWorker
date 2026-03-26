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

interface StatItemProps {
  label: string;
  sublabel: string;
  value: number;
  suffix: string;
  prefix?: string;
  active: boolean;
}

function StatItem({
  label,
  sublabel,
  value,
  suffix,
  prefix,
  active,
}: StatItemProps) {
  const count = useCountUp(value, 1800, active);
  return (
    <div className="text-center px-4 py-2">
      <div className="text-3xl font-bold text-white tabular-nums">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1 text-sm font-medium text-white/90">{label}</div>
      <div className="text-xs text-white/60">{sublabel}</div>
    </div>
  );
}

const STATS = [
  {
    label: "Jobs Completed",
    sublabel: "and counting",
    value: 12847,
    suffix: "+",
    prefix: "",
  },
  {
    label: "Verified Contractors",
    sublabel: "licensed and insured",
    value: 3200,
    suffix: "+",
    prefix: "",
  },
  {
    label: "Homeowner Satisfaction",
    sublabel: "across all projects",
    value: 98,
    suffix: "%",
    prefix: "",
  },
  {
    label: "Lead Fees",
    sublabel: "on every plan, forever",
    value: 0,
    suffix: "",
    prefix: "$",
  },
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
    <section ref={ref} className="bg-brand-600 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/20">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              sublabel={stat.sublabel}
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              active={active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
