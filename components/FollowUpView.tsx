"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  LayoutGroup,
} from "framer-motion";
import {
  Clock,
  AlertCircle,
  Star,
  Calendar,
  Users,
  Plus,
  ChevronDown,
  X,
  Send,
  RotateCcw,
  Zap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FollowUpViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type RuleColor = "cyan" | "violet" | "amber" | "emerald" | "rose";

interface Rule {
  id: string;
  name: string;
  description: string;
  color: RuleColor;
  delay: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface Template {
  ruleId: string;
  body: string;
  minRating?: boolean;
}

interface QueueItem {
  id: string;
  patient: string;
  rule: string;
  ruleColor: RuleColor;
  dueTime: string;
  status: "Confirmed" | "Pending" | "Skipped";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<RuleColor, { border: string; text: string; bg: string; dot: string }> = {
  cyan:    { border: "border-cyan-400",    text: "text-cyan-400",    bg: "bg-cyan-400/10",    dot: "bg-cyan-400" },
  violet:  { border: "border-violet-400",  text: "text-violet-400",  bg: "bg-violet-400/10",  dot: "bg-violet-400" },
  amber:   { border: "border-amber-400",   text: "text-amber-400",   bg: "bg-amber-400/10",   dot: "bg-amber-400" },
  emerald: { border: "border-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  rose:    { border: "border-rose-400",    text: "text-rose-400",    bg: "bg-rose-400/10",    dot: "bg-rose-400" },
};

const GRADIENT_MAP: Record<RuleColor, string> = {
  cyan:    "from-cyan-500 to-blue-500",
  violet:  "from-violet-500 to-purple-500",
  amber:   "from-amber-500 to-orange-500",
  emerald: "from-emerald-500 to-teal-500",
  rose:    "from-rose-500 to-pink-500",
};

const AVATAR_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

const DELAY_OPTIONS = ["1 hr", "2 hrs", "6 hrs", "12 hrs", "24 hrs", "3 days", "7 days"];

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    name: "Post-Visit Thank You",
    description: "Sends a warm thank-you + clinic rating link",
    color: "cyan",
    delay: "2 hrs",
    enabled: true,
    icon: <Clock size={16} />,
  },
  {
    id: "r2",
    name: "Prescription Reminder",
    description: "Reminds patient to take medication on time",
    color: "violet",
    delay: "12 hrs",
    enabled: true,
    icon: <AlertCircle size={16} />,
  },
  {
    id: "r3",
    name: "Review Request",
    description: "Asks for Google/WhatsApp review after positive rating",
    color: "amber",
    delay: "3 days",
    enabled: true,
    icon: <Star size={16} />,
  },
  {
    id: "r4",
    name: "Follow-up Booking Nudge",
    description: "Suggests booking next appointment",
    color: "emerald",
    delay: "7 days",
    enabled: false,
    icon: <Calendar size={16} />,
  },
  {
    id: "r5",
    name: "No-Show Re-engagement",
    description: "Reaches out to missed patients to rebook",
    color: "rose",
    delay: "1 day",
    enabled: true,
    icon: <Users size={16} />,
  },
];

const DEFAULT_TEMPLATES: Template[] = [
  {
    ruleId: "r1",
    body: "Hi {name}! 👋 Thank you for visiting us today with Dr. {doctor}. We hope you're feeling better. We'd love your feedback — it takes just 30 seconds! {rating_link}",
  },
  {
    ruleId: "r2",
    body: "Hello {name}! 💊 A quick reminder from {clinic} — please don't forget to take your prescribed medication today. Stay healthy! See you soon, Dr. {doctor}.",
  },
  {
    ruleId: "r3",
    body: "Hey {name}! We hope your visit on {date} went well. Would you mind leaving us a quick review? It helps other patients find Dr. {doctor}. {rating_link} 🙏",
    minRating: true,
  },
  {
    ruleId: "r4",
    body: "Hi {name}! It's been a week since your visit at {clinic}. Time to schedule your next follow-up with Dr. {doctor}! Reply 'BOOK' to get started. 📅",
  },
  {
    ruleId: "r5",
    body: "Hi {name}, we noticed you couldn't make your appointment on {date} with Dr. {doctor} at {clinic}. No worries — let's find you another slot. Reply 'RESCHEDULE' to book! 🗓",
  },
];

const INITIAL_QUEUE: QueueItem[] = [
  { id: "q1",  patient: "Priya Sharma",  rule: "Post-Visit Thank You",     ruleColor: "cyan",    dueTime: "Due 12:30 PM",      status: "Confirmed" },
  { id: "q2",  patient: "Rahul Gupta",   rule: "Prescription Reminder",    ruleColor: "violet",  dueTime: "Due 2:00 PM",       status: "Confirmed" },
  { id: "q3",  patient: "Ananya Nair",   rule: "Review Request",           ruleColor: "amber",   dueTime: "Due 3:15 PM",       status: "Pending"   },
  { id: "q4",  patient: "Vikram Patel",  rule: "Follow-up Booking Nudge",  ruleColor: "emerald", dueTime: "Due 4:00 PM",       status: "Skipped"   },
  { id: "q5",  patient: "Sunita Rao",    rule: "Post-Visit Thank You",     ruleColor: "cyan",    dueTime: "Due 4:30 PM",       status: "Confirmed" },
  { id: "q6",  patient: "Karan Mehta",   rule: "No-Show Re-engagement",    ruleColor: "rose",    dueTime: "Due 5:00 PM",       status: "Pending"   },
  { id: "q7",  patient: "Deepa Singh",   rule: "Prescription Reminder",    ruleColor: "violet",  dueTime: "Due 5:30 PM",       status: "Confirmed" },
  { id: "q8",  patient: "Meera Joshi",   rule: "Review Request",           ruleColor: "amber",   dueTime: "Due 6:00 PM",       status: "Pending"   },
  { id: "q9",  patient: "Arjun Kumar",   rule: "Post-Visit Thank You",     ruleColor: "cyan",    dueTime: "Due 6:15 PM",       status: "Confirmed" },
  { id: "q10", patient: "Priya Sharma",  rule: "Follow-up Booking Nudge",  ruleColor: "emerald", dueTime: "Due Tomorrow 9 AM", status: "Pending"   },
  { id: "q11", patient: "Rahul Gupta",   rule: "No-Show Re-engagement",    ruleColor: "rose",    dueTime: "Due Tomorrow 10 AM",status: "Pending"   },
  { id: "q12", patient: "Ananya Nair",   rule: "Prescription Reminder",    ruleColor: "violet",  dueTime: "Due Tomorrow 11 AM",status: "Confirmed" },
];

const STAT_DATA = [
  { label: "Sent This Month", value: 847, color: "emerald" as RuleColor, suffix: "" },
  { label: "Response Rate",   value: 34,  color: "cyan"    as RuleColor, suffix: "%" },
  { label: "Reviews Collected", value: 23, color: "amber"  as RuleColor, suffix: "" },
  { label: "Re-bookings",     value: 41,  color: "violet"  as RuleColor, suffix: "" },
];

const VARIABLES = ["{name}", "{date}", "{doctor}", "{clinic}", "{time}", "{rating_link}"];

const PREVIEW_REPLACE: Record<string, string> = {
  "{name}": "Priya Sharma",
  "{date}": "Apr 24",
  "{doctor}": "Dr. Sharma",
  "{clinic}": "Reva Clinic",
  "{time}": "10:30 AM",
  "{rating_link}": "revaclinic.in/rate",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  const x = useSpring(enabled ? 20 : 2, { stiffness: 700, damping: 30 });

  useEffect(() => {
    x.set(enabled ? 20 : 2);
  }, [enabled, x]);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        enabled ? "bg-cyan-500" : "bg-white/10"
      }`}
    >
      <motion.div
        style={{ x }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SparkBar({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-5">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm bg-white/30"
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <span>{display}{suffix}</span>;
}

function Initials({ name, index }: { name: string; index: number }) {
  const parts = name.split(" ");
  const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials.toUpperCase()}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FollowUpView({ addToast }: FollowUpViewProps) {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [activeTab, setActiveTab] = useState("r1");
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [hoveredQueue, setHoveredQueue] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [delayDropdownOpen, setDelayDropdownOpen] = useState(false);
  const delayDropRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [modalName, setModalName] = useState("");
  const [modalTrigger, setModalTrigger] = useState<"appointment" | "no-show">("appointment");
  const [modalDelay, setModalDelay] = useState("2 hrs");
  const [modalMessage, setModalMessage] = useState("");
  const [modalColor, setModalColor] = useState<RuleColor>("cyan");

  const activeTemplate = templates.find((t) => t.ruleId === activeTab) ?? templates[0];
  const activeRule = rules.find((r) => r.id === activeTab) ?? rules[0];

  const confirmed = queue.filter((q) => q.status === "Confirmed").length;
  const pending = queue.filter((q) => q.status === "Pending").length;
  const skipped = queue.filter((q) => q.status === "Skipped").length;

  // Close delay dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (delayDropRef.current && !delayDropRef.current.contains(e.target as Node)) {
        setDelayDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateTemplate = useCallback(
    (field: keyof Template, value: string | boolean) => {
      setTemplates((prev) =>
        prev.map((t) => (t.ruleId === activeTab ? { ...t, [field]: value } : t))
      );
    },
    [activeTab]
  );

  const updateRuleDelay = (ruleId: string, delay: string) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, delay } : r)));
  };

  const insertVariable = (v: string) => {
    const body = activeTemplate.body + v;
    updateTemplate("body", body);
  };

  const resetTemplate = () => {
    const def = DEFAULT_TEMPLATES.find((t) => t.ruleId === activeTab);
    if (def) {
      setTemplates((prev) => prev.map((t) => (t.ruleId === activeTab ? { ...def } : t)));
    }
  };

  const sendNow = (id: string, patient: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "Confirmed" } : q))
    );
    addToast(`Message sent to ${patient}`, "success");
  };

  const skipItem = (id: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "Skipped" } : q))
    );
  };

  const sendAllPending = () => {
    const count = queue.filter((q) => q.status === "Pending").length;
    setQueue((prev) =>
      prev.map((q) => (q.status === "Pending" ? { ...q, status: "Confirmed" } : q))
    );
    addToast(`${count} pending messages sent`, "success");
  };

  const previewText = Object.entries(PREVIEW_REPLACE).reduce(
    (text, [key, val]) => text.replaceAll(key, val),
    activeTemplate.body
  );

  const createRule = () => {
    if (!modalName.trim()) return;
    const newId = `r${Date.now()}`;
    const iconMap: Record<RuleColor, React.ReactNode> = {
      cyan: <Clock size={16} />,
      violet: <AlertCircle size={16} />,
      amber: <Star size={16} />,
      emerald: <Calendar size={16} />,
      rose: <Users size={16} />,
    };
    const newRule: Rule = {
      id: newId,
      name: modalName,
      description: modalMessage.slice(0, 60) || "Custom follow-up rule",
      color: modalColor,
      delay: modalDelay,
      enabled: true,
      icon: iconMap[modalColor],
    };
    const newTemplate: Template = { ruleId: newId, body: modalMessage };
    setRules((prev) => [...prev, newRule]);
    setTemplates((prev) => [...prev, newTemplate]);
    setActiveTab(newId);
    setShowModal(false);
    setModalName("");
    setModalMessage("");
    setModalColor("cyan");
    addToast(`Rule "${modalName}" created`, "success");
  };

  // ── Animation variants ──────────────────────────────────────────────────────

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.35 } },
  };

  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { ease: "easeOut" as const, duration: 0.4, delay: i * 0.1 },
    }),
  };

  const queueVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const queueItemVariants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { ease: "easeOut" as const, duration: 0.3 } },
    exit: { opacity: 0, x: -16, transition: { ease: "easeOut" as const, duration: 0.2 } },
  };

  const templateVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0, transition: { ease: "easeOut" as const, duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { ease: "easeOut" as const, duration: 0.2 } },
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: "#050714" }}>
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="w-[280px] flex-shrink-0 flex flex-col border-r border-white/[0.08] overflow-y-auto">
        <div className="p-4 border-b border-white/[0.08]">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Automation Rules</p>
        </div>

        <motion.div
          className="flex flex-col gap-2 p-3 flex-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {rules.map((rule) => {
            const c = COLOR_MAP[rule.color];
            return (
              <motion.div
                key={rule.id}
                variants={itemVariants}
                onClick={() => setActiveTab(rule.id)}
                className={`relative rounded-xl p-3 cursor-pointer border-l-4 ${c.border} bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors ${
                  activeTab === rule.id ? "ring-1 ring-white/[0.15]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={c.text}>{rule.icon}</span>
                    <span className="text-sm font-medium text-white truncate">{rule.name}</span>
                  </div>
                  <ToggleSwitch
                    enabled={rule.enabled}
                    onToggle={() =>
                      setRules((prev) =>
                        prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                      )
                    }
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-6 leading-relaxed">{rule.description}</p>
                <div className="mt-2 ml-6">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    <Clock size={10} />
                    {rule.delay}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="p-3 border-t border-white/[0.08]">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/[0.2] text-slate-400 hover:text-white hover:border-white/[0.4] text-sm transition-colors"
          >
            <Plus size={15} />
            Add Rule
          </button>
        </div>
      </div>

      {/* ── CENTER + RIGHT COLUMN WRAPPER ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ── STAT CARDS ──────────────────────────────────────────────── */}
        <div className="flex gap-4 p-4 border-b border-white/[0.08] flex-shrink-0">
          {STAT_DATA.map((stat, i) => {
            const c = COLOR_MAP[stat.color];
            return (
              <motion.div
                key={stat.label}
                custom={i}
                variants={statVariants}
                initial="hidden"
                animate="visible"
                className={`flex-1 rounded-xl p-4 bg-white/[0.03] border border-white/[0.08] ${c.bg}`}
              >
                <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${c.text}`}>
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── CENTER + RIGHT ROW ────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── CENTER MAIN ──────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tab bar */}
            <LayoutGroup>
              <div className="flex gap-1 px-4 pt-3 border-b border-white/[0.08] flex-shrink-0 overflow-x-auto">
                {rules.map((rule) => {
                  const c = COLOR_MAP[rule.color];
                  const isActive = activeTab === rule.id;
                  return (
                    <button
                      key={rule.id}
                      onClick={() => setActiveTab(rule.id)}
                      className={`relative px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {rule.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 ${c.dot}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            {/* Template Editor */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={templateVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col gap-4"
                >
                  {/* Metadata bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${COLOR_MAP[activeRule.color].bg} ${COLOR_MAP[activeRule.color].text} font-medium`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${COLOR_MAP[activeRule.color].dot}`} />
                      {activeRule.name}
                    </span>

                    {/* Delay selector */}
                    <div className="relative" ref={delayDropRef}>
                      <button
                        onClick={() => setDelayDropdownOpen((p) => !p)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
                      >
                        <Clock size={11} />
                        {activeRule.delay}
                        <ChevronDown size={11} />
                      </button>
                      <AnimatePresence>
                        {delayDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ ease: "easeOut" as const, duration: 0.15 }}
                            className="absolute top-full mt-1 left-0 z-50 bg-[#0f1324] border border-white/[0.12] rounded-xl overflow-hidden shadow-xl"
                          >
                            {DELAY_OPTIONS.map((d) => (
                              <button
                                key={d}
                                onClick={() => {
                                  updateRuleDelay(activeTab, d);
                                  setDelayDropdownOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-xs hover:bg-white/[0.06] transition-colors ${
                                  activeRule.delay === d ? "text-cyan-400" : "text-slate-300"
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-slate-500">Enabled</span>
                      <ToggleSwitch
                        enabled={activeRule.enabled}
                        onToggle={() =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === activeTab ? { ...r, enabled: !r.enabled } : r
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Editor + Preview row */}
                  <div className="flex gap-4 flex-1 min-h-0">
                    {/* Message editor */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      <textarea
                        value={activeTemplate.body}
                        onChange={(e) => updateTemplate("body", e.target.value)}
                        maxLength={1200}
                        placeholder="Write your WhatsApp message here..."
                        className="flex-1 w-full resize-none rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 text-sm p-3 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors leading-relaxed min-h-[180px]"
                      />

                      {/* Char count */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${
                            activeTemplate.body.length > 1024
                              ? "text-rose-400"
                              : "text-slate-500"
                          }`}
                        >
                          {activeTemplate.body.length} / 1024
                          {activeTemplate.body.length > 1024 && " — exceeds WhatsApp limit"}
                        </span>
                      </div>

                      {/* Variable chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {VARIABLES.map((v) => (
                          <button
                            key={v}
                            onClick={() => insertVariable(v)}
                            className="text-xs px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.1] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors font-mono"
                          >
                            {v}
                          </button>
                        ))}
                      </div>

                      {/* Review Request toggle */}
                      {activeRule.id === "r3" && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-amber-400/5 border border-amber-400/20"
                        >
                          <Star size={14} className="text-amber-400" />
                          <span className="text-xs text-slate-300 flex-1">
                            Only send if rating ≥ ⭐⭐⭐⭐
                          </span>
                          <ToggleSwitch
                            enabled={!!activeTemplate.minRating}
                            onToggle={() => updateTemplate("minRating", !activeTemplate.minRating)}
                          />
                        </motion.div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addToast("Template saved", "success");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <Send size={14} />
                          Save Template
                        </button>
                        <button
                          onClick={resetTemplate}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.1] text-slate-400 hover:text-white text-sm transition-colors"
                        >
                          <RotateCcw size={13} />
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp phone preview */}
                    <div className="w-[200px] flex-shrink-0 flex flex-col items-center gap-2">
                      <p className="text-xs text-slate-500">Preview</p>
                      <div className="w-full rounded-[28px] border-2 border-white/[0.12] bg-[#0a0f1e] overflow-hidden shadow-xl flex flex-col" style={{ minHeight: 340 }}>
                        {/* Phone header */}
                        <div className="bg-[#00a884] px-3 py-2.5 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                            RC
                          </div>
                          <div>
                            <p className="text-white text-[10px] font-semibold leading-none">Reva Clinic</p>
                            <p className="text-green-100 text-[9px] leading-none mt-0.5">online</p>
                          </div>
                        </div>
                        {/* Chat area */}
                        <div
                          className="flex-1 p-2.5 overflow-y-auto"
                          style={{
                            background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23060d1f' width='60' height='60'/%3E%3C/svg%3E\")",
                          }}
                        >
                          <div className="bg-[#1a2744] rounded-xl rounded-tl-sm p-2.5 shadow-md max-w-full">
                            <p className="text-[10px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                              {previewText || "Your message preview will appear here…"}
                            </p>
                            <p className="text-[9px] text-slate-500 text-right mt-1">12:30 PM ✓✓</p>
                          </div>
                        </div>
                        {/* Phone bottom notch */}
                        <div className="bg-[#0a0f1e] h-3 flex items-center justify-center">
                          <div className="w-12 h-1 rounded-full bg-white/10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Performance */}
                  <div className="flex gap-3">
                    {[
                      { label: "Sent", value: "1,204", bars: [60, 80, 70, 90] },
                      { label: "Opened", value: "71%",  bars: [55, 65, 72, 71] },
                      { label: "Replied", value: "34%", bars: [28, 32, 30, 34] },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <div>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                          <p className="text-sm font-semibold text-white mt-0.5">{stat.value}</p>
                        </div>
                        <SparkBar values={stat.bars} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
          <div className="w-[320px] flex-shrink-0 flex flex-col border-l border-white/[0.08] overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-semibold text-white">Sending Today</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 font-medium">
                {queue.length}
              </span>
            </div>

            {/* Queue list */}
            <div className="flex-1 overflow-y-auto">
              <motion.div
                variants={queueVariants}
                initial="hidden"
                animate="visible"
                className="p-2 flex flex-col gap-1"
              >
                <AnimatePresence>
                  {queue.map((item, idx) => {
                    const c = COLOR_MAP[item.ruleColor];
                    const isHovered = hoveredQueue === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        variants={queueItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onMouseEnter={() => setHoveredQueue(item.id)}
                        onMouseLeave={() => setHoveredQueue(null)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                      >
                        <Initials name={item.patient} index={idx} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{item.patient}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.bg} ${c.text} truncate max-w-[110px]`}>
                              {item.rule}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.dueTime}</p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <AnimatePresence mode="wait">
                            {isHovered && item.status !== "Confirmed" ? (
                              <motion.div
                                key="actions"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ ease: "easeOut" as const, duration: 0.15 }}
                                className="flex gap-1"
                              >
                                {item.status === "Pending" && (
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => sendNow(item.id, item.patient)}
                                    className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors font-medium"
                                  >
                                    Send
                                  </motion.button>
                                )}
                                <button
                                  onClick={() => skipItem(item.id)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                                >
                                  Skip
                                </button>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="status"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === "Confirmed"
                                      ? "bg-emerald-400"
                                      : item.status === "Pending"
                                      ? "bg-amber-400"
                                      : "bg-slate-600"
                                  }`}
                                />
                                <span
                                  className={`text-[10px] ${
                                    item.status === "Confirmed"
                                      ? "text-emerald-400"
                                      : item.status === "Pending"
                                      ? "text-amber-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Bottom of panel */}
            <div className="p-3 border-t border-white/[0.08] flex-shrink-0 flex flex-col gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={sendAllPending}
                disabled={pending === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap size={14} />
                Send All Pending
              </motion.button>
              <motion.p layout className="text-center text-[11px] text-slate-500">
                {queue.length} scheduled · {confirmed} confirmed · {pending} pending · {skipped} skipped
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD RULE MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ ease: "easeOut" as const, duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-md bg-[#0d1225] border border-white/[0.12] rounded-2xl p-6 shadow-2xl backdrop-blur-xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-white">Add Automation Rule</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Rule name */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Rule Name</label>
                    <input
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="e.g. Birthday Greeting"
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  {/* Trigger */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Trigger</label>
                    <div className="flex gap-2">
                      {(["appointment", "no-show"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setModalTrigger(t)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                            modalTrigger === t
                              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                              : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
                          }`}
                        >
                          After {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delay */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Delay</label>
                    <select
                      value={modalDelay}
                      onChange={(e) => setModalDelay(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    >
                      {DELAY_OPTIONS.map((d) => (
                        <option key={d} value={d} className="bg-[#0d1225]">{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Message</label>
                    <textarea
                      value={modalMessage}
                      onChange={(e) => setModalMessage(e.target.value.slice(0, 500))}
                      placeholder="Hi {name}, ..."
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    />
                    <p className="text-[11px] text-slate-600 mt-1 text-right">{modalMessage.length}/500</p>
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Color</label>
                    <div className="flex gap-2">
                      {(["cyan", "violet", "emerald", "amber", "rose"] as RuleColor[]).map((col) => (
                        <button
                          key={col}
                          onClick={() => setModalColor(col)}
                          className={`w-7 h-7 rounded-full bg-gradient-to-br ${GRADIENT_MAP[col]} transition-all ${
                            modalColor === col ? "ring-2 ring-white/60 scale-110" : "opacity-60 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createRule}
                    disabled={!modalName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Create Rule
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
