"use client";

import { motion } from "framer-motion";

const footerLinks = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Demo", "Changelog"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers"],
  },
  {
    heading: "Legal",
    links: ["Privacy", "Terms", "DPDP"],
  },
  {
    heading: "Support",
    links: ["Docs", "WhatsApp", "Email"],
  },
];

const trustBadges = [
  { icon: "🔒", label: "DPDP Compliant" },
  { icon: "⚡", label: "10-min Setup" },
  { icon: "💬", label: "WhatsApp Native" },
];

export default function CTA() {
  return (
    <section className="py-24 px-4">
      {/* CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden
          border border-cyan-500/20
          bg-gradient-to-br from-cyan-950/60 to-violet-950/60
          backdrop-blur-sm p-10 md:p-16 text-center"
      >
        {/* Blurred orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Ready to Stop{" "}
            <span className="gradient-text">Missing Patients?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-slate-400 text-lg mb-10"
          >
            Join 200+ clinics already using Reva. Setup takes 10 minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-base hover:opacity-90 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-cyan-500/20">
              Start Free — No Credit Card
            </button>
            <a
              href="#"
              className="text-slate-300 hover:text-white font-medium text-base transition-colors duration-200"
            >
              Talk to Sales →
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-24 px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <span className="text-white font-bold text-lg">Reva AI</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-powered clinic assistant for modern healthcare.
            </p>
          </div>

          {/* Link cols */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2025 Reva AI Technologies Pvt. Ltd. Made with ♥ in India
          </p>
          <div className="flex items-center gap-4">
            {/* Twitter/X */}
            <a href="#" aria-label="Twitter/X" className="text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
}
