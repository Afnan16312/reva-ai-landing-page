"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  value: string;
  numericValue: number | null;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: "40%", numericValue: 40, suffix: "%", label: "Avg No-Show Reduction" },
  { value: "3hrs", numericValue: 3, suffix: "hrs", label: "Saved Per Day Per Clinic" },
  { value: "24/7", numericValue: null, suffix: "", label: "Booking Availability" },
  { value: "2 min", numericValue: 2, suffix: " min", label: "Average Response Time" },
];

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);

  return count;
}

function AnimatedStat({ stat, index, triggered }: { stat: StatItem; index: number; triggered: boolean }) {
  const count = useCountUp(stat.numericValue ?? 0, 1.5, triggered && stat.numericValue !== null);

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-8 py-6 flex-1 min-w-[160px]"
      initial={{ opacity: 0, y: 20 }}
      animate={triggered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <span className="text-4xl md:text-5xl font-bold gradient-text">
        {stat.numericValue !== null ? `${count}${stat.suffix}` : stat.value}
      </span>
      <span className="text-slate-400 text-sm mt-2 text-center">{stat.label}</span>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-y border-white/[0.06] bg-[#050714]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-row flex-wrap justify-center divide-x divide-white/[0.06]">
          {stats.map((stat, i) => (
            <AnimatedStat key={stat.label} stat={stat} index={i} triggered={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
