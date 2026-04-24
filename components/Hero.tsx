"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const MESSAGES = [
  {
    id: 1,
    side: "left",
    text: "Hi, I need to book an appointment with Dr. Sharma",
    time: "10:02 AM",
  },
  {
    id: 2,
    side: "right",
    text: "Hi! I'm Reva 👋 Dr. Sharma has slots available:",
    time: "10:02 AM",
  },
  {
    id: 3,
    side: "right",
    isCard: true,
    time: "10:02 AM",
    card: {
      date: "Tomorrow, Dec 31",
      slots: ["10:30 AM ✓", "2:00 PM ✓", "4:15 PM ✓"],
    },
  },
  {
    id: 4,
    side: "left",
    text: "10:30 AM works for me",
    time: "10:03 AM",
  },
  {
    id: 5,
    side: "right",
    text: "✅ Booked! Appointment confirmed for tomorrow at 10:30 AM. You'll get a reminder 1hr before. See you! 🎉",
    time: "10:03 AM",
  },
];

const AVATAR_COLORS = [
  "bg-cyan-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
];

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-[#005C4B] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, 600 + i * 900);
    });

    // Typing indicator after last message
    setTimeout(() => {
      setShowTyping(true);
    }, 600 + MESSAGES.length * 900 + 300);

    // Final message
    setTimeout(() => {
      setShowTyping(false);
      setShowFinal(true);
    }, 600 + MESSAGES.length * 900 + 1500);
  }, [inView]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#050714" }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "#06B6D4", transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "#8B5CF6", transform: "translate(-30%, 30%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        {/* LEFT SIDE */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="w-fit">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs px-4 py-1.5 font-medium tracking-wide">
              ✦ AI Receptionist for Clinics
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold leading-tight text-white"
          >
            Your Clinic Deserves a Receptionist That
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #06B6D4, #8B5CF6, #06B6D4)",
                backgroundSize: "200% auto",
                animation: "gradientShift 4s linear infinite",
              }}
            >
              Never Sleeps
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-lg max-w-md leading-relaxed"
          >
            Reva handles WhatsApp bookings, missed calls, and appointment
            reminders — 24/7, automatically. Your staff focuses on patients,
            not phones.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 flex-wrap">
            <motion.a
              href="#early-access"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-full px-7 py-3.5 font-semibold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/45 transition-shadow duration-300"
            >
              Start Free Trial →
            </motion.a>
            <motion.a
              href="#demo"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border border-white/20 rounded-full px-7 py-3.5 text-slate-300 text-sm font-medium hover:bg-white/[0.05] transition-colors duration-200"
            >
              Watch Demo
            </motion.a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {AVATAR_COLORS.map((color, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${color} border-2 border-[#050714] flex items-center justify-center text-white text-[9px] font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              Trusted by <span className="text-white font-semibold">200+</span> clinics across India
            </p>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE — Phone Mockup */}
        <div className="flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{ animation: "float 5s ease-in-out infinite" }}
            className="relative w-[300px] sm:w-[320px]"
          >
            {/* Phone frame */}
            <div className="bg-[#111827] rounded-[2.5rem] border-4 border-[#1f2937] shadow-2xl shadow-black/60 overflow-hidden">
              {/* Notch */}
              <div className="h-6 bg-[#111827] flex justify-center items-end pb-1">
                <div className="w-20 h-1 rounded-full bg-[#1f2937]" />
              </div>

              {/* WhatsApp header */}
              <div className="bg-[#1a1a2e] px-3 py-2 flex items-center gap-2 border-b border-white/[0.06]">
                <button className="text-cyan-400 text-lg mr-1">‹</button>
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  RC
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold leading-none">
                    Regal Clinic
                  </p>
                  <p className="text-emerald-400 text-[10px] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    online
                  </p>
                </div>
                <div className="flex gap-3 text-slate-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
                  </svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
                  </svg>
                </div>
              </div>

              {/* Chat area */}
              <div
                className="bg-[#0d1117] h-[420px] overflow-hidden px-3 py-3 flex flex-col gap-0.5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {MESSAGES.map((msg) =>
                  visibleMessages.includes(msg.id) ? (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`flex mb-1 ${
                        msg.side === "right" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.isCard ? (
                        <div className="bg-[#005C4B] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                          <div className="bg-black/20 rounded-xl p-2.5">
                            <p className="text-cyan-300 text-xs font-semibold mb-1.5">
                              📅 {msg.card!.date}
                            </p>
                            <div className="flex flex-col gap-1">
                              {msg.card!.slots.map((slot, i) => (
                                <p key={i} className="text-white/90 text-xs">
                                  • {slot}
                                </p>
                              ))}
                            </div>
                          </div>
                          <p className="text-white/40 text-[9px] text-right mt-1">
                            {msg.time}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-3 py-2 max-w-[80%] ${
                            msg.side === "right"
                              ? "bg-[#005C4B] rounded-tr-sm"
                              : "bg-[#1f2937] rounded-tl-sm"
                          }`}
                        >
                          <p className="text-white/90 text-xs leading-relaxed">
                            {msg.text}
                          </p>
                          <p className="text-white/40 text-[9px] text-right mt-1">
                            {msg.time}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : null
                )}

                {showTyping && <TypingIndicator />}

                {showFinal && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-end mb-1"
                  >
                    <div className="bg-[#005C4B] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                      <p className="text-white/90 text-xs leading-relaxed">
                        Need anything else? I'm here 24/7 🙂
                      </p>
                      <p className="text-white/40 text-[9px] text-right mt-1">
                        10:04 AM
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input bar */}
              <div className="bg-[#1a1a2e] px-3 py-2 flex items-center gap-2 border-t border-white/[0.06]">
                <div className="flex-1 bg-[#0d1117] rounded-full px-3 py-1.5">
                  <p className="text-slate-600 text-xs">Type a message</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="h-5 bg-[#111827] flex justify-center items-start pt-1">
                <div className="w-24 h-1 rounded-full bg-[#1f2937]" />
              </div>
            </div>

            {/* Glow under phone */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-2xl opacity-40"
              style={{ background: "linear-gradient(90deg, #06B6D4, #8B5CF6)" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
