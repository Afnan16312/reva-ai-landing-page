"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useSpring,
} from "framer-motion";
import {
  Clock,
  Calendar,
  User,
  Stethoscope,
  ChevronLeft,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "landing" | "checkin";

// ─── Constants ────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { emoji: "🌡️", label: "Fever" },
  { emoji: "🤕", label: "Headache" },
  { emoji: "😮‍💨", label: "Cough" },
  { emoji: "💔", label: "Chest Pain" },
  { emoji: "🤢", label: "Nausea" },
  { emoji: "😴", label: "Fatigue" },
  { emoji: "🦴", label: "Joint Pain" },
  { emoji: "🌀", label: "Dizziness" },
  { emoji: "👁️", label: "Eye Issues" },
  { emoji: "👂", label: "Ear Pain" },
  { emoji: "🤧", label: "Runny Nose" },
  { emoji: "🫁", label: "Shortness of Breath" },
  { emoji: "🤒", label: "Chills" },
  { emoji: "💊", label: "Medication Side Effects" },
  { emoji: "😰", label: "Anxiety" },
  { emoji: "🩺", label: "Other" },
];

const DURATIONS = [
  { emoji: "⚡", label: "Just started", sub: "Today" },
  { emoji: "📅", label: "2-3 days", sub: "Past few days" },
  { emoji: "📆", label: "About a week", sub: "5-7 days" },
  { emoji: "🗓️", label: "2 weeks", sub: "Around 2 weeks" },
  { emoji: "📅", label: "Over a month", sub: "Chronic" },
  { emoji: "♾️", label: "Ongoing condition", sub: "Pre-existing" },
];

const COMMON_COMPLAINTS = [
  { emoji: "🌡️", label: "Fever" },
  { emoji: "🤕", label: "Headache" },
  { emoji: "😮‍💨", label: "Cough" },
  { emoji: "💔", label: "Chest pain" },
  { emoji: "🤢", label: "Stomach ache" },
  { emoji: "🦴", label: "Joint pain" },
  { emoji: "😴", label: "Fatigue" },
  { emoji: "🩺", label: "Skin issue" },
];

const NOTE_PROMPTS = ["Recent travel", "Family history", "Lifestyle change", "Worsening at night"];

// ─── Slide variants ────────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

const slideTransition = { duration: 0.35, ease: "easeInOut" as const };

// ─── Noise texture ─────────────────────────────────────────────────────────────
const noiseStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};

// ─── Glassmorphism class ───────────────────────────────────────────────────────
const glass = "bg-white/[0.04] border border-white/[0.1] rounded-2xl backdrop-blur-xl";

// ─── Severity helpers ──────────────────────────────────────────────────────────
function getSeverityColor(v: number): string {
  if (v <= 3) return "#10B981";
  if (v <= 6) return "#F59E0B";
  if (v <= 8) return "#F97316";
  return "#EF4444";
}
function getSeverityLabel(v: number): string {
  if (v <= 3) return "Mild";
  if (v <= 6) return "Moderate";
  if (v <= 8) return "Severe";
  return "Critical";
}
function getSeverityEmoji(v: number): string {
  if (v <= 3) return "😊";
  if (v <= 6) return "😐";
  if (v <= 8) return "😟";
  return "😣";
}
function getSeverityOrbColor(v: number): string {
  if (v <= 3) return "rgba(16,185,129,0.15)";
  if (v <= 6) return "rgba(245,158,11,0.15)";
  if (v <= 8) return "rgba(249,115,22,0.15)";
  return "rgba(239,68,68,0.15)";
}

// ─── Animated Checkmark SVG ────────────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <motion.svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "backOut" }}
    >
      <motion.circle
        cx="48"
        cy="48"
        r="44"
        stroke="rgba(6,182,212,0.3)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d="M28 48 L42 62 L68 34"
        stroke="#06B6D4"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

// ─── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === step ? 24 : 8,
            opacity: i + 1 === step ? 1 : i + 1 < step ? 0.6 : 0.2,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="h-2 rounded-full"
          style={{
            background:
              i + 1 === step
                ? "linear-gradient(to right, #06B6D4, #7C3AED)"
                : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Orbs ──────────────────────────────────────────────────────────────────────
function Orbs() {
  return (
    <>
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </>
  );
}

// ─── Landing page ──────────────────────────────────────────────────────────────
function Landing({ onStart }: { onStart: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });
  const benefitsRef = useRef<HTMLDivElement>(null);
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-80px" });

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto overflow-x-hidden"
      style={{ background: "#050714" }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={noiseStyle} />

      {/* ── Hero section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 z-10">
        <Orbs />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium"
          >
            📋 Pre-Visit Check-in
          </motion.div>

          {/* Clinic name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-400 text-sm mt-2"
          >
            Dr. Sharma&apos;s Clinic
          </motion.p>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-black leading-tight text-white mt-4"
          >
            Help your doctor
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #06B6D4, #7C3AED, #06B6D4)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              }}
            >
              help you better.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-slate-400 text-lg max-w-sm text-center mt-4"
          >
            Takes 2 minutes. Your doctor reviews your responses before you walk in.
          </motion.p>

          {/* Appointment card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className={`${glass} mt-8 max-w-sm w-full p-4 space-y-3`}
          >
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Today, December 31</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
              <span>10:30 AM</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Dr. Sharma</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Stethoscope className="w-4 h-4 text-violet-400 shrink-0" />
              <span>General Checkup</span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="mt-8 px-8 py-4 rounded-full text-base font-bold text-white cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
              boxShadow: "0 0 40px rgba(6,182,212,0.35), 0 0 80px rgba(124,58,237,0.2)",
            }}
          >
            Begin Check-in →
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-600 text-xs mt-4"
          >
            Press Enter or tap to continue
          </motion.p>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </section>

      {/* ── Stats section ── */}
      <section className="relative z-10 px-4 py-24 max-w-4xl mx-auto">
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { stat: "2 min", desc: "Average completion time" },
            { stat: "3x", desc: "Faster first consultation" },
            { stat: "94%", desc: "Doctors say it improves diagnosis" },
          ].map((item, i) => (
            <motion.div
              key={item.stat}
              initial={{ opacity: 0, y: 32 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              className={`${glass} p-6 text-center`}
            >
              <div
                className="text-4xl font-black bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #7C3AED)" }}
              >
                {item.stat}
              </div>
              <div className="text-slate-400 text-sm mt-1">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <div ref={benefitsRef} className="mt-12 space-y-4">
          {[
            {
              icon: "⚡",
              title: "Skip the paperwork",
              desc: "No forms at reception. Everything is ready when you arrive.",
            },
            {
              icon: "🧠",
              title: "Smarter consultation",
              desc: "Your doctor sees your symptoms before you walk in — no time wasted.",
            },
            {
              icon: "🔒",
              title: "Private & secure",
              desc: "Your responses are only shared with Dr. Sharma's Clinic.",
            },
          ].map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, x: -32 }}
              animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
              className={`${glass} p-5 flex items-start gap-4`}
            >
              <span className="text-2xl shrink-0">{b.icon}</span>
              <div>
                <div className="text-white font-bold text-base">{b.title}</div>
                <div className="text-slate-400 text-sm mt-0.5">{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bounce arrow */}
        <div className="flex justify-center mt-16">
          <motion.div
            className="text-slate-600"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ─── Big step number background ────────────────────────────────────────────────
function BigNumber({ n }: { n: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      aria-hidden
    >
      <span
        className="font-black text-white"
        style={{ fontSize: "clamp(140px,22vw,220px)", opacity: 0.025, lineHeight: 1 }}
      >
        {n}
      </span>
    </div>
  );
}

// ─── Step wrapper ──────────────────────────────────────────────────────────────
function StepContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 relative">
      {children}
    </div>
  );
}

// ─── Step 1 ────────────────────────────────────────────────────────────────────
function Step1({
  confirmed,
  setConfirmed,
}: {
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
}) {
  return (
    <StepContent>
      <BigNumber n="01" />
      <div className="relative z-10 w-full max-w-lg text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          Before we begin, confirm your details
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 mt-3"
        >
          Make sure we have the right appointment information.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${glass} mt-8 p-6 text-left space-y-3`}
        >
          <div className="text-2xl font-bold text-white">Priya Sharma</div>
          <div className="text-slate-400 text-sm">Today 10:30 AM · Dr. Sharma</div>
          <div className="text-slate-400 text-sm">General Checkup</div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setConfirmed(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                confirmed
                  ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                  : "bg-white/[0.06] border border-white/10 text-slate-300"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              This is me
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setConfirmed(false)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.04] border border-white/10 text-slate-400"
            >
              Not me
            </motion.button>
          </div>
        </motion.div>
      </div>
    </StepContent>
  );
}

// ─── Step 2 ────────────────────────────────────────────────────────────────────
function Step2({
  complaint,
  setComplaint,
}: {
  complaint: string;
  setComplaint: (v: string) => void;
}) {
  return (
    <StepContent>
      <BigNumber n="02" />
      <div className="relative z-10 w-full max-w-lg">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          What&apos;s your main concern today?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 mt-3"
        >
          In a few words, what brings you in?
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 border-b border-white/20 pb-2"
        >
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="e.g. I've had a headache for 3 days..."
            rows={2}
            className="w-full bg-transparent outline-none text-2xl text-white placeholder-white/20 resize-none"
            style={{ caretColor: "#06B6D4" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <p className="text-slate-500 text-xs mb-3 uppercase tracking-wider">Common concerns</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_COMPLAINTS.map((c, i) => (
              <motion.button
                key={c.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: i * 0.04 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={() =>
                  setComplaint(complaint ? `${complaint}, ${c.label.toLowerCase()}` : c.label)
                }
                className="px-3 py-1.5 rounded-full text-sm border border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors"
              >
                {c.emoji} {c.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </StepContent>
  );
}

// ─── Step 3 ────────────────────────────────────────────────────────────────────
function Step3({
  symptoms,
  setSymptoms,
}: {
  symptoms: string[];
  setSymptoms: (v: string[]) => void;
}) {
  const toggle = (label: string) => {
    setSymptoms(
      symptoms.includes(label) ? symptoms.filter((s) => s !== label) : [...symptoms, label]
    );
  };

  return (
    <StepContent>
      <BigNumber n="03" />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex items-center gap-3 flex-wrap">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Which symptoms are you experiencing?
          </motion.h2>
          <AnimatePresence>
            {symptoms.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              >
                {symptoms.length} selected
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 mt-2"
        >
          Select all that apply
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {SYMPTOMS.map((s, i) => {
            const selected = symptoms.includes(s.label);
            return (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(s.label)}
                className="relative p-4 rounded-2xl border text-left cursor-pointer transition-colors"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(124,58,237,0.18))"
                    : "rgba(255,255,255,0.03)",
                  borderColor: selected ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.06)",
                }}
              >
                <div className="text-3xl">{s.emoji}</div>
                <div className="text-white text-sm font-medium mt-1 leading-tight">{s.label}</div>
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </StepContent>
  );
}

// ─── Step 4 ────────────────────────────────────────────────────────────────────
function Step4({
  severity,
  setSeverity,
}: {
  severity: number;
  setSeverity: (v: number) => void;
}) {
  const color = getSeverityColor(severity);
  const orbColor = getSeverityOrbColor(severity);

  return (
    <StepContent>
      {/* Dynamic orb that shifts based on severity */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundColor: orbColor }}
        transition={{ duration: 0.6 }}
        style={{ borderRadius: "50%", filter: "blur(120px)", width: "60%", height: "60%", left: "20%", top: "20%" }}
      />
      <BigNumber n="04" />
      <div className="relative z-10 w-full max-w-lg text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          How bad are your symptoms?
        </motion.h2>

        {/* Emoji */}
        <div className="mt-8 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={getSeverityEmoji(severity)}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-6xl"
            >
              {getSeverityEmoji(severity)}
            </motion.span>
          </AnimatePresence>

          {/* Number */}
          <motion.div
            animate={{ color }}
            transition={{ duration: 0.4 }}
            className="text-8xl font-black mt-2 tabular-nums"
          >
            {severity}
          </motion.div>

          <motion.div animate={{ color }} transition={{ duration: 0.4 }} className="text-lg font-semibold mt-1">
            {getSeverityLabel(severity)}
          </motion.div>
        </div>

        {/* Styled slider */}
        <div className="mt-8 px-2">
          <input
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)`,
            }}
          />
          <style>{`
            input[type=range]::-webkit-slider-thumb {
              appearance: none;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: white;
              box-shadow: 0 0 0 3px rgba(6,182,212,0.4), 0 0 12px rgba(6,182,212,0.5);
              cursor: pointer;
            }
            input[type=range]::-moz-range-thumb {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: white;
              box-shadow: 0 0 0 3px rgba(6,182,212,0.4);
              cursor: pointer;
              border: none;
            }
          `}</style>
        </div>

        {/* Numbered dots */}
        <div className="flex justify-between mt-3 px-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setSeverity(n)}
              className="text-xs transition-all"
              style={{ color: n === severity ? color : "rgba(255,255,255,0.25)", fontWeight: n === severity ? 700 : 400 }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </StepContent>
  );
}

// ─── Step 5 ────────────────────────────────────────────────────────────────────
function Step5({
  duration,
  setDuration,
}: {
  duration: string;
  setDuration: (v: string) => void;
}) {
  return (
    <StepContent>
      <BigNumber n="05" />
      <div className="relative z-10 w-full max-w-lg">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          How long have you had these symptoms?
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
          {DURATIONS.map((d, i) => {
            const selected = duration === d.label;
            return (
              <motion.button
                key={d.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 24 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDuration(d.label)}
                className="p-4 rounded-2xl border text-left cursor-pointer"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(124,58,237,0.18))"
                    : "rgba(255,255,255,0.03)",
                  borderColor: selected ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-2xl">{d.emoji}</div>
                <div className="text-white font-bold text-sm mt-1">{d.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{d.sub}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </StepContent>
  );
}

// ─── Step 6 ────────────────────────────────────────────────────────────────────
function Step6({
  takingMeds,
  setTakingMeds,
  medications,
  setMedications,
  allergies,
  setAllergies,
}: {
  takingMeds: boolean | null;
  setTakingMeds: (v: boolean | null) => void;
  medications: string;
  setMedications: (v: string) => void;
  allergies: string;
  setAllergies: (v: string) => void;
}) {
  return (
    <StepContent>
      <BigNumber n="06" />
      <div className="relative z-10 w-full max-w-lg">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          Are you currently taking any medications?
        </motion.h2>

        <div className="flex gap-4 mt-8">
          {[true, false].map((val) => {
            const selected = takingMeds === val;
            return (
              <motion.button
                key={String(val)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTakingMeds(val)}
                className="flex-1 py-5 rounded-2xl border text-xl font-bold cursor-pointer transition-all"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(124,58,237,0.2))"
                    : "rgba(255,255,255,0.03)",
                  borderColor: selected ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.08)",
                  color: selected ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                {val ? "✓ Yes" : "✗ No"}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {takingMeds === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-b border-white/20 pb-2">
                <p className="text-slate-400 text-sm mb-2">Please list them:</p>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
                  rows={2}
                  className="w-full bg-transparent outline-none text-lg text-white placeholder-white/20 resize-none"
                  style={{ caretColor: "#06B6D4" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Allergies */}
        <div className="mt-8">
          <p className="text-slate-400 text-sm font-medium mb-2">Any known allergies?</p>
          <div className="border-b border-white/20 pb-2">
            <input
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs"
              className="w-full bg-transparent outline-none text-lg text-white placeholder-white/20"
              style={{ caretColor: "#06B6D4" }}
            />
          </div>
        </div>
      </div>
    </StepContent>
  );
}

// ─── Step 7 ────────────────────────────────────────────────────────────────────
function Step7({ notes, setNotes }: { notes: string; setNotes: (v: string) => void }) {
  const maxChars = 500;
  return (
    <StepContent>
      <BigNumber n="07" />
      <div className="relative z-10 w-full max-w-lg">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          Anything else Dr. Sharma should know?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 mt-2"
        >
          Optional — but the more context, the better.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 border-b border-white/20 pb-2 relative"
        >
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, maxChars))}
            placeholder="Share anything relevant — recent travel, family history, when it gets worse..."
            rows={4}
            className="w-full bg-transparent outline-none text-xl text-white placeholder-white/20 resize-none"
            style={{ caretColor: "#06B6D4" }}
          />
          <span className="absolute bottom-2 right-0 text-xs text-slate-600">
            {notes.length}/{maxChars}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mt-5"
        >
          {NOTE_PROMPTS.map((p, i) => (
            <motion.button
              key={p}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotes(notes ? `${notes} ${p.toLowerCase()}` : p)}
              className="px-3 py-1.5 rounded-full text-sm border border-white/10 bg-white/[0.04] text-slate-300"
            >
              {p}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </StepContent>
  );
}

// ─── Step 8 ────────────────────────────────────────────────────────────────────
function Step8({
  complaint,
  symptoms,
  severity,
  duration,
  processed,
  setProcessed,
}: {
  complaint: string;
  symptoms: string[];
  severity: number;
  duration: string;
  processed: boolean;
  setProcessed: (v: boolean) => void;
}) {
  const [phaseText, setPhaseText] = useState("Analyzing your symptoms...");

  useEffect(() => {
    const texts = [
      "Analyzing your symptoms...",
      "Checking Dr. Sharma's notes...",
      "Preparing your brief...",
    ];
    const timings = [0, 700, 1400];
    const timeouts = timings.map((t, i) =>
      setTimeout(() => setPhaseText(texts[i]), t)
    );
    const done = setTimeout(() => setProcessed(true), 2100);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!processed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Pulsing orb */}
        <motion.div
          className="w-48 h-48 rounded-full mb-10"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(124,58,237,0.3) 50%, transparent 100%)",
            filter: "blur(20px)",
          }}
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        <AnimatePresence mode="wait">
          <motion.p
            key={phaseText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-white text-xl font-medium"
          >
            {phaseText}
          </motion.p>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <AnimatedCheck />

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-bold text-white mt-6"
      >
        You&apos;re all set! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="text-slate-400 mt-3 max-w-sm"
      >
        Dr. Sharma will review your responses before your appointment.
      </motion.p>

      {/* Appointment reminder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`${glass} mt-6 px-6 py-4 w-full max-w-sm`}
      >
        <p className="text-slate-400 text-sm">Your appointment</p>
        <p className="text-white font-semibold mt-1">Today at 10:30 AM · Dr. Sharma</p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
        className={`${glass} mt-4 px-6 py-4 w-full max-w-sm text-left space-y-2`}
      >
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Summary</div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Chief complaint</span>
          <span className="text-white font-medium truncate ml-4">{complaint || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Symptoms</span>
          <span className="text-white font-medium">{symptoms.length} selected</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Severity</span>
          <span className="text-white font-medium">{getSeverityEmoji(severity)} {severity}/10 · {getSeverityLabel(severity)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Duration</span>
          <span className="text-white font-medium">{duration || "—"}</span>
        </div>
      </motion.div>

      {/* Sent pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 300, damping: 20 }}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
      >
        <Check className="w-3.5 h-3.5" />
        Brief sent to Dr. Sharma&apos;s dashboard
      </motion.div>

      {/* Ghost buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.25 }}
        className="flex gap-3 mt-6"
      >
        <button className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/20 transition-colors">
          Add to Calendar
        </button>
        <button className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/20 transition-colors">
          Set Reminder
        </button>
      </motion.div>

      {/* Done button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => window.location.reload()}
        className="mt-8 px-8 py-3 rounded-full font-bold text-white text-sm"
        style={{ background: "linear-gradient(135deg, #06B6D4, #7C3AED)" }}
      >
        Done
      </motion.button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function CheckinPage() {
  const [mode, setMode] = useState<Mode>("landing");
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form state
  const [confirmed, setConfirmed] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("");
  const [takingMeds, setTakingMeds] = useState<boolean | null>(null);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [processed, setProcessed] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 8));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // Global Enter key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && mode === "checkin" && step < 8) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "TEXTAREA") goNext();
      }
      if (e.key === "Enter" && mode === "landing") {
        setMode("checkin");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, step, goNext]);

  if (mode === "landing") {
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}</style>
        <Landing onStart={() => setMode("checkin")} />
      </>
    );
  }

  // ── Check-in mode ──
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 confirmed={confirmed} setConfirmed={setConfirmed} />;
      case 2:
        return <Step2 complaint={complaint} setComplaint={setComplaint} />;
      case 3:
        return <Step3 symptoms={symptoms} setSymptoms={setSymptoms} />;
      case 4:
        return <Step4 severity={severity} setSeverity={setSeverity} />;
      case 5:
        return <Step5 duration={duration} setDuration={setDuration} />;
      case 6:
        return (
          <Step6
            takingMeds={takingMeds}
            setTakingMeds={setTakingMeds}
            medications={medications}
            setMedications={setMedications}
            allergies={allergies}
            setAllergies={setAllergies}
          />
        );
      case 7:
        return <Step7 notes={notes} setNotes={setNotes} />;
      case 8:
        return (
          <Step8
            complaint={complaint}
            symptoms={symptoms}
            severity={severity}
            duration={duration}
            processed={processed}
            setProcessed={setProcessed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative h-screen overflow-hidden flex flex-col"
      style={{ background: "#050714" }}
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" style={noiseStyle} />

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Orbs />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-8 pt-5 pb-4 shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goBack}
          className={`flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm font-medium ${step === 1 ? "opacity-30 pointer-events-none" : ""}`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        <ProgressDots step={step} total={8} />

        <span className="text-slate-500 text-xs">Step {step} of 8</span>
      </div>

      {/* Step content with animation */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex-1 flex flex-col overflow-y-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      {step < 8 && (
        <div className="relative z-10 flex flex-col items-center gap-2 px-4 py-5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            className="px-10 py-4 rounded-full font-bold text-white text-base w-full max-w-sm"
            style={{
              background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
              boxShadow: "0 0 32px rgba(6,182,212,0.25)",
            }}
          >
            Continue →
          </motion.button>
          <span className="text-slate-600 text-xs">or press Enter ↵</span>
        </div>
      )}
    </div>
  );
}
