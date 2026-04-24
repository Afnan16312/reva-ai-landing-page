"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  LayoutGroup,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Plus,
  Trash2,
  Save,
  Calendar,
  Clock,
  Repeat,
  Coffee,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────── Types ── */
interface AvailabilityViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type SlotStatus = "available" | "blocked" | "booked" | "lunch";

interface TimeSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  status: SlotStatus;
  patient?: string;
}

interface DayData {
  date: number;
  month: number; // 0-indexed
  year: number;
  isCurrentMonth: boolean;
  appointments: number;
  isBlocked: boolean; // full day leave
  isClosed: boolean;
  isHoliday: boolean;
  holidayLabel?: string;
  isPartialBlock: boolean;
}

interface RecurringBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  label: string;
  color: "amber" | "violet" | "rose" | "cyan" | "emerald";
}

interface LeaveDay {
  id: string;
  date: string;
  reason: string;
}

interface WorkingDayConfig {
  enabled: boolean;
  open: string;
  close: string;
  lunchEnabled: boolean;
  lunchFrom: string;
  lunchTo: string;
}

/* ─────────────────────────────────────────── Constants ── */
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TIMES_30MIN: string[] = [];
for (let h = 8; h <= 21; h++) {
  TIMES_30MIN.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 21) TIMES_30MIN.push(`${String(h).padStart(2, "0")}:30`);
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

const DEFAULT_WORKING_HOURS: Record<string, WorkingDayConfig> = {
  Mon: { enabled: true, open: "09:00", close: "18:00", lunchEnabled: true, lunchFrom: "13:00", lunchTo: "14:00" },
  Tue: { enabled: true, open: "09:00", close: "18:00", lunchEnabled: true, lunchFrom: "13:00", lunchTo: "14:00" },
  Wed: { enabled: true, open: "09:00", close: "18:00", lunchEnabled: true, lunchFrom: "13:00", lunchTo: "14:00" },
  Thu: { enabled: true, open: "09:00", close: "18:00", lunchEnabled: true, lunchFrom: "13:00", lunchTo: "14:00" },
  Fri: { enabled: true, open: "09:00", close: "18:00", lunchEnabled: true, lunchFrom: "13:00", lunchTo: "14:00" },
  Sat: { enabled: true, open: "09:00", close: "14:00", lunchEnabled: false, lunchFrom: "13:00", lunchTo: "14:00" },
  Sun: { enabled: false, open: "09:00", close: "18:00", lunchEnabled: false, lunchFrom: "13:00", lunchTo: "14:00" },
};

// April 2026 hardcoded data
const APRIL_2026_DATA: Record<number, Partial<DayData>> = {
  1:  { appointments: 3, isBlocked: false, isClosed: false, isHoliday: false, isPartialBlock: false },
  5:  { appointments: 0, isBlocked: false, isClosed: true,  isHoliday: false, isPartialBlock: false },
  7:  { appointments: 5, isBlocked: false, isClosed: false, isHoliday: false, isPartialBlock: false },
  10: { appointments: 2, isBlocked: false, isClosed: false, isHoliday: false, isPartialBlock: true },
  12: { appointments: 0, isBlocked: false, isClosed: true,  isHoliday: false, isPartialBlock: false },
  14: { appointments: 0, isBlocked: true,  isClosed: false, isHoliday: false, isPartialBlock: false },
  19: { appointments: 0, isBlocked: false, isClosed: true,  isHoliday: false, isPartialBlock: false },
  21: { appointments: 0, isBlocked: false, isClosed: false, isHoliday: true,  holidayLabel: "Easter", isPartialBlock: false },
  22: { appointments: 7, isBlocked: false, isClosed: false, isHoliday: false, isPartialBlock: false },
  24: { appointments: 4, isBlocked: false, isClosed: false, isHoliday: false, isPartialBlock: false },
  26: { appointments: 0, isBlocked: false, isClosed: true,  isHoliday: false, isPartialBlock: false },
  28: { appointments: 2, isBlocked: false, isClosed: false, isHoliday: false, isPartialBlock: false },
};

function buildMonthGrid(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayData[] = [];

  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
      appointments: 0,
      isBlocked: false,
      isClosed: false,
      isHoliday: false,
      isPartialBlock: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const extra = APRIL_2026_DATA[d] ?? {};
    cells.push({
      date: d,
      month,
      year,
      isCurrentMonth: true,
      appointments: extra.appointments ?? 0,
      isBlocked: extra.isBlocked ?? false,
      isClosed: extra.isClosed ?? false,
      isHoliday: extra.isHoliday ?? false,
      holidayLabel: extra.holidayLabel,
      isPartialBlock: extra.isPartialBlock ?? false,
    });
  }

  // Next month padding (fill to 42)
  let nextD = 1;
  while (cells.length < 42) {
    cells.push({
      date: nextD++,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
      appointments: 0,
      isBlocked: false,
      isClosed: false,
      isHoliday: false,
      isPartialBlock: false,
    });
  }

  return cells;
}

function buildDaySlots(day: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const bookedSlots24: Record<string, string> =
    day === 24
      ? { "09:00": "Sarah K.", "10:30": "James R.", "14:00": "Priya M.", "15:30": "Omar T." }
      : day === 7
      ? { "09:00": "Alice B.", "10:00": "Carlos D.", "11:30": "Nina P.", "14:30": "Ravi S.", "16:00": "Emma L." }
      : day === 22
      ? { "09:00": "Tom H.", "09:30": "Lin C.", "10:00": "David K.", "11:00": "Fatima A.", "13:00": "Ben O.", "14:30": "Yuki M.", "15:30": "Ana R." }
      : {};

  for (let h = 9; h <= 17; h++) {
    for (const m of [0, 30]) {
      if (h === 17 && m === 30) break;
      const key = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const label = formatTime(key);
      let status: SlotStatus = "available";
      let patient: string | undefined;
      if (h === 13 || (h === 13 && m === 30)) {
        status = "lunch";
      } else if (bookedSlots24[key]) {
        status = "booked";
        patient = bookedSlots24[key];
      }
      slots.push({ time: key, label, status, patient });
    }
  }
  return slots;
}

/* ──────────────────────────────────── Count-up hook ── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─────────────────────────────────────────── Stat Card ── */
const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

interface StatCardProps {
  label: string;
  target: number;
  color: string;
  icon: React.ReactNode;
  index: number;
}

function StatCard({ label, target, color, icon, index }: StatCardProps) {
  const value = useCountUp(target);
  return (
    <motion.div
      custom={index}
      variants={statCardVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 flex flex-col gap-3"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
        <div className="text-xs text-white/50 mt-0.5 leading-tight">{label}</div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${color.replace("bg-", "bg-")}`} />
    </motion.div>
  );
}

/* ─────────────────────────────────── Toggle Switch ── */
interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
}

function Toggle({ enabled, onChange, size = "md" }: ToggleProps) {
  const w = size === "sm" ? "w-8 h-4" : "w-11 h-6";
  const knob = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const translate = size === "sm" ? (enabled ? "translate-x-4" : "translate-x-0.5") : (enabled ? "translate-x-5" : "translate-x-1");
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none ${w} ${
        enabled ? "bg-emerald-500" : "bg-white/10"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block rounded-full bg-white shadow ${knob} ${translate}`}
      />
    </button>
  );
}

/* ───────────────────────────────────── Select dropdown ── */
interface SelectProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  className?: string;
}

function Select({ value, options, onChange, className = "" }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 pr-7 focus:outline-none focus:border-cyan-400/50 cursor-pointer w-full"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0d1117]">
            {formatTime(o)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
    </div>
  );
}

/* ════════════════════════════════════ MAIN COMPONENT ═══ */
export default function AvailabilityView({ addToast }: AvailabilityViewProps) {
  const TODAY = { year: 2026, month: 3, date: 24 }; // Apr 24 2026 (month 0-indexed)

  const [viewMonth, setViewMonth] = useState(3); // April
  const [viewYear, setViewYear] = useState(2026);
  const [calView, setCalView] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [leaveDays, setLeaveDays] = useState<Record<string, boolean>>({ "2026-04-14": true });
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
  const [slotDuration, setSlotDuration] = useState(15);
  const [recurringBlocks, setRecurringBlocks] = useState<RecurringBlock[]>([
    { id: "r1", day: "Monday", startTime: "13:00", endTime: "14:00", label: "Lunch", color: "amber" },
    { id: "r2", day: "Wednesday", startTime: "15:00", endTime: "16:00", label: "Admin", color: "violet" },
  ]);
  const [leaveList, setLeaveList] = useState<LeaveDay[]>([
    { id: "l1", date: "Apr 14", reason: "Personal Leave" },
    { id: "l2", date: "May 1", reason: "Labour Day" },
  ]);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [newRecurring, setNewRecurring] = useState<{ day: string; startTime: string; endTime: string; label: string; color: "amber" | "violet" | "rose" | "cyan" | "emerald" }>({ day: "Monday", startTime: "09:00", endTime: "10:00", label: "", color: "amber" });
  const [newLeave, setNewLeave] = useState({ date: "", reason: "" });

  const grid = buildMonthGrid(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewMonth(TODAY.month); setViewYear(TODAY.year); };

  const selectDay = (day: DayData) => {
    if (!day.isCurrentMonth) return;
    setSelectedDay(day);
    setDaySlots(buildDaySlots(day.date));
  };

  const toggleSlot = (idx: number) => {
    setDaySlots(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      if (s.status === "booked") return s;
      return { ...s, status: s.status === "available" ? "blocked" : s.status === "blocked" ? "available" : s.status };
    }));
  };

  const blockAllAM = () => setDaySlots(prev => prev.map(s =>
    s.status !== "booked" && s.status !== "lunch" && parseInt(s.time.split(":")[0]) < 12
      ? { ...s, status: "blocked" } : s));
  const blockAllPM = () => setDaySlots(prev => prev.map(s =>
    s.status !== "booked" && s.status !== "lunch" && parseInt(s.time.split(":")[0]) >= 12
      ? { ...s, status: "blocked" } : s));
  const clearDay = () => setDaySlots(prev => prev.map(s =>
    s.status !== "booked" ? { ...s, status: s.status === "lunch" ? "lunch" : "available" } : s));

  const toggleLeaveDay = (dayStr: string) => {
    setLeaveDays(prev => ({ ...prev, [dayStr]: !prev[dayStr] }));
  };

  const dayKey = selectedDay
    ? `${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`
    : "";
  const isLeaveDay = leaveDays[dayKey] ?? false;

  /* ── Week view helpers ── */
  const getWeekStart = (year: number, month: number, date: number) => {
    const d = new Date(year, month, date);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  const weekStart = getWeekStart(viewYear, viewMonth, TODAY.date);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekSlotData: Record<string, TimeSlot[]> = {};
  weekDays.forEach(d => {
    weekSlotData[d.getDate()] = buildDaySlots(d.getDate());
  });

  /* ── Color helpers ── */
  const recurringColorMap = {
    amber: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    violet: "bg-violet-500/20 border-violet-500/40 text-violet-300",
    rose: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    cyan: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    emerald: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  };

  /* ── Variants ── */
  const cellVariants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.015, duration: 0.3, ease: "easeOut" as const },
    }),
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeOut" as const } },
  };

  const weekColVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
    }),
  };

  const workingRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
    }),
  };

  const leaveItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2, ease: "easeOut" as const } },
  };

  /* ────────────────────────── Render ── */
  return (
    <div className="min-h-screen bg-[#050714] text-white p-6 space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Available Slots Today"
          target={18}
          color="bg-emerald-500/20"
          icon={<Check className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          index={1}
          label="Blocked Slots"
          target={6}
          color="bg-rose-500/20"
          icon={<Lock className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          index={2}
          label="Booked Slots"
          target={8}
          color="bg-cyan-500/20"
          icon={<Calendar className="w-5 h-5 text-cyan-400" />}
        />
        <StatCard
          index={3}
          label="Leave Days This Month"
          target={2}
          color="bg-amber-500/20"
          icon={<AlertCircle className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* ── Main Two-Col Layout ── */}
      <div className="flex gap-5 items-start">
        {/* ══════════════ LEFT — Calendar ══════════════ */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Calendar Card */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            {/* Month Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {MONTHS[viewMonth]} <span className="text-white/40">{viewYear}</span>
                </h2>
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevMonth}
                    className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white/60" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextMonth}
                    className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white/60" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToday}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    Today
                  </motion.button>
                </div>
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-white/[0.05] rounded-xl p-1 border border-white/[0.08]">
                {(["month", "week"] as const).map((v) => (
                  <motion.button
                    key={v}
                    onClick={() => setCalView(v)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      calView === v ? "text-white" : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {calView === v && (
                      <motion.div
                        layoutId="viewToggle"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/30 to-cyan-400/10 border border-cyan-400/30"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative capitalize">{v}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Month View ── */}
            {calView === "month" && (
              <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-white/30 py-2">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {grid.map((day, idx) => {
                    const isToday = day.date === TODAY.date && day.month === TODAY.month && day.year === TODAY.year && day.isCurrentMonth;
                    const isSelected = selectedDay?.date === day.date && selectedDay?.month === day.month;
                    const cellDayKey = `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
                    const isLeaveDayCal = leaveDays[cellDayKey];

                    return (
                      <motion.div
                        key={`${day.year}-${day.month}-${day.date}-${idx}`}
                        custom={idx}
                        variants={cellVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={day.isCurrentMonth ? { scale: 1.02 } : {}}
                        whileTap={day.isCurrentMonth ? { scale: 0.98 } : {}}
                        onClick={() => selectDay(day)}
                        className={`relative rounded-xl p-2 min-h-[72px] cursor-pointer transition-colors ${
                          !day.isCurrentMonth
                            ? "opacity-25 cursor-default"
                            : isSelected
                            ? "bg-cyan-500/15 border border-cyan-400/40"
                            : isLeaveDayCal
                            ? "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15"
                            : day.isClosed
                            ? "bg-white/[0.015] border border-white/[0.04]"
                            : day.isHoliday
                            ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15"
                            : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                        } ${isToday ? "ring-2 ring-cyan-400/60" : ""}`}
                      >
                        {/* Day number */}
                        <div
                          className={`text-sm font-${isToday ? "bold" : "medium"} ${
                            isToday
                              ? "text-cyan-400"
                              : day.isCurrentMonth
                              ? "text-white/80"
                              : "text-white/20"
                          }`}
                        >
                          {day.date}
                        </div>

                        {/* Status indicators */}
                        {day.isCurrentMonth && (
                          <div className="mt-1 space-y-0.5">
                            {day.isClosed && (
                              <div className="text-[9px] font-semibold text-rose-400/80 uppercase tracking-wide">Closed</div>
                            )}
                            {isLeaveDayCal && (
                              <div className="text-[9px] font-semibold text-rose-300/80 uppercase tracking-wide">Leave</div>
                            )}
                            {day.isHoliday && (
                              <div className="text-[9px] font-semibold text-amber-300/80 truncate">{day.holidayLabel}</div>
                            )}
                            {day.isPartialBlock && !day.isClosed && !isLeaveDayCal && (
                              <div className="text-[9px] font-semibold text-amber-300/70">Half Day</div>
                            )}
                          </div>
                        )}

                        {/* Dot indicators */}
                        {day.isCurrentMonth && !day.isClosed && (
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {day.appointments > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title={`${day.appointments} appts`} />
                            )}
                            {isLeaveDayCal && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            )}
                            {day.isPartialBlock && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            )}
                            {!isLeaveDayCal && !day.isPartialBlock && !day.isHoliday && day.appointments === 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </div>
                        )}

                        {/* Appt count badge */}
                        {day.isCurrentMonth && day.appointments > 0 && (
                          <div className="absolute top-2 right-2 text-[9px] font-bold text-cyan-300/70">
                            {day.appointments}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Week View ── */}
            {calView === "week" && (
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((d, colIdx) => {
                    const slots = weekSlotData[d.getDate()] ?? [];
                    const isToday = d.getDate() === TODAY.date && d.getMonth() === TODAY.month && d.getFullYear() === TODAY.year;
                    return (
                      <motion.div
                        key={d.toISOString()}
                        custom={colIdx}
                        variants={weekColVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col"
                      >
                        <div className={`text-center text-xs mb-2 py-1.5 rounded-lg ${isToday ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-white/40"}`}>
                          <div className="font-medium">{DAYS_OF_WEEK[d.getDay()]}</div>
                          <div className={`text-base font-bold ${isToday ? "text-cyan-300" : "text-white/70"}`}>{d.getDate()}</div>
                        </div>
                        <div className="space-y-0.5">
                          {slots.map((slot, si) => (
                            <motion.div
                              key={slot.time}
                              whileHover={{ scale: 1.01 }}
                              className={`rounded px-1.5 py-1 text-[9px] font-medium truncate border cursor-pointer transition-colors ${
                                slot.status === "booked"
                                  ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                                  : slot.status === "blocked"
                                  ? "bg-rose-500/15 border-rose-400/20 text-rose-300"
                                  : slot.status === "lunch"
                                  ? "bg-amber-500/10 border-amber-400/20 text-amber-300"
                                  : "bg-transparent border-white/[0.06] border-dashed text-white/20 hover:bg-white/[0.04]"
                              }`}
                            >
                              {slot.status === "booked" ? slot.patient : slot.status === "lunch" ? "Lunch" : slot.status === "blocked" ? "Blocked" : slot.label}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Day Detail Panel ── */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                key={`detail-${selectedDay.date}`}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {new Date(selectedDay.year, selectedDay.month, selectedDay.date).toLocaleDateString("en-US", {
                        weekday: "long", month: "short", day: "numeric",
                      })}
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">
                      {daySlots.filter(s => s.status === "booked").length} booked · {daySlots.filter(s => s.status === "available").length} available
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Leave day toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Leave Day</span>
                      <Toggle
                        enabled={isLeaveDay}
                        onChange={() => toggleLeaveDay(dayKey)}
                        size="sm"
                      />
                    </div>
                    {/* Bulk actions */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: "Block AM", fn: blockAllAM },
                        { label: "Block PM", fn: blockAllPM },
                        { label: "Clear", fn: clearDay },
                      ].map(({ label, fn }) => (
                        <motion.button
                          key={label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={fn}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
                        >
                          {label}
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDay(null)}
                      className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-white/50" />
                    </motion.button>
                  </div>
                </div>

                {/* Slot Grid */}
                <div className="p-6">
                  <LayoutGroup>
                    <div className="grid grid-cols-2 gap-2">
                      {daySlots.map((slot, idx) => (
                        <motion.button
                          layout
                          key={slot.time}
                          onClick={() => toggleSlot(idx)}
                          disabled={slot.status === "booked"}
                          whileHover={slot.status !== "booked" ? { scale: 1.02 } : {}}
                          whileTap={slot.status !== "booked" ? { scale: 0.98 } : {}}
                          className={`relative flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                            slot.status === "available"
                              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
                              : slot.status === "blocked"
                              ? "bg-rose-500/10 border-rose-500/25 text-rose-300 hover:bg-rose-500/20"
                              : slot.status === "booked"
                              ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300 cursor-not-allowed"
                              : "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20"
                          }`}
                        >
                          <span className="font-medium text-xs">{slot.label}</span>
                          <div className="flex items-center gap-1.5">
                            {slot.status === "booked" && slot.patient && (
                              <span className="text-[10px] text-cyan-200/60 max-w-[70px] truncate">{slot.patient}</span>
                            )}
                            {slot.status === "booked" && <Lock className="w-3 h-3 opacity-50" />}
                            {slot.status === "lunch" && <Coffee className="w-3 h-3 opacity-70" />}
                            {slot.status === "blocked" && (
                              <span className="text-[10px] opacity-60">Blocked</span>
                            )}
                            {slot.status === "available" && (
                              <span className="text-[10px] opacity-60">Free</span>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </LayoutGroup>

                  {/* Save button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToast("Availability saved ✓", "success")}
                    className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050714] font-bold text-sm hover:from-cyan-400 hover:to-cyan-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Availability
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ══════════════ RIGHT — Settings ══════════════ */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* ── Working Hours ── */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Working Hours</h3>
            </div>
            <div className="p-4 space-y-1">
              {Object.entries(workingHours).map(([day, cfg], i) => (
                <motion.div
                  key={day}
                  custom={i}
                  variants={workingRowVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2 py-1.5">
                    <Toggle
                      enabled={cfg.enabled}
                      onChange={(v) => setWorkingHours(prev => ({
                        ...prev, [day]: { ...prev[day], enabled: v }
                      }))}
                      size="sm"
                    />
                    <span className={`text-xs font-medium w-8 ${cfg.enabled ? "text-white/80" : "text-white/30"}`}>{day}</span>
                    {cfg.enabled ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Select
                          value={cfg.open}
                          options={TIMES_30MIN.slice(0, TIMES_30MIN.length - 4)}
                          onChange={(v) => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], open: v } }))}
                          className="flex-1"
                        />
                        <span className="text-white/30 text-xs">–</span>
                        <Select
                          value={cfg.close}
                          options={TIMES_30MIN.slice(4)}
                          onChange={(v) => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], close: v } }))}
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-white/20 flex-1">Closed</span>
                    )}
                  </div>
                  {cfg.enabled && (
                    <div className="flex items-center gap-2 pl-10 pb-1">
                      <Toggle
                        enabled={cfg.lunchEnabled}
                        onChange={(v) => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], lunchEnabled: v } }))}
                        size="sm"
                      />
                      <span className="text-[10px] text-white/30">Lunch</span>
                      {cfg.lunchEnabled && (
                        <div className="flex items-center gap-1">
                          <Select
                            value={cfg.lunchFrom}
                            options={TIMES_30MIN.slice(4, 24)}
                            onChange={(v) => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], lunchFrom: v } }))}
                            className="w-20"
                          />
                          <span className="text-[10px] text-white/20">–</span>
                          <Select
                            value={cfg.lunchTo}
                            options={TIMES_30MIN.slice(6, 26)}
                            onChange={(v) => setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], lunchTo: v } }))}
                            className="w-20"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => addToast("Working hours saved ✓", "success")}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                Save Working Hours
              </motion.button>
            </div>
          </div>

          {/* ── Recurring Blocks ── */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Repeat className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Recurring Blocks</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddRecurring(v => !v)}
                className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400 hover:bg-violet-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>
            <div className="p-4 space-y-2">
              <AnimatePresence>
                {recurringBlocks.map((rb) => (
                  <motion.div
                    key={rb.id}
                    layout
                    variants={leaveItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${recurringColorMap[rb.color]}`}
                  >
                    <div>
                      <div className="font-semibold">{rb.label}</div>
                      <div className="opacity-60 text-[10px]">Every {rb.day} · {formatTime(rb.startTime)}–{formatTime(rb.endTime)}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRecurringBlocks(prev => prev.filter(r => r.id !== rb.id))}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {showAddRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" as const }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-2 mt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">Day</label>
                          <select
                            value={newRecurring.day}
                            onChange={e => setNewRecurring(p => ({ ...p, day: e.target.value }))}
                            className="w-full appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none"
                          >
                            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                              <option key={d} className="bg-[#0d1117]">{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">Label</label>
                          <input
                            value={newRecurring.label}
                            onChange={e => setNewRecurring(p => ({ ...p, label: e.target.value }))}
                            placeholder="e.g. Meeting"
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-violet-400/50 placeholder:text-white/20"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">Start</label>
                          <Select value={newRecurring.startTime} options={TIMES_30MIN} onChange={v => setNewRecurring(p => ({ ...p, startTime: v }))} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 block mb-1">End</label>
                          <Select value={newRecurring.endTime} options={TIMES_30MIN} onChange={v => setNewRecurring(p => ({ ...p, endTime: v }))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Color</label>
                        <div className="flex gap-1.5">
                          {(["amber","violet","rose","cyan","emerald"] as const).map(c => (
                            <button
                              key={c}
                              onClick={() => setNewRecurring(p => ({ ...p, color: c }))}
                              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                newRecurring.color === c ? "scale-110 border-white" : "border-transparent"
                              } ${
                                c === "amber" ? "bg-amber-500" : c === "violet" ? "bg-violet-500" :
                                c === "rose" ? "bg-rose-500" : c === "cyan" ? "bg-cyan-500" : "bg-emerald-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            if (!newRecurring.label.trim()) return;
                            setRecurringBlocks(prev => [
                              ...prev,
                              { ...newRecurring, id: `r${Date.now()}` },
                            ]);
                            setShowAddRecurring(false);
                            setNewRecurring({ day: "Monday", startTime: "09:00", endTime: "10:00", label: "", color: "amber" });
                            addToast("Recurring block added", "success");
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold hover:bg-violet-500/30 transition-colors"
                        >
                          Add
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setShowAddRecurring(false)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs hover:bg-white/[0.08] transition-colors"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Upcoming Leave ── */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Upcoming Leave</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddLeave(v => !v)}
                className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 hover:bg-rose-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>
            <div className="p-4 space-y-2">
              <AnimatePresence>
                {leaveList.map((lv) => (
                  <motion.div
                    key={lv.id}
                    layout
                    variants={leaveItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20"
                  >
                    <div>
                      <div className="text-xs font-semibold text-rose-300">{lv.date}</div>
                      <div className="text-[10px] text-white/40">{lv.reason}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setLeaveList(prev => prev.filter(l => l.id !== lv.id))}
                      className="text-rose-400/50 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {showAddLeave && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" as const }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-2 mt-1">
                      <input
                        value={newLeave.date}
                        onChange={e => setNewLeave(p => ({ ...p, date: e.target.value }))}
                        placeholder="e.g. May 10"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-rose-400/50 placeholder:text-white/20"
                      />
                      <input
                        value={newLeave.reason}
                        onChange={e => setNewLeave(p => ({ ...p, reason: e.target.value }))}
                        placeholder="Reason"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-rose-400/50 placeholder:text-white/20"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            if (!newLeave.date.trim() || !newLeave.reason.trim()) return;
                            setLeaveList(prev => [...prev, { ...newLeave, id: `l${Date.now()}` }]);
                            setShowAddLeave(false);
                            setNewLeave({ date: "", reason: "" });
                            addToast("Leave day added", "success");
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                        >
                          Add
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setShowAddLeave(false)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/40 text-xs hover:bg-white/[0.08] transition-colors"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Slot Duration ── */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Slot Duration</h3>
            </div>
            <div className="p-4">
              <p className="text-[10px] text-white/30 mb-3">Select default appointment slot length</p>
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 30, 45, 60].map((d) => (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSlotDuration(d);
                      addToast(`Slot duration set to ${d} min`, "info");
                    }}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      slotDuration === d
                        ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                        : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                    }`}
                  >
                    {slotDuration === d && (
                      <motion.div
                        layoutId="slotDurationActive"
                        className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-400/30"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative">{d}m</span>
                  </motion.button>
                ))}
              </div>
              <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/30">
                  Each day will have{" "}
                  <span className="text-emerald-400 font-semibold">
                    {Math.floor((9 * 60) / slotDuration)} slots
                  </span>{" "}
                  (9 AM – 6 PM)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
