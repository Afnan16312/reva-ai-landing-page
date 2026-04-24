"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Phone, Bell, RefreshCcw, BarChart3, Shield } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  gradient: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    gradient: "from-cyan-400 to-teal-500",
    title: "WhatsApp Booking",
    description:
      "Patients book appointments 24/7 via WhatsApp. Reva understands natural language — 'book me for tomorrow afternoon' just works.",
  },
  {
    icon: Phone,
    gradient: "from-violet-500 to-pink-500",
    title: "Missed Call Recovery",
    description:
      "When your clinic is busy, Reva catches every missed call and sends an instant WhatsApp to the patient.",
  },
  {
    icon: Bell,
    gradient: "from-amber-400 to-orange-500",
    title: "Smart Reminders",
    description:
      "Automated reminders sent 24hrs and 1hr before every appointment. Cut no-shows by up to 40%.",
  },
  {
    icon: RefreshCcw,
    gradient: "from-emerald-400 to-cyan-500",
    title: "Recall Campaigns",
    description:
      "6-month dental recalls, chronic disease follow-ups — Reva remembers so your staff doesn't have to.",
  },
  {
    icon: BarChart3,
    gradient: "from-blue-500 to-violet-500",
    title: "Clinic Analytics",
    description:
      "Daily bookings, busiest hours, no-show rates, patient retention — all in one dashboard.",
  },
  {
    icon: Shield,
    gradient: "from-rose-500 to-pink-500",
    title: "DPDP Compliant",
    description:
      "Built for India's data privacy laws. Patient data stays encrypted and never shared with third parties.",
  },
];

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="bg-[#050714] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything Your Front Desk Should Be
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Built for the realities of running a clinic in India.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
