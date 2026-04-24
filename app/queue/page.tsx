"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from "framer-motion";
import { QrCode, Clock, Bell, Check, Star, MessageCircle, Phone } from "lucide-react";

type Phase = "lookup" | "waiting" | "ready" | "done";

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 18 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <>{display}</>;
}

const statusUpdates = [
  { icon: Check, text: "You're checked in", color: "text-slate-400", border: "border-slate-700/60", bg: "bg-slate-800/40" },
  { icon: Bell, text: "We'll WhatsApp you when you're next", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/5" },
  { icon: MessageCircle, text: "You can wait outside — we'll notify you", color: "text-slate-500", border: "border-slate-700/40", bg: "bg-slate-800/20" },
];

export default function QueuePage() {
  const [phase, setPhase] = useState<Phase>("lookup");
  const [patientName, setPatientName] = useState("");
  const [inputName, setInputName] = useState("");
  const [position, setPosition] = useState(3);
  const [totalAhead, setTotalAhead] = useState(3);
  const [estimatedWait, setEstimatedWait] = useState(22);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [rating, setRating] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate queue moving
  useEffect(() => {
    if (phase !== "waiting") return;

    intervalRef.current = setInterval(() => {
      setPosition((prev) => {
        const next = prev - 1;
        setEstimatedWait((w) => Math.max(0, w - 7));
        if (next <= 0) {
          setPhase("ready");
          clearInterval(intervalRef.current!);
          return 0;
        }
        return next;
      });
    }, 8000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Auto-transition ready → done
  useEffect(() => {
    if (phase !== "ready") return;
    readyTimerRef.current = setTimeout(() => setPhase("done"), 30000);
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, [phase]);

  const handleLookup = () => {
    if (!inputName.trim()) return;
    setPatientName(inputName.trim());
    setPhase("waiting");
  };

  const handleRating = (val: number) => {
    setRating(val);
    if (val >= 4) setShowReview(true);
  };

  const progressPercent = Math.max(0, Math.min(100, ((22 - estimatedWait) / 22) * 100));

  return (
    <div className="min-h-screen bg-[#050714] text-white relative overflow-hidden flex flex-col">
      {/* Background orb */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        {phase === "ready" ? (
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* ─── PHASE: LOOKUP ─── */}
          {phase === "lookup" && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <p className="text-slate-500 text-sm tracking-widest uppercase mb-10">
                Dr. Sharma&apos;s Clinic
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 leading-tight">
                Check your queue position
              </h1>
              <p className="text-slate-400 text-center mb-10 text-base">
                Enter the name you booked with
              </p>

              <div className="w-full max-w-sm space-y-6">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="Your full name"
                  className="w-full bg-transparent border-b border-slate-600 focus:border-cyan-400 outline-none text-2xl text-white placeholder:text-slate-600 py-3 transition-colors duration-200"
                />

                <motion.button
                  onClick={handleLookup}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-4 rounded-full text-base font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Find My Position →
                </motion.button>
              </div>

              <div className="mt-14 flex flex-col items-center gap-3">
                <div className="w-20 h-20 border border-slate-700 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-600 text-xs text-center">
                  Or scan the QR code at reception
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE: WAITING ─── */}
          {phase === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <span className="text-slate-300 font-medium text-sm">Dr. Sharma&apos;s Clinic</span>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">Live</span>
                </div>
              </div>

              {/* Big position number */}
              <div className="flex flex-col items-center pt-8 pb-6 px-6">
                <p className="text-slate-500 text-xs tracking-widest uppercase mb-1">YOUR POSITION</p>
                <motion.div
                  key={position}
                  layout
                  className="text-[120px] md:text-[180px] font-black leading-none bg-gradient-to-b from-cyan-300 to-violet-500 bg-clip-text text-transparent"
                >
                  <AnimatedNumber value={position} />
                </motion.div>
                <p className="text-slate-400 text-base mt-1">patients ahead of you</p>
              </div>

              {/* Visual queue circles */}
              <div className="flex items-end justify-center gap-3 px-6 mb-8">
                {Array.from({ length: Math.min(totalAhead, 4) }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    {i === 0 && (
                      <span className="text-[10px] text-emerald-400 font-medium">Next</span>
                    )}
                    <motion.div
                      animate={i === 0 ? { boxShadow: ["0 0 0px #10b981", "0 0 16px #10b981", "0 0 0px #10b981"] } : {}}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className={`w-10 h-10 rounded-full border ${
                        i === 0
                          ? "bg-emerald-500/20 border-emerald-500/50"
                          : "bg-white/[0.07] border-white/[0.08]"
                      }`}
                    />
                  </div>
                ))}
                {/* Patient's own circle */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-cyan-400 font-medium">You</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 border border-cyan-400/40 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {patientName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wait time card */}
              <div className="mx-6 mb-6 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium text-sm">
                    Estimated wait: {estimatedWait} minutes
                  </span>
                </div>
                <p className="text-slate-500 text-xs mb-3">Average consultation: 7–8 mins</p>
                <div className="w-full h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Status updates */}
              <div className="mx-6 mb-6 space-y-2">
                {statusUpdates.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 + 0.3 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.border} ${item.bg}`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                    <span className={`text-sm ${item.color}`}>{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Notify toggle */}
              <div className="mx-6 mb-6">
                <motion.button
                  onClick={() => setNotifyEnabled((v) => !v)}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all border ${
                    notifyEnabled
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                      : "bg-white/[0.04] border-white/[0.08] text-slate-400"
                  }`}
                >
                  <Bell className={`w-4 h-4 ${notifyEnabled ? "text-cyan-400" : "text-slate-500"}`} />
                  {notifyEnabled ? "Notifications ON — WhatsApp when 2 ahead" : "Notify me when I'm next"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE: READY ─── */}
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px #10b981",
                    "0 0 60px #10b981",
                    "0 0 0px #10b981",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-8"
              >
                <Check className="w-14 h-14 text-emerald-400" strokeWidth={3} />
              </motion.div>

              <h1 className="text-4xl font-black mb-3">It&apos;s your turn! 🎉</h1>
              <p className="text-slate-300 text-lg mb-2">Please head to the consultation room</p>
              <p className="text-slate-500 text-sm">Dr. Sharma is ready for you</p>
            </motion.div>
          )}

          {/* ─── PHASE: DONE ─── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <h1 className="text-2xl font-bold mb-2">Thank you for visiting</h1>
              <p className="text-slate-400 mb-8">Dr. Sharma&apos;s Clinic</p>

              <p className="text-slate-400 text-sm mb-4">How was your experience?</p>
              <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((val) => (
                  <motion.button
                    key={val}
                    onClick={() => handleRating(val)}
                    whileTap={{ scale: 1.2 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        val <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {showReview && (
                  <motion.a
                    href="#"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 font-semibold text-sm mb-4 inline-block"
                  >
                    Leave a Google Review →
                  </motion.a>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 text-slate-500 text-sm mt-4">
                <MessageCircle className="w-4 h-4" />
                <span>We&apos;ll send your prescription via WhatsApp shortly</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating bottom bar (all phases except done) */}
      {phase !== "done" && (
        <div className="relative z-20 border-t border-white/[0.06] bg-[#050714]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Dr. Sharma&apos;s Clinic · Mumbai</span>
          <a href="tel:+912212345678" className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Phone className="w-3 h-3" />
            +91 22 1234 5678
          </a>
        </div>
      )}
    </div>
  );
}
