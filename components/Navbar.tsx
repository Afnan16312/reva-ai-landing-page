"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navLinks = ["Features", "How it works", "Pricing", "Testimonials"];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-4 h-4"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              <path d="M9.5 6.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zM14 6.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" />
              <path
                fillRule="evenodd"
                d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06L5.636 5.197a.75.75 0 0 1 0-1.06ZM18.364 4.136a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.591-1.591a.75.75 0 0 1 1.06 0ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Reva<span className="text-cyan-400">AI</span>
          </span>
        </div>

        {/* Nav Links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-slate-400 text-sm hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.a
          href="#early-access"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-full px-5 py-2 text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow duration-300"
        >
          Get Early Access
        </motion.a>
      </div>
    </motion.nav>
  );
}
