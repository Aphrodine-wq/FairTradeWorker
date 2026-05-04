"use client";

import * as React from "react";
import { fetchPublicStats } from "@shared/lib/data";

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

type StatItem = { value: number; suffix: string; prefix: string; label: string };

const DEFAULT_STATS: StatItem[] = [
  { value: 12847, suffix: "+", prefix: "", label: "Jobs completed" },
  { value: 3200, suffix: "+", prefix: "", label: "Verified contractors" },
  { value: 98, suffix: "%", prefix: "", label: "Homeowner satisfaction" },
  { value: 0, suffix: "", prefix: "$", label: "Lead fees" },
] ;

function StatCount({ stat, active }: { stat: StatItem; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums">
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="mt-1.5 text-sm text-gray-500">
        {stat.label}
      </div>
    </div>
  );
}

export function StatsBar() {
  const [active, setActive] = React.useState(false);
  const [stats, setStats] = React.useState(DEFAULT_STATS);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchPublicStats().then((payload) => {
      if (!payload?.overview) return;
      setStats([
        { value: Number(payload.overview.jobsCompleted || DEFAULT_STATS[0].value), suffix: "+", prefix: "", label: "Jobs completed" },
        { value: Number(payload.overview.verifiedContractors || DEFAULT_STATS[1].value), suffix: "+", prefix: "", label: "Verified contractors" },
        { value: Number(payload.overview.homeownerSatisfactionPct || DEFAULT_STATS[2].value), suffix: "%", prefix: "", label: "Homeowner satisfaction" },
        { value: Number(payload.overview.averageLeadFee || 0), suffix: "", prefix: "$", label: "Lead fees" },
      ]);
    });
  }, []);

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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat) => (
            <StatCount key={stat.label} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
