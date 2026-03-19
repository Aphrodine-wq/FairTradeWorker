"use client";

import * as React from "react";
import { STATS } from "@/lib/constants";

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
      const easedProgress = easeOutCubic(progress);
      setCount(Math.round(target * easedProgress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active, target, duration]);

  return count;
}

interface StatItemProps {
  label: string;
  value: number;
  suffix: string;
  active: boolean;
}

function StatItem({ label, value, suffix, active }: StatItemProps) {
  const count = useCountUp(value, 2000, active);

  return (
    <div className="text-center px-4">
      <div className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
        {count.toLocaleString()}
        <span className="text-brand-400">{suffix}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

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
    <section ref={ref} className="bg-dark py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-gray-700">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              active={active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
