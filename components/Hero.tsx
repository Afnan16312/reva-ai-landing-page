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

        {/* RIGHT SIDE — Premium iPhone Mockup */}
        <div className="flex flex-col items-center lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{ animation: "float 5s ease-in-out infinite" }}
            className="relative w-[300px] sm:w-[330px]"
          >
            {/* Outer iPhone Titanium/Aluminum Frame */}
            <div className="relative rounded-[50px] p-[10px] bg-gradient-to-b from-[#2a2d37] via-[#15171e] to-[#0c0d12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12)]">
              {/* Inner Bezel */}
              <div className="relative bg-black rounded-[40px] overflow-hidden border border-white/[0.08] flex flex-col">
                
                {/* iPhone Status Bar + Dynamic Island */}
                <div className="bg-[#0b141a] pt-3 pb-2 px-6 flex items-center justify-between z-20 relative select-none">
                  <span className="text-white text-[11px] font-semibold tracking-tight">9:41</span>
                  
                  {/* Dynamic Island Pill */}
                  <div className="w-24 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-[inset_0_0_4px_rgba(255,255,255,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-[#121826] border border-blue-500/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0a0f1d]" />
                  </div>

                  <div className="flex items-center gap-1.5 text-white/90">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 21l3.49-.92C9.37 20.64 10.65 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16.5c-1.25 0-2.42-.35-3.42-.96l-.25-.15-2.07.54.55-2.02-.16-.26A7.44 7.44 0 0 1 4.5 12C4.5 7.86 7.86 4.5 12 4.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5z" />
                    </svg>
                    <div className="w-4 h-2.5 border border-white/80 rounded-sm p-0.5 flex items-center">
                      <div className="w-full h-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Header */}
                <div className="bg-[#1f2c34] px-3.5 py-2.5 flex items-center gap-2.5 border-b border-white/[0.06] z-10">
                  <button className="text-slate-300 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      RC
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1f2c34]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold leading-tight truncate">
                      Regal Clinic
                    </p>
                    <p className="text-emerald-400 text-[10px] font-medium leading-none mt-0.5">
                      online
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <svg className="w-4 h-4 hover:text-white cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
                    </svg>
                    <svg className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
                    </svg>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div
                  className="bg-[#0b141a] h-[410px] overflow-hidden px-3 py-3 flex flex-col gap-1.5 relative"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                >
                  {MESSAGES.map((msg) =>
                    visibleMessages.includes(msg.id) ? (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`flex mb-0.5 ${
                          msg.side === "right" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.isCard ? (
                          <div className="bg-[#005c4b] rounded-2xl rounded-tr-xs px-3 py-2 max-w-[85%] shadow-md border border-emerald-400/20">
                            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                              <p className="text-cyan-300 text-xs font-semibold mb-1.5 flex items-center gap-1">
                                📅 {msg.card!.date}
                              </p>
                              <div className="flex flex-col gap-1">
                                {msg.card!.slots.map((slot, i) => (
                                  <div
                                    key={i}
                                    className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-2.5 py-1 text-white text-xs font-medium flex items-center justify-between"
                                  >
                                    <span>{slot.replace(" ✓", "")}</span>
                                    <span className="text-emerald-300 text-[10px]">Available</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="text-white/50 text-[9px] text-right mt-1 font-mono">
                              {msg.time}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`rounded-2xl px-3.5 py-2 max-w-[82%] shadow-md text-xs leading-relaxed ${
                              msg.side === "right"
                                ? "bg-[#005c4b] text-white rounded-tr-xs border border-emerald-400/20"
                                : "bg-[#202c33] text-slate-100 rounded-tl-xs border border-white/5"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <p className="text-white/40 text-[9px] text-right mt-1 font-mono">
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
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-end mb-0.5"
                    >
                      <div className="bg-[#005c4b] text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[82%] shadow-md border border-emerald-400/20">
                        <p className="text-xs leading-relaxed">
                          Need anything else? I'm here 24/7 🙂
                        </p>
                        <p className="text-white/40 text-[9px] text-right mt-1 font-mono">
                          10:04 AM
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* WhatsApp Chat Input Bar */}
                <div className="bg-[#1f2c34] px-2.5 py-2 flex items-center gap-2 border-t border-white/[0.06]">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Type a message</span>
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.373L8.552 18.32a1.5 1.5 0 0 1-2.122-2.122l8.83-8.83" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center shadow-md cursor-pointer">
                    <svg className="w-3.5 h-3.5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </div>
                </div>

                {/* iPhone Home Indicator Bar */}
                <div className="bg-[#1f2c34] pb-2 pt-1 flex justify-center items-center">
                  <div className="w-28 h-1 rounded-full bg-white/30" />
                </div>
              </div>
            </div>

            {/* Realistic Ground Shadow under iPhone */}
            <div className="w-4/5 h-6 bg-black/90 blur-xl mx-auto -mt-2 rounded-full pointer-events-none" />
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full blur-2xl opacity-30 pointer-events-none"
              style={{ background: "linear-gradient(90deg, #06B6D4, #8B5CF6)" }}
            />
          </motion.div>

          {/* Reference-style Carousel Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="w-2.5 h-2 rounded-full bg-slate-200 shadow-sm" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>
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
