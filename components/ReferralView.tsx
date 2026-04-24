"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Phone,
  UserPlus,
  Network,
  ArrowUpRight,
  ArrowDownLeft,
  MessageCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Search,
  Activity,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReferralViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type ReferralStatus = "Pending" | "Appointment Set" | "Seen" | "Overdue";
type ReceivedStatus = "New" | "Booked" | "Seen";
type TabId = "sent" | "received" | "network";
type UrgencyLevel = "Routine" | "Urgent" | "Emergency";

interface SentReferral {
  id: string;
  patient: string;
  age: number;
  specialist: string;
  specialty: string;
  date: string;
  status: ReferralStatus;
  outcome: string | null;
  reason: string;
  specialistPhone: string;
}

interface ReceivedReferral {
  id: string;
  patient: string;
  fromDoctor: string;
  reason: string;
  date: string;
  status: ReceivedStatus;
  appointmentDate?: string;
}

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  referrals: number;
  rating: number;
  hospital: string;
  phone: string;
  color: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const INITIAL_SENT: SentReferral[] = [
  { id: "r1", patient: "Priya Sharma", age: 42, specialist: "Dr. Arjun Mehta", specialty: "Cardiologist", date: "Apr 22", status: "Appointment Set", outcome: null, reason: "Chest pain and palpitations for 2 weeks", specialistPhone: "+91 98765 43210" },
  { id: "r2", patient: "Rahul Gupta", age: 35, specialist: "Dr. Sneha Patel", specialty: "Endocrinologist", date: "Apr 21", status: "Seen", outcome: "Diabetes management plan given", reason: "Uncontrolled blood sugar levels", specialistPhone: "+91 98765 43211" },
  { id: "r3", patient: "Ananya Nair", age: 28, specialist: "Dr. Ravi Kumar", specialty: "Orthopedic", date: "Apr 20", status: "Pending", outcome: null, reason: "Knee pain post-injury", specialistPhone: "+91 98765 43212" },
  { id: "r4", patient: "Vikram Patel", age: 55, specialist: "Dr. Priya Nair", specialty: "Neurologist", date: "Apr 19", status: "Seen", outcome: "MRI recommended, follow-up in 4 wks", reason: "Recurrent headaches and dizziness", specialistPhone: "+91 98765 43213" },
  { id: "r5", patient: "Sunita Rao", age: 61, specialist: "Dr. Arjun Mehta", specialty: "Cardiologist", date: "Apr 18", status: "Seen", outcome: "Echo normal, continue meds", reason: "Routine cardiac evaluation", specialistPhone: "+91 98765 43210" },
  { id: "r6", patient: "Karan Mehta", age: 47, specialist: "Dr. Amit Shah", specialty: "Pulmonologist", date: "Apr 17", status: "Appointment Set", outcome: null, reason: "Persistent cough and breathlessness", specialistPhone: "+91 98765 43214" },
  { id: "r7", patient: "Deepa Singh", age: 39, specialist: "Dr. Sneha Patel", specialty: "Endocrinologist", date: "Apr 16", status: "Pending", outcome: null, reason: "Thyroid irregularities", specialistPhone: "+91 98765 43211" },
  { id: "r8", patient: "Meera Joshi", age: 52, specialist: "Dr. Ravi Kumar", specialty: "Orthopedic", date: "Apr 15", status: "Seen", outcome: "Physiotherapy recommended", reason: "Lower back pain chronic", specialistPhone: "+91 98765 43212" },
  { id: "r9", patient: "Arjun Kumar", age: 31, specialist: "Dr. Priya Nair", specialty: "Neurologist", date: "Apr 14", status: "Seen", outcome: "EEG normal", reason: "Seizure episode evaluation", specialistPhone: "+91 98765 43213" },
  { id: "r10", patient: "Priya Sharma", age: 42, specialist: "Dr. Amit Shah", specialty: "Pulmonologist", date: "Apr 12", status: "Seen", outcome: "Mild asthma, inhaler prescribed", reason: "Wheezing and shortness of breath", specialistPhone: "+91 98765 43214" },
];

const RECEIVED_REFERRALS: ReceivedReferral[] = [
  { id: "rec1", patient: "Raj Verma", fromDoctor: "Dr. Amit Shah", reason: "Post-pulmonology follow-up", date: "Apr 23", status: "New" },
  { id: "rec2", patient: "Kavya Reddy", fromDoctor: "Dr. Ravi Kumar", reason: "Post-ortho rehab check", date: "Apr 22", status: "Booked", appointmentDate: "Apr 26" },
  { id: "rec3", patient: "Mohan Das", fromDoctor: "Dr. Sneha Patel", reason: "Diabetes complication", date: "Apr 21", status: "Seen", appointmentDate: "Apr 23" },
  { id: "rec4", patient: "Nalini Menon", fromDoctor: "Dr. Priya Nair", reason: "Neuro follow-up", date: "Apr 20", status: "Seen", appointmentDate: "Apr 22" },
  { id: "rec5", patient: "Arun Joshi", fromDoctor: "Dr. Amit Shah", reason: "Chest symptoms follow-up", date: "Apr 19", status: "Booked", appointmentDate: "Apr 25" },
  { id: "rec6", patient: "Rekha Singh", fromDoctor: "Dr. Arjun Mehta", reason: "Cardio follow-up", date: "Apr 18", status: "Seen", appointmentDate: "Apr 20" },
  { id: "rec7", patient: "Suresh Babu", fromDoctor: "Dr. Ravi Kumar", reason: "Post-fracture check", date: "Apr 17", status: "Seen", appointmentDate: "Apr 19" },
  { id: "rec8", patient: "Divya Nair", fromDoctor: "Dr. Sneha Patel", reason: "Thyroid follow-up", date: "Apr 16", status: "Seen", appointmentDate: "Apr 18" },
];

const SPECIALISTS: Specialist[] = [
  { id: "sp1", name: "Dr. Arjun Mehta", specialty: "Cardiologist", referrals: 12, rating: 4.8, hospital: "Apollo Clinic, Andheri", phone: "+91 98765 43210", color: "#F43F5E" },
  { id: "sp2", name: "Dr. Sneha Patel", specialty: "Endocrinologist", referrals: 8, rating: 4.9, hospital: "Kokilaben Hospital", phone: "+91 98765 43211", color: "#8B5CF6" },
  { id: "sp3", name: "Dr. Ravi Kumar", specialty: "Orthopedic Surgeon", referrals: 7, rating: 4.7, hospital: "Lilavati Hospital", phone: "+91 98765 43212", color: "#10B981" },
  { id: "sp4", name: "Dr. Priya Nair", specialty: "Neurologist", referrals: 5, rating: 4.9, hospital: "Bombay Hospital", phone: "+91 98765 43213", color: "#F59E0B" },
  { id: "sp5", name: "Dr. Amit Shah", specialty: "Pulmonologist", referrals: 4, rating: 4.6, hospital: "Breach Candy Hospital", phone: "+91 98765 43214", color: "#06B6D4" },
];

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiologist: "#F43F5E",
  Endocrinologist: "#8B5CF6",
  "Orthopedic": "#10B981",
  "Orthopedic Surgeon": "#10B981",
  Neurologist: "#F59E0B",
  Pulmonologist: "#06B6D4",
};

// ─── Count-up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return value;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .filter((w) => !w.startsWith("Dr"))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function statusBadge(status: ReferralStatus) {
  const map: Record<ReferralStatus, { bg: string; text: string; label: string }> = {
    Pending: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", label: "Pending" },
    "Appointment Set": { bg: "bg-cyan-500/15 border-cyan-500/30", text: "text-cyan-400", label: "Appointment Set" },
    Seen: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", label: "Seen" },
    Overdue: { bg: "bg-rose-500/15 border-rose-500/30", text: "text-rose-400", label: "Overdue" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text}`}>
      {status === "Pending" && <Clock size={10} />}
      {status === "Appointment Set" && <CheckCircle2 size={10} />}
      {status === "Seen" && <CheckCircle2 size={10} />}
      {status === "Overdue" && <AlertCircle size={10} />}
      {s.label}
    </span>
  );
}

function receivedBadge(status: ReceivedStatus) {
  const map: Record<ReceivedStatus, { bg: string; text: string }> = {
    New: { bg: "bg-cyan-500/15 border-cyan-500/30", text: "text-cyan-400" },
    Booked: { bg: "bg-violet-500/15 border-violet-500/30", text: "text-violet-400" },
    Seen: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.35 } },
};

const staggerContainer = (stagger = 0.05) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

const tabContent = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { ease: "easeOut" as const, duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { ease: "easeOut" as const, duration: 0.2 } },
};

const expandVariant = {
  hidden: { height: 0, opacity: 0 },
  show: { height: "auto", opacity: 1, transition: { ease: "easeOut" as const, duration: 0.35 } },
  exit: { height: 0, opacity: 0, transition: { ease: "easeOut" as const, duration: 0.25 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  target,
  sub,
  color,
  icon,
  decimals,
  delay,
}: {
  label: string;
  target: number;
  sub: string;
  color: string;
  icon: React.ReactNode;
  decimals?: number;
  delay: number;
}) {
  const val = useCountUp(target, 1200, decimals ?? 0);

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5"
    >
      <div
        className="absolute inset-0 opacity-[0.04] rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-0.5" style={{ color }}>
        {decimals ? val.toFixed(decimals) : Math.round(val)}
      </div>
      <div className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xs text-white/50">{sub}</div>
    </motion.div>
  );
}

function AvatarInitials({ name, color }: { name: string; color?: string }) {
  const initials = getInitials(name);
  const bg = color ?? "#06B6D4";
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ background: `linear-gradient(135deg, ${bg}88, ${bg}44)`, border: `1px solid ${bg}44` }}
    >
      {initials}
    </div>
  );
}

// ─── Sent Referral Row ────────────────────────────────────────────────────────

function SentReferralRow({
  ref: _ref,
  referral,
  addToast,
  onOutcomeSave,
}: {
  ref?: never;
  referral: SentReferral;
  addToast: ReferralViewProps["addToast"];
  onOutcomeSave: (id: string, outcome: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [outcomeText, setOutcomeText] = useState(referral.outcome ?? "");

  const spColor = SPECIALTY_COLORS[referral.specialty] ?? "#06B6D4";

  return (
    <motion.div variants={fadeUp} className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.03] transition-colors group"
        onClick={() => setExpanded((p) => !p)}
      >
        <AvatarInitials name={referral.patient} color="#06B6D4" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{referral.patient}</span>
            <span className="text-xs text-white/40">→</span>
            <span className="text-sm text-white/70">{referral.specialist}</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: `${spColor}22`, color: spColor, border: `1px solid ${spColor}33` }}
            >
              {referral.specialty}
            </span>
          </div>
          {referral.outcome && (
            <p className="text-xs text-slate-400 italic mt-0.5 truncate">{referral.outcome}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-white/40 hidden sm:block">{referral.date}</span>
          {statusBadge(referral.status)}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); addToast(`Follow-up sent to ${referral.patient}`, "info"); }}
              className="text-[11px] px-2 py-0.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              Follow Up
            </button>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-white/30" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            variants={expandVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.06]">
              {/* Referral Letter */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={13} className="text-violet-400" />
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Referral Letter</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Dear {referral.specialist},<br /><br />
                  I am referring <strong className="text-white">{referral.patient}</strong>, {referral.age} years old, for {referral.reason.toLowerCase()}. Please find attached relevant history. Kindly evaluate and advise further management.<br /><br />
                  Regards,<br />
                  <span className="text-white">Dr. Sharma</span>
                </p>
              </div>

              {/* WhatsApp Sent */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={13} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">WhatsApp Sent to Patient</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Hi {referral.patient.split(" ")[0]}, Dr. Sharma has referred you to <strong className="text-white">{referral.specialist}</strong> ({referral.specialty}). Please call{" "}
                  <span className="text-cyan-400">{referral.specialistPhone}</span> to book your appointment. Your referral note has been sent.
                </p>
              </div>

              {/* Outcome Recording */}
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-wider">Record Outcome</label>
                <textarea
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                  placeholder="Enter specialist's feedback and outcome..."
                  rows={2}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 resize-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onOutcomeSave(referral.id, outcomeText); addToast(`Outcome saved for ${referral.patient}`, "success"); }}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)" }}
                  >
                    Save Outcome
                  </button>
                  <button
                    onClick={() => addToast(`Follow-up WhatsApp sent to ${referral.patient}`, "success")}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff" }}
                  >
                    Send Follow-up WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Received Referral Row ────────────────────────────────────────────────────

function ReceivedReferralRow({ referral, addToast }: { referral: ReceivedReferral; addToast: ReferralViewProps["addToast"] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <AvatarInitials name={referral.patient} color="#8B5CF6" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">{referral.patient}</span>
          {referral.status === "New" && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"
            />
          )}
        </div>
        <div className="text-xs text-white/50 mt-0.5">
          <span className="text-violet-400">{referral.fromDoctor}</span> · {referral.reason}
        </div>
        {referral.appointmentDate && (
          <div className="text-xs text-white/30 mt-0.5">Appointment: {referral.appointmentDate}</div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-white/40 hidden sm:block">{referral.date}</span>
        {receivedBadge(referral.status)}
        {referral.status === "New" && (
          <button
            onClick={() => addToast(`Appointment booked for ${referral.patient}`, "success")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)" }}
          >
            Book Appointment
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Specialist Card ──────────────────────────────────────────────────────────

function SpecialistCard({
  specialist,
  onRefer,
}: {
  specialist: Specialist;
  onRefer: (sp: Specialist) => void;
}) {
  const spColor = SPECIALTY_COLORS[specialist.specialty] ?? "#06B6D4";
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.35 } } }}
      className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 overflow-hidden group hover:border-white/[0.15] transition-colors"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-2xl"
        style={{ background: spColor }}
      />
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${spColor}88, ${spColor}44)`, border: `1px solid ${spColor}44` }}
        >
          {getInitials(specialist.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{specialist.name}</div>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
            style={{ background: `${spColor}22`, color: spColor, border: `1px solid ${spColor}33` }}
          >
            {specialist.specialty}
          </span>
        </div>
      </div>
      <div className="text-xs text-white/40 mb-2 truncate">{specialist.hospital}</div>
      <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
        <span className="flex items-center gap-1">
          <ArrowUpRight size={11} className="text-cyan-400" />
          {specialist.referrals} referrals
        </span>
        <span className="flex items-center gap-1">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          {specialist.rating}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onRefer(specialist)}
          className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)" }}
        >
          Refer Patient
        </button>
        <button
          onClick={() => window.open(`tel:${specialist.phone}`)}
          className="px-2.5 py-1.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          <Phone size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── New Referral Form ────────────────────────────────────────────────────────

function NewReferralForm({
  addToast,
  onAdd,
  prefilledSpecialist,
  onClearPrefill,
}: {
  addToast: ReferralViewProps["addToast"];
  onAdd: (r: SentReferral) => void;
  prefilledSpecialist: Specialist | null;
  onClearPrefill: () => void;
}) {
  const [patient, setPatient] = useState("");
  const [specialist, setSpecialist] = useState(prefilledSpecialist?.name ?? "");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("Routine");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (prefilledSpecialist) setSpecialist(prefilledSpecialist.name);
  }, [prefilledSpecialist]);

  const urgencyColors: Record<UrgencyLevel, string> = {
    Routine: "#10B981",
    Urgent: "#F59E0B",
    Emergency: "#F43F5E",
  };

  const handleSubmit = () => {
    if (!patient.trim() || !specialist) {
      addToast("Fill in patient name and specialist", "warn");
      return;
    }
    const sp = SPECIALISTS.find((s) => s.name === specialist) ?? SPECIALISTS[0];
    const newRef: SentReferral = {
      id: `r${Date.now()}`,
      patient: patient.trim(),
      age: 40,
      specialist: sp.name,
      specialty: sp.specialty,
      date: "Apr 24",
      status: "Pending",
      outcome: null,
      reason: reason || "General consultation",
      specialistPhone: sp.phone,
    };
    onAdd(newRef);
    addToast(`Referral sent — ${patient.trim()} notified via WhatsApp ✓`, "success");
    setPatient("");
    setSpecialist(SPECIALISTS[0].name);
    setReason("");
    setUrgency("Routine");
    onClearPrefill();
  };

  return (
    <div
      className="rounded-2xl border bg-white/[0.03] backdrop-blur-xl p-5 transition-all duration-300"
      style={{
        borderColor: focused ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.08)",
        boxShadow: focused ? "0 0 0 2px rgba(6,182,212,0.08)" : "none",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <UserPlus size={14} className="text-cyan-400" />
          </div>
          <span className="text-sm font-semibold text-white">Refer a Patient</span>
        </div>
        {prefilledSpecialist && (
          <button onClick={onClearPrefill} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      <div className="space-y-3" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Patient name..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>

        <select
          value={specialist}
          onChange={(e) => setSpecialist(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/40 transition-colors appearance-none"
          style={{ colorScheme: "dark" }}
        >
          {SPECIALISTS.map((s) => (
            <option key={s.id} value={s.name} className="bg-[#0d1117]">
              {s.name} — {s.specialty}
            </option>
          ))}
        </select>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for referral..."
          rows={2}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 resize-none transition-colors"
        />

        <div>
          <label className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5 block">Urgency</label>
          <div className="flex gap-2">
            {(["Routine", "Urgent", "Emergency"] as UrgencyLevel[]).map((u) => (
              <button
                key={u}
                onClick={() => setUrgency(u)}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={
                  urgency === u
                    ? { background: `${urgencyColors[u]}22`, color: urgencyColors[u], borderColor: `${urgencyColors[u]}44` }
                    : { background: "transparent", color: "rgba(255,255,255,0.3)", borderColor: "rgba(255,255,255,0.08)" }
                }
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)" }}
        >
          <Send size={14} />
          Send Referral + WhatsApp Patient
        </button>
      </div>
    </div>
  );
}

// ─── Referral Insights ────────────────────────────────────────────────────────

function ReferralInsights() {
  const insights = [
    { color: "#8B5CF6", icon: <Star size={13} />, title: "Top Specialist", body: "Dr. Arjun Mehta (Cardiology) — 12 referrals, 4.8★ avg feedback" },
    { color: "#10B981", icon: <Activity size={13} />, title: "Outcome Rate", body: "85% of referrals have recorded outcomes — top 10% of Reva clinics" },
    { color: "#F59E0B", icon: <Clock size={13} />, title: "Follow-up Gap", body: "3 referrals >7 days old with no outcome recorded" },
    { color: "#06B6D4", icon: <TrendingUp size={13} />, title: "Network Value", body: "18 back-referrals received — ₹32,400 in new consultations" },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <Zap size={14} className="text-violet-400" />
        </div>
        <span className="text-sm font-semibold text-white">Referral Insights</span>
      </div>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            style={{ borderLeftColor: `${ins.color}55`, borderLeftWidth: 3 }}
          >
            <div className="mt-0.5 shrink-0" style={{ color: ins.color }}>{ins.icon}</div>
            <div>
              <div className="text-xs font-semibold mb-0.5" style={{ color: ins.color }}>{ins.title}</div>
              <div className="text-xs text-white/50 leading-relaxed">{ins.body}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReferralView({ addToast }: ReferralViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("sent");
  const [sentReferrals, setSentReferrals] = useState<SentReferral[]>(INITIAL_SENT);
  const [prefilledSpecialist, setPrefilledSpecialist] = useState<Specialist | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "sent", label: "Sent Referrals", icon: <ArrowUpRight size={14} /> },
    { id: "received", label: "Received Referrals", icon: <ArrowDownLeft size={14} /> },
    { id: "network", label: "Specialists Network", icon: <Network size={14} /> },
  ];

  const handleOutcomeSave = useCallback((id: string, outcome: string) => {
    setSentReferrals((prev) =>
      prev.map((r) => r.id === id ? { ...r, outcome, status: "Seen" } : r)
    );
  }, []);

  const handleAddReferral = useCallback((r: SentReferral) => {
    setSentReferrals((prev) => [r, ...prev]);
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: "#050714" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Referral Network</h1>
          <p className="text-sm text-white/40 mt-0.5">Track, send & receive specialist referrals via WhatsApp</p>
        </div>
        <button
          onClick={() => setActiveTab("sent")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)" }}
        >
          <Plus size={15} />
          New Referral
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard label="Referrals Sent" target={34} sub="this month" color="#06B6D4" icon={<ArrowUpRight size={16} />} delay={0} />
        <StatCard label="Referrals Received" target={18} sub="this month" color="#8B5CF6" icon={<ArrowDownLeft size={16} />} delay={1} />
        <StatCard label="Outcome Tracked" target={29} sub="85% tracked" color="#10B981" icon={<CheckCircle2 size={16} />} delay={2} />
        <StatCard label="Avg Outcome Time" target={6.2} sub="days to outcome" color="#F59E0B" icon={<Clock size={16} />} decimals={1} delay={3} />
      </motion.div>

      {/* Main Content */}
      <div className="flex gap-6 items-start">
        {/* LEFT COL */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab Bar */}
          <LayoutGroup id="referral-tabs">
            <div className="flex gap-1 p-1 rounded-xl border border-white/[0.08] bg-white/[0.02] w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)" }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: "rgba(6,182,212,0.12)", borderBottom: "2px solid #06B6D4" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "sent" && (
              <motion.div
                key="sent"
                variants={tabContent}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.div
                  variants={staggerContainer(0.05)}
                  initial="hidden"
                  animate="show"
                  className="space-y-2"
                >
                  {sentReferrals.map((r) => (
                    <SentReferralRow
                      key={r.id}
                      referral={r}
                      addToast={addToast}
                      onOutcomeSave={handleOutcomeSave}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {activeTab === "received" && (
              <motion.div
                key="received"
                variants={tabContent}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.div
                  variants={staggerContainer(0.05)}
                  initial="hidden"
                  animate="show"
                  className="space-y-2"
                >
                  {RECEIVED_REFERRALS.map((r) => (
                    <ReceivedReferralRow key={r.id} referral={r} addToast={addToast} />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {activeTab === "network" && (
              <motion.div
                key="network"
                variants={tabContent}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.div
                  variants={staggerContainer(0.07)}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-3"
                >
                  {SPECIALISTS.map((sp) => (
                    <SpecialistCard
                      key={sp.id}
                      specialist={sp}
                      onRefer={(s) => {
                        setPrefilledSpecialist(s);
                        addToast(`Pre-filled referral for ${s.name}`, "info");
                      }}
                    />
                  ))}

                  {/* Add Specialist Card */}
                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.35 } } }}
                    onClick={() => addToast("Add specialist flow coming soon", "info")}
                    className="rounded-2xl border-2 border-dashed border-white/[0.1] bg-transparent flex flex-col items-center justify-center gap-2 p-6 hover:border-white/[0.2] hover:bg-white/[0.02] transition-all min-h-[160px]"
                  >
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                      <Plus size={16} className="text-white/40" />
                    </div>
                    <span className="text-sm text-white/30">Add Specialist</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COL */}
        <div className="w-[360px] shrink-0 space-y-4">
          <NewReferralForm
            addToast={addToast}
            onAdd={handleAddReferral}
            prefilledSpecialist={prefilledSpecialist}
            onClearPrefill={() => setPrefilledSpecialist(null)}
          />
          <ReferralInsights />
        </div>
      </div>
    </div>
  );
}
