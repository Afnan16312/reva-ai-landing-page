"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  TrendingDown,
  AlertCircle,
  Zap,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  DollarSign,
  Users,
  ShieldCheck,
} from "lucide-react";

interface NoShowViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type FactorKey =
  | "prev_noshow"
  | "last_minute"
  | "unconfirmed"
  | "monday_slot"
  | "rescheduled"
  | "first_visit"
  | "confirmed_wa"
  | "regular";

interface Appointment {
  id: number;
  name: string;
  time: string;
  type: string;
  risk: number;
  level: RiskLevel;
  factors: FactorKey[];
  history: boolean[]; // true=attended, false=no-show, last 6
  reasoning: string[];
  suggestion: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    name: "Priya Sharma",
    time: "10:30 AM",
    type: "General Checkup",
    risk: 22,
    level: "Low",
    factors: ["first_visit"],
    history: [true, true, true, true, true, false],
    reasoning: [
      "First-time visitor — no historical no-show data available",
      "Booked 3 days in advance, indicating planned intent",
      "No confirmation received yet, but lead time is healthy",
    ],
    suggestion:
      "Send a friendly welcome reminder 24h before. Include clinic directions and parking info.",
  },
  {
    id: 2,
    name: "Rahul Gupta",
    time: "11:00 AM",
    type: "Follow-up",
    risk: 71,
    level: "High",
    factors: ["prev_noshow", "last_minute", "monday_slot"],
    history: [false, true, false, false, true, false],
    reasoning: [
      "2 previous no-shows — strongest single predictor of repeat behaviour",
      "Last-minute booking (< 6 hrs) correlates with 3× higher risk",
      "Monday morning slots historically show 60% higher no-show rates",
    ],
    suggestion:
      "Call the patient directly + send a WhatsApp reminder 2h before. Offer easy reschedule link.",
  },
  {
    id: 3,
    name: "Ananya Nair",
    time: "11:30 AM",
    type: "Dental Cleaning",
    risk: 45,
    level: "Medium",
    factors: ["prev_noshow", "last_minute"],
    history: [true, true, false, true, true, true],
    reasoning: [
      "1 previous no-show on record — moderate historical risk",
      "Booked yesterday — slightly elevated lead-time risk",
      "Dental cleanings see higher skip rates than urgent consultations",
    ],
    suggestion:
      "Send a WhatsApp reminder with a 1-tap confirm/reschedule option 24h before.",
  },
  {
    id: 4,
    name: "Vikram Patel",
    time: "12:00 PM",
    type: "Consultation",
    risk: 18,
    level: "Low",
    factors: ["regular", "confirmed_wa"],
    history: [true, true, true, true, true, true],
    reasoning: [
      "Long-term regular patient — 4× more reliable than average",
      "WhatsApp confirmation received — removes unconfirmed risk factor",
      "Consistent attendance record across all 6 tracked visits",
    ],
    suggestion:
      "No action needed. Patient is reliable and confirmed. Send standard day-of reminder.",
  },
  {
    id: 5,
    name: "Sunita Rao",
    time: "2:30 PM",
    type: "BP Check",
    risk: 58,
    level: "High",
    factors: ["rescheduled", "unconfirmed"],
    history: [true, false, true, true, false, true],
    reasoning: [
      "Rescheduled twice — repeated reschedules signal weak intent",
      "No WhatsApp confirmation received despite reminder sent",
      "Long travel distance increases friction-based cancellations",
    ],
    suggestion:
      "Send a WhatsApp reminder with a quick reschedule link. Follow up with a call if unread after 1h.",
  },
  {
    id: 6,
    name: "Karan Mehta",
    time: "3:00 PM",
    type: "General Checkup",
    risk: 89,
    level: "Critical",
    factors: ["prev_noshow", "unconfirmed", "monday_slot"],
    history: [false, false, false, true, false, true],
    reasoning: [
      "3 previous no-shows — highest risk tier automatically triggered",
      "Completely unconfirmed — zero engagement with reminders sent",
      "Monday afternoon slot compounds risk with post-weekend inertia",
    ],
    suggestion:
      "Immediate phone call required. Offer deposit or easy reschedule. Consider overbooking this slot.",
  },
  {
    id: 7,
    name: "Deepa Singh",
    time: "3:30 PM",
    type: "X-Ray Review",
    risk: 34,
    level: "Medium",
    factors: ["first_visit", "confirmed_wa"],
    history: [true, true, true, true, false, true],
    reasoning: [
      "New patient — no clinic-specific no-show history available",
      "WhatsApp confirmation received — positive engagement signal",
      "X-Ray reviews are result-driven, patients tend to show up",
    ],
    suggestion:
      "Send a standard reminder 2h before. Patient is confirmed and motivated by results.",
  },
];

const FACTOR_CONFIG: Record<
  FactorKey,
  { label: string; color: string; bg: string }
> = {
  prev_noshow: {
    label: "Past no-show",
    color: "text-rose-400",
    bg: "bg-rose-500/15 border-rose-500/30",
  },
  last_minute: {
    label: "Last-minute booking",
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  unconfirmed: {
    label: "Unconfirmed",
    color: "text-slate-400",
    bg: "bg-slate-500/15 border-slate-500/30",
  },
  monday_slot: {
    label: "Mon morning",
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  rescheduled: {
    label: "Rescheduled",
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  first_visit: {
    label: "New patient",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15 border-cyan-500/30",
  },
  confirmed_wa: {
    label: "WA confirmed ✓",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
  regular: {
    label: "Regular patient",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
};

const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; text: string; bar: string; border: string }
> = {
  Low: {
    color: "text-emerald-400",
    text: "Low",
    bar: "bg-emerald-500",
    border: "border-emerald-500/30",
  },
  Medium: {
    color: "text-amber-400",
    text: "Medium",
    bar: "bg-amber-500",
    border: "border-amber-500/30",
  },
  High: {
    color: "text-rose-400",
    text: "High",
    bar: "bg-rose-500",
    border: "border-rose-500/30",
  },
  Critical: {
    color: "text-red-400",
    text: "Critical",
    bar: "bg-red-600",
    border: "border-red-600/30",
  },
};

const HEATMAP_FACTORS = [
  { key: "prev_noshow" as FactorKey, label: "Past no-show", count: 4, pct: 80, barColor: "bg-rose-500" },
  { key: "last_minute" as FactorKey, label: "Last-minute booking", count: 3, pct: 60, barColor: "bg-amber-500" },
  { key: "unconfirmed" as FactorKey, label: "Unconfirmed", count: 2, pct: 40, barColor: "bg-slate-500" },
  { key: "monday_slot" as FactorKey, label: "Mon morning", count: 2, pct: 40, barColor: "bg-amber-400" },
  { key: "rescheduled" as FactorKey, label: "Rescheduled", count: 1, pct: 20, barColor: "bg-amber-300" },
  { key: "first_visit" as FactorKey, label: "New patient", count: 1, pct: 20, barColor: "bg-cyan-500" },
];

const MODEL_FACTORS = [
  { name: "Previous No-Shows", weight: "+35 pts", desc: "Strongest predictor of future behaviour", color: "text-rose-400" },
  { name: "Booking Lead Time", weight: "+20 pts", desc: "< 6hrs bookings show 3× higher risk", color: "text-amber-400" },
  { name: "Day/Time Slot", weight: "+15 pts", desc: "Monday mornings historically high risk", color: "text-amber-300" },
  { name: "Confirmation Status", weight: "+15 pts", desc: "Unconfirmed adds significant risk", color: "text-slate-400" },
  { name: "Reschedule History", weight: "+10 pts", desc: "Multiple reschedules signal intent issues", color: "text-violet-400" },
  { name: "Patient Tenure", weight: "-10 pts", desc: "Long-term patients are 4× more reliable", color: "text-emerald-400" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  accent: string;
  trend: string;
  delay: number;
}

function StatCard({ label, value, prefix = "", suffix = "", icon, accent, trend, delay }: StatCardProps) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" as const }}
      className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 overflow-hidden"
    >
      <div className={`absolute top-4 right-4 p-2 rounded-xl ${accent}/10`}>
        <div className={accent}>{icon}</div>
      </div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">
        {prefix}
        {count.toLocaleString("en-IN")}
        {suffix}
      </p>
      <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
        <span className="text-emerald-400">↑</span> {trend}
      </p>
    </motion.div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DONUT_SEGMENTS = [
  { label: "Low", count: 2, color: "#10B981", strokeColor: "#10B981" },
  { label: "Medium", count: 2, color: "#F59E0B", strokeColor: "#F59E0B" },
  { label: "High", count: 1, color: "#F43F5E", strokeColor: "#F43F5E" },
  { label: "Critical", count: 1, color: "#DC2626", strokeColor: "#DC2626" },
];

const DONUT_TOTAL = DONUT_SEGMENTS.reduce((s, d) => s + d.count, 0);

function DonutChart() {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={14} />
          {DONUT_SEGMENTS.map((seg, i) => {
            const segFrac = seg.count / DONUT_TOTAL;
            const segLen = segFrac * circumference;
            const offset = circumference - cumulative * circumference / DONUT_TOTAL;
            const gap = 3;
            cumulative += seg.count;
            return (
              <motion.circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.strokeColor}
                strokeWidth={14}
                strokeDasharray={`${Math.max(segLen - gap, 0)} ${circumference - Math.max(segLen - gap, 0)}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{ transformOrigin: `${cx}px ${cy}px`, rotate: "-90deg" }}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${Math.max(segLen - gap, 0)} ${circumference - Math.max(segLen - gap, 0)}` }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" as const }}
              />
            );
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={22} fontWeight={700}>{DONUT_TOTAL}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={10}>patients</text>
        </svg>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {DONUT_SEGMENTS.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.strokeColor }} />
            <span className="text-slate-300 text-xs flex-1">{seg.label}</span>
            <span className="text-slate-400 text-xs font-medium">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Risk Bar ─────────────────────────────────────────────────────────────────

function RiskBar({ pct, level, delay }: { pct: number; level: RiskLevel; delay: number }) {
  const cfg = RISK_CONFIG[level];
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${cfg.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: "easeOut" as const }}
        />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${cfg.color}`}>{pct}%</span>
    </div>
  );
}

// ─── Mini History Chart ───────────────────────────────────────────────────────

function MiniHistory({ history }: { history: boolean[] }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {history.map((attended, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${attended ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ height: attended ? "100%" : "60%" }}
          title={attended ? "Attended" : "No-show"}
        />
      ))}
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

function ActionButtons({
  level,
  id,
  addToast,
  reminded,
  setReminded,
}: {
  level: RiskLevel;
  id: number;
  addToast: NoShowViewProps["addToast"];
  reminded: Set<number>;
  setReminded: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const isReminded = reminded.has(id);

  const handleRemind = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReminded((prev) => new Set(prev).add(id));
    addToast("WhatsApp reminder sent successfully", "success");
    setTimeout(() => {
      setReminded((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast("Calling patient — initiating call log", "info");
  };

  const handleReschedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast("Reschedule link sent via WhatsApp", "warn");
  };

  if (level === "Low") {
    return (
      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
        <CheckCircle size={12} /> Confirmed
      </span>
    );
  }

  if (level === "Medium") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleRemind}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-300 ${
          isReminded
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
        }`}
      >
        {isReminded ? "Sent ✓" : "Send Reminder"}
      </motion.button>
    );
  }

  if (level === "High") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.stopPropagation();
          addToast("Calling patient + reminder sent", "warn");
        }}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1"
      >
        <Phone size={11} /> Call + Remind
      </motion.button>
    );
  }

  // Critical
  return (
    <div className="flex flex-col gap-1.5">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleCall}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600/15 border border-red-600/30 text-red-400 hover:bg-red-600/25 transition-all flex items-center gap-1"
      >
        <Phone size={11} /> Call Now
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleReschedule}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
      >
        Offer Reschedule
      </motion.button>
    </div>
  );
}

// ─── Appointment Row ──────────────────────────────────────────────────────────

function AppointmentRow({
  appt,
  index,
  addToast,
  reminded,
  setReminded,
}: {
  appt: Appointment;
  index: number;
  addToast: NoShowViewProps["addToast"];
  reminded: Set<number>;
  setReminded: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RISK_CONFIG[appt.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4, ease: "easeOut" as const }}
      className={`border-b border-white/[0.06] last:border-0 ${expanded ? "bg-white/[0.02]" : "hover:bg-white/[0.02]"} transition-colors cursor-pointer`}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Main row */}
      <div className="grid grid-cols-[1.4fr_1fr_0.9fr_1.4fr_auto] gap-3 items-center px-4 py-3">
        {/* Patient */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/40 to-cyan-500/40 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {appt.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{appt.name}</p>
          </div>
        </div>
        {/* Appointment */}
        <div>
          <p className="text-slate-300 text-xs font-medium">{appt.time}</p>
          <p className="text-slate-500 text-[11px]">{appt.type}</p>
        </div>
        {/* Risk Score */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {appt.level === "Critical" && (
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            )}
            <span className={`text-xs font-semibold ${cfg.color}`}>{appt.level}</span>
          </div>
          <RiskBar pct={appt.risk} level={appt.level} delay={0.2 + index * 0.1} />
        </div>
        {/* Risk Factors */}
        <div className="flex flex-wrap gap-1">
          {appt.factors.map((f) => {
            const fc = FACTOR_CONFIG[f];
            return (
              <span
                key={f}
                className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${fc.color} ${fc.bg}`}
              >
                {fc.label}
              </span>
            );
          })}
        </div>
        {/* Action */}
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
          <ActionButtons
            level={appt.level}
            id={appt.id}
            addToast={addToast}
            reminded={reminded}
            setReminded={setReminded}
          />
          <div className="text-slate-500 ml-1">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 grid grid-cols-[1fr_auto] gap-4">
              {/* Reasoning */}
              <div className="space-y-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Why we flagged this</p>
                <ul className="space-y-1.5">
                  {appt.reasoning.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-violet-400 mt-0.5 flex-shrink-0">▸</span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 p-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Suggested Action</p>
                  <p className="text-xs text-slate-300">{appt.suggestion}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToast(`WhatsApp reminder sent to ${appt.name}`, "success");
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-violet-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={13} /> Send WhatsApp Now
                </motion.button>
              </div>
              {/* History chart */}
              <div className="w-32 flex-shrink-0">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Last 6 visits</p>
                <MiniHistory history={appt.history} />
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                    <span className="text-[10px] text-slate-500">Attended</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-rose-500" />
                    <span className="text-[10px] text-slate-500">No-show</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoShowView({ addToast }: NoShowViewProps) {
  const [reminded, setReminded] = useState<Set<number>>(new Set());
  const [modelOpen, setModelOpen] = useState(false);

  const statCards = [
    {
      label: "Today's Risk Score",
      value: 68,
      suffix: "%",
      icon: <Activity size={18} />,
      accent: "text-rose-400",
      trend: "+5% vs last month",
    },
    {
      label: "High Risk Patients",
      value: 4,
      icon: <AlertTriangle size={18} />,
      accent: "text-amber-400",
      trend: "+1 vs last month",
    },
    {
      label: "No-Shows Prevented",
      value: 23,
      icon: <ShieldCheck size={18} />,
      accent: "text-emerald-400",
      trend: "+8 vs last month",
    },
    {
      label: "Revenue Protected",
      value: 18400,
      prefix: "₹",
      icon: <DollarSign size={18} />,
      accent: "text-violet-400",
      trend: "+₹6,400 vs last month",
    },
  ];

  const insightCards = [
    {
      icon: <TrendingDown size={15} />,
      title: "Monday 11AM Slot",
      desc: "3/5 recent Monday morning appointments were no-shows. Consider requiring deposit or confirmation call.",
      border: "border-rose-500",
      iconColor: "text-rose-400",
      delay: 0,
    },
    {
      icon: <AlertCircle size={15} />,
      title: "Same-Day Bookings",
      desc: "Last-minute bookings (< 6hrs) have 68% no-show rate in your clinic.",
      border: "border-amber-500",
      iconColor: "text-amber-400",
      delay: 0.1,
    },
    {
      icon: <Zap size={15} />,
      title: "Reminder Sweet Spot",
      desc: "Sending reminders at 24h + 2h before reduced no-shows by 31% for your patient base.",
      border: "border-cyan-500",
      iconColor: "text-cyan-400",
      delay: 0.2,
    },
  ];

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* ── ROW 1: Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            prefix={card.prefix}
            suffix={card.suffix}
            icon={card.icon}
            accent={card.accent}
            trend={card.trend}
            delay={i * 0.08}
          />
        ))}
      </div>

      {/* ── ROW 2: Main content ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* ── LEFT: Appointment Risk Board ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" as const }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col flex-1 overflow-hidden"
          >
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-white font-semibold text-sm">Today's Appointment Risk Board</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Today · Apr 24, 2026 · 7 appointments · 4 need attention
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs text-slate-400">Live</span>
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[1.4fr_1fr_0.9fr_1.4fr_auto] gap-3 px-4 py-2 border-b border-white/[0.04] flex-shrink-0">
              {["Patient", "Appointment", "Risk Score", "Risk Factors", "Action"].map((h) => (
                <p key={h} className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {APPOINTMENTS.map((appt, i) => (
                <AppointmentRow
                  key={appt.id}
                  appt={appt}
                  index={i}
                  addToast={addToast}
                  reminded={reminded}
                  setReminded={setReminded}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Model Explainer ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" as const }}
            className="mt-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              onClick={() => setModelOpen((v) => !v)}
            >
              <span className="text-slate-300 text-sm font-medium">
                How Reva calculates risk →
              </span>
              {modelOpen ? (
                <ChevronUp size={15} className="text-slate-500" />
              ) : (
                <ChevronDown size={15} className="text-slate-500" />
              )}
            </button>
            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" as const }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-white font-semibold text-sm">Risk Score Calculation</p>
                    <div className="space-y-2">
                      {MODEL_FACTORS.map((f) => (
                        <div key={f.name} className="flex items-start gap-3">
                          <span className={`text-xs font-bold font-mono min-w-[60px] pt-0.5 ${f.color}`}>
                            {f.weight}
                          </span>
                          <div>
                            <p className="text-slate-300 text-xs font-medium">{f.name}</p>
                            <p className="text-slate-500 text-[11px]">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-500 text-[11px] border-t border-white/[0.06] pt-3">
                      Model trained on anonymised clinic data. Improves over time.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-[380px] flex-shrink-0 flex flex-col gap-4">
          {/* Section 1: Donut */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" as const }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4"
          >
            <p className="text-white text-sm font-semibold mb-3">Risk Distribution</p>
            <DonutChart />
          </motion.div>

          {/* Section 2: Heatmap */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42, duration: 0.45, ease: "easeOut" as const }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4"
          >
            <p className="text-white text-sm font-semibold mb-3">Risk Factors Heatmap</p>
            <div className="space-y-2.5">
              {HEATMAP_FACTORS.map((f, i) => (
                <div key={f.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs">{f.label}</span>
                    <span className="text-slate-500 text-[11px] font-medium">{f.count} patients</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${f.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${f.pct}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: "easeOut" as const }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 3: AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.48, duration: 0.45, ease: "easeOut" as const }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex-1"
          >
            <p className="text-white text-sm font-semibold mb-3">AI Insights</p>
            <div className="space-y-2.5">
              {insightCards.map((card) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + card.delay, duration: 0.4, ease: "easeOut" as const }}
                  className={`border-l-4 ${card.border} bg-white/[0.02] rounded-r-xl px-3 py-2.5`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={card.iconColor}>{card.icon}</span>
                    <p className="text-white text-xs font-semibold">{card.title}</p>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
