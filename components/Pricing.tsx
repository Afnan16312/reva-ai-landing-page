"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for trying Reva",
    features: [
      "50 conversations/month",
      "WhatsApp booking",
      "Appointment reminders",
      "1 doctor",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
    gradient: false,
  },
  {
    name: "Clinic",
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    description: "For growing clinics",
    features: [
      "Unlimited conversations",
      "WhatsApp + Voice booking",
      "Smart reminders + recall",
      "Up to 5 doctors",
      "Analytics dashboard",
      "Priority support",
      "Custom greeting message",
    ],
    cta: "Start 14-Day Trial",
    popular: true,
    gradient: true,
  },
  {
    name: "Multi-Clinic",
    monthlyPrice: 6999,
    yearlyPrice: 5599,
    description: "For chains & groups",
    features: [
      "Everything in Clinic",
      "Unlimited doctors & locations",
      "Advanced analytics",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple Pricing,{" "}
            <span className="gradient-text">Serious Results</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Start free. Scale as you grow. Cancel anytime.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium ${!yearly ? "text-white" : "text-slate-400"}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-16 h-8 bg-white/[0.08] border border-white/[0.12] rounded-full transition-colors duration-300 focus:outline-none"
          >
            <motion.div
              animate={{ x: yearly ? 32 : 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-1 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 shadow-lg"
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? "text-white" : "text-slate-400"}`}>
            Yearly
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              20% off
            </span>
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative flex flex-col rounded-2xl p-6 backdrop-blur-sm
                bg-white/[0.03] border
                ${plan.popular
                  ? "border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                  : "border-white/[0.08]"
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.monthlyPrice === 0
                      ? "₹0"
                      : `₹${(yearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString("en-IN")}`}
                  </span>
                  <span className="text-slate-400 text-sm mb-1">/month</span>
                </div>
                {yearly && plan.monthlyPrice > 0 && (
                  <p className="text-slate-500 text-xs mt-1 line-through">
                    ₹{plan.monthlyPrice.toLocaleString("en-IN")}/month
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${plan.gradient
                    ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 hover:scale-[1.02] shadow-lg"
                    : "bg-white/[0.06] border border-white/[0.12] text-white hover:bg-white/[0.10]"
                  }
                `}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10 space-y-2"
        >
          <p className="text-slate-400 text-sm">
            All plans include 14-day free trial. No credit card required.
          </p>
          <p className="text-slate-500 text-xs">
            Razorpay &bull; UPI &bull; Credit Card &bull; Net Banking
          </p>
        </motion.div>
      </div>
    </section>
  );
}
