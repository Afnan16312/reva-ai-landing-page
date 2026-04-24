"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link2, Calendar, CheckCircle } from "lucide-react";

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your WhatsApp",
    description:
      "Link your clinic's WhatsApp Business number to Reva. Takes 3 minutes — we walk you through it.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Set Your Schedule",
    description:
      "Tell Reva your working hours, doctors, and services. It learns your clinic in minutes.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Patients Book, You Focus",
    description:
      "Share your WhatsApp number. Patients book automatically. You get a notification for every confirmed appointment.",
  },
];

const beforeItems = [
  "Missed calls during consultations",
  "Patients call 3 competitors",
  "Receptionist manually calls 40 patients for recalls",
  "No-shows with no warning",
];

const afterItems = [
  "Every inquiry answered instantly",
  "Patient books in 60 seconds on WhatsApp",
  "Recall campaigns sent automatically",
  "Smart reminders slash no-shows",
];

export default function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });
  const compareInView = useInView(compareRef, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="bg-[#050714] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Up and Running in 10 Minutes
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            No IT team needed. If you can use WhatsApp, you can use Reva.
          </p>
        </motion.div>

        {/* Steps */}
        <div
          ref={stepsRef}
          className="flex flex-col md:flex-row items-stretch gap-6 md:gap-0 mb-20"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col md:flex-row items-center flex-1">
                <motion.div
                  className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 flex-1 w-full overflow-hidden"
                  initial={{ opacity: 0, y: 40 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  {/* Background number */}
                  <span className="absolute top-4 right-4 text-6xl font-black gradient-text opacity-20 select-none leading-none">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </motion.div>

                {/* Dashed arrow between steps (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-3 text-slate-600 text-2xl flex-shrink-0">
                    <svg
                      width="32"
                      height="16"
                      viewBox="0 0 32 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="0"
                        y1="8"
                        x2="24"
                        y2="8"
                        stroke="#334155"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                      <path d="M24 3L31 8L24 13" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Before vs After */}
        <motion.div
          ref={compareRef}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={compareInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Before */}
            <div className="p-8">
              <h4 className="text-red-400 font-semibold text-base mb-5 uppercase tracking-widest text-xs">
                Before Reva
              </h4>
              <ul className="space-y-4">
                {beforeItems.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 text-slate-500 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={compareInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  >
                    <span className="text-red-500 mt-0.5 flex-shrink-0">❌</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="p-8 bg-emerald-950/10">
              <h4 className="text-emerald-400 font-semibold text-base mb-5 uppercase tracking-widest text-xs">
                After Reva
              </h4>
              <ul className="space-y-4">
                {afterItems.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 text-slate-300 text-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={compareInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  >
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✅</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
