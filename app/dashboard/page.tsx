"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, MessageSquare, BarChart3,
  Settings, Bell, TrendingUp, AlertCircle, ExternalLink,
  Send, Check, X, ChevronLeft, ChevronRight, Search,
  Plus, Users, Activity, RefreshCcw, CheckCheck,
  Phone, Mic, Paperclip, Smile, ArrowUpRight, Clock,
  Edit3, Save, LogOut, Zap, Star, MapPin, Mail,
  ToggleLeft, ToggleRight, Eye, EyeOff, Filter,
  CreditCard, ListOrdered, FileText, GitMerge, Shield
} from "lucide-react";
import PatientsView from "@/components/PatientsView";
import BillingView from "@/components/BillingView";
import QueueView from "@/components/QueueView";
import FollowUpView from "@/components/FollowUpView";
import NoShowView from "@/components/NoShowView";
import PrescriptionView from "@/components/PrescriptionView";
import LabReportsView from "@/components/LabReportsView";
import ReferralView from "@/components/ReferralView";
import ConsentView from "@/components/ConsentView";
import AvailabilityView from "@/components/AvailabilityView";
import DepositsView from "@/components/DepositsView";
import ReviewsView from "@/components/ReviewsView";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { updateAppointment, sendMessage, markConversationRead, getMessages } from "@/lib/api";
import type { RevaAppointment, RevaConversation, RevaMessage } from "@/lib/supabase/types";
import OnboardingWizard from "@/components/OnboardingWizard";
import DoctorBrief from "@/components/DoctorBrief";
import BriefButton from "@/components/BriefButton";

/* ─── Types ─── */
type View = "Dashboard" | "Calendar" | "Messages" | "Analytics" | "Settings" | "Notifications" | "Patients" | "Billing" | "Queue" | "Follow-Up" | "No-Show" | "Prescriptions" | "Lab Reports" | "Referrals" | "Consent" | "Availability" | "Deposits" | "Reviews";
type AppointmentStatus = "Confirmed" | "Pending" | "Cancelled";

interface Appointment {
  time: string; name: string; initials: string;
  avatarColor: string; type: string; status: AppointmentStatus;
}
interface Conversation {
  id: number; name: string; initials: string; avatarColor: string;
  preview: string; time: string; unread?: number;
  messages: { from: "reva" | "patient"; text: string; time: string }[];
}
interface Toast { id: number; message: string; type: "success" | "info" | "warn"; }
interface Notification { id: number; text: string; sub: string; time: string; read: boolean; icon: string; }

/* ─── Data ─── */
const APPOINTMENTS_INIT: Appointment[] = [
  { time: "10:30 AM", name: "Priya Sharma",  initials: "PS", avatarColor: "from-pink-500 to-rose-500",     type: "General Checkup",       status: "Confirmed" },
  { time: "11:00 AM", name: "Rahul Gupta",   initials: "RG", avatarColor: "from-blue-500 to-cyan-500",     type: "Follow-up",             status: "Confirmed" },
  { time: "11:30 AM", name: "Ananya Nair",   initials: "AN", avatarColor: "from-violet-500 to-purple-500", type: "Dental Cleaning",       status: "Pending"   },
  { time: "12:00 PM", name: "Vikram Patel",  initials: "VP", avatarColor: "from-emerald-500 to-teal-500",  type: "Consultation",          status: "Confirmed" },
  { time: "2:30 PM",  name: "Sunita Rao",    initials: "SR", avatarColor: "from-amber-500 to-orange-500",  type: "Blood Pressure Check",  status: "Confirmed" },
  { time: "3:00 PM",  name: "Karan Mehta",   initials: "KM", avatarColor: "from-slate-400 to-gray-500",    type: "General Checkup",       status: "Cancelled" },
  { time: "3:30 PM",  name: "Deepa Singh",   initials: "DS", avatarColor: "from-fuchsia-500 to-pink-500",  type: "X-Ray Review",          status: "Pending"   },
];

const CONVERSATIONS: Conversation[] = [
  {
    id: 1, name: "Priya Sharma", initials: "PS", avatarColor: "from-pink-500 to-rose-500",
    preview: "Thanks! See you at 10:30", time: "9:42 AM",
    messages: [
      { from: "reva",    text: "Hi! 👋 Welcome to Dr. Sharma's Clinic. How can I help you today?", time: "9:30 AM" },
      { from: "patient", text: "Hi, I need to book an appointment for tomorrow", time: "9:31 AM" },
      { from: "reva",    text: "Sure! Dr. Sharma has these slots available tomorrow:\n• 10:30 AM ✓\n• 2:00 PM ✓\n• 4:15 PM ✓\n\nWhich works for you?", time: "9:31 AM" },
      { from: "patient", text: "10:30 AM please!", time: "9:32 AM" },
      { from: "reva",    text: "✅ Booked! Your appointment is confirmed for tomorrow at 10:30 AM. You'll get a reminder 1 hour before. See you! 🎉", time: "9:32 AM" },
      { from: "patient", text: "Thanks! See you at 10:30 🙏", time: "9:42 AM" },
    ],
  },
  {
    id: 2, name: "Rahul Gupta", initials: "RG", avatarColor: "from-blue-500 to-cyan-500",
    preview: "Can I reschedule to...", time: "9:15 AM", unread: 1,
    messages: [
      { from: "reva",    text: "Hi Rahul! 👋 Your appointment with Dr. Sharma is confirmed for today at 11:00 AM. See you soon!", time: "8:00 AM" },
      { from: "patient", text: "Hi, can I reschedule to next week? Something came up", time: "9:15 AM" },
    ],
  },
  {
    id: 3, name: "Meera Joshi", initials: "MJ", avatarColor: "from-violet-500 to-purple-500",
    preview: "What are your timings on...", time: "Yesterday", unread: 2,
    messages: [
      { from: "patient", text: "Hello, what are your timings on Saturday?", time: "Yesterday 4:10 PM" },
      { from: "patient", text: "Also do you do dental implants?", time: "Yesterday 4:11 PM" },
    ],
  },
  {
    id: 4, name: "Arjun Kumar", initials: "AK", avatarColor: "from-emerald-500 to-teal-500",
    preview: "Appointment confirmed ✅", time: "Yesterday",
    messages: [
      { from: "patient", text: "I'd like to book for a root canal", time: "Yesterday 2:00 PM" },
      { from: "reva",    text: "Of course! Dr. Sharma has availability this week. Would Thursday at 3 PM work?", time: "Yesterday 2:01 PM" },
      { from: "patient", text: "Yes perfect", time: "Yesterday 2:03 PM" },
      { from: "reva",    text: "Appointment confirmed ✅ Thursday at 3:00 PM. See you then!", time: "Yesterday 2:03 PM" },
    ],
  },
  {
    id: 5, name: "Sunita Rao", initials: "SR", avatarColor: "from-amber-500 to-orange-500",
    preview: "I'll be 5 mins late", time: "Yesterday",
    messages: [
      { from: "reva",    text: "⏰ Reminder: Your appointment with Dr. Sharma is in 1 hour — today at 2:30 PM.", time: "Yesterday 1:30 PM" },
      { from: "patient", text: "I'll be 5 mins late, is that okay?", time: "Yesterday 2:10 PM" },
      { from: "reva",    text: "No worries at all! We'll see you at 2:35 PM. 😊", time: "Yesterday 2:10 PM" },
    ],
  },
];

const NOTIFICATIONS_INIT: Notification[] = [
  { id: 1, text: "New booking from Priya Sharma", sub: "Checkup — Tomorrow 10:30 AM", time: "2 min ago", read: false, icon: "📅" },
  { id: 2, text: "Missed call recovered", sub: "Meera Joshi was auto-replied via WhatsApp", time: "18 min ago", read: false, icon: "📞" },
  { id: 3, text: "No-show alert", sub: "Karan Mehta didn't confirm — slot marked available", time: "1 hr ago", read: false, icon: "⚠️" },
  { id: 4, text: "Recall campaign ready", sub: "87 patients due for 6-month dental recall", time: "3 hrs ago", read: true, icon: "📢" },
  { id: 5, text: "Rahul Gupta wants to reschedule", sub: "Reply needed — tap to open chat", time: "Today 9:15 AM", read: true, icon: "💬" },
];

const WEEKLY_CHART = [
  { day: "Mon", value: 22 }, { day: "Tue", value: 28 }, { day: "Wed", value: 31 },
  { day: "Thu", value: 25 }, { day: "Fri", value: 35 }, { day: "Sat", value: 18 }, { day: "Sun", value: 8 },
];
const TOP_SERVICES = [
  { name: "General Checkup", count: 142, pct: 88 },
  { name: "Dental Cleaning", count: 98,  pct: 61 },
  { name: "Blood Pressure",  count: 76,  pct: 47 },
  { name: "Consultation",    count: 61,  pct: 38 },
  { name: "X-Ray Review",    count: 34,  pct: 21 },
];

const NAV_ITEMS: { icon: React.ElementType; label: View; badge?: number }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Calendar,        label: "Calendar" },
  { icon: MessageSquare,   label: "Messages",       badge: 3 },
  { icon: Users,           label: "Patients" },
  { icon: ListOrdered,     label: "Queue" },
  { icon: CreditCard,      label: "Billing" },
  { icon: Send,            label: "Follow-Up" },
  { icon: AlertCircle,     label: "No-Show" },
  { icon: Activity,        label: "Prescriptions" },
  { icon: FileText,        label: "Lab Reports" },
  { icon: GitMerge,        label: "Referrals" },
  { icon: Shield,          label: "Consent" },
  { icon: BarChart3,       label: "Analytics" },
  { icon: Bell,            label: "Notifications",  badge: 3 },
  { icon: Settings,        label: "Settings" },
  { icon: Clock,           label: "Availability" },
  { icon: CreditCard,      label: "Deposits" },
  { icon: Star,            label: "Reviews" },
];

/* ─── Helpers ─── */
function Avatar({ initials, color, size = "sm" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-10 h-10 text-sm" : size === "md" ? "w-8 h-8 text-xs" : "w-7 h-7 text-[10px]";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, string> = {
    Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Pending:   "bg-amber-500/10  text-amber-400  border-amber-500/20",
    Cancelled: "bg-red-500/10   text-red-400    border-red-500/20",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status]}`}>{status}</span>;
}

function ToastStack({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium
              ${t.type === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
              : t.type === "warn" ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
              : "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"}`}
          >
            {t.type === "success" ? <Check className="w-4 h-4" />
              : t.type === "warn" ? <AlertCircle className="w-4 h-4" />
              : <Zap className="w-4 h-4" />}
            {t.message}
            <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Views ─── */
// Patients whose brief has been submitted (simulated)
const BRIEF_SUBMITTED = ["Priya Sharma", "Ananya Nair", "Deepa Singh"];

// Map real appointments to the UI Appointment shape
const AVATAR_COLORS_LIST = [
  "from-pink-500 to-rose-500", "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500", "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500", "from-fuchsia-500 to-pink-500",
  "from-slate-400 to-gray-500",
];
function mapRealAppointment(a: RevaAppointment, idx: number): Appointment {
  const name = (a.patient as { name: string } | null)?.name ?? "Patient";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return {
    time: a.appointment_time.slice(0, 5).replace(":", ":"),
    name,
    initials,
    avatarColor: AVATAR_COLORS_LIST[idx % AVATAR_COLORS_LIST.length],
    type: a.type,
    status: a.status as AppointmentStatus,
    _id: a.id,
  } as Appointment & { _id: string };
}

function DashboardView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const { appointments: realAppts, refresh } = useDashboard();
  // Merge: use real data if available, otherwise fall back to mock
  const [appts, setAppts] = useState<(Appointment & { _id?: string })[]>(APPOINTMENTS_INIT);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [recallModal, setRecallModal] = useState(false);
  const [recallSent, setRecallSent] = useState(false);
  const [filter, setFilter] = useState<"All" | AppointmentStatus>("All");
  const [briefPatient, setBriefPatient] = useState<Appointment | null>(null);

  useEffect(() => {
    if (realAppts.length > 0) {
      setAppts(realAppts.map(mapRealAppointment));
    }
  }, [realAppts]);

  const updateStatus = (idx: number, status: AppointmentStatus) => {
    const appt = appts[idx] as Appointment & { _id?: string };
    // Optimistic update
    setAppts(prev => prev.map((a, i) => i === idx ? { ...a, status } : a));
    setExpandedIdx(null);
    addToast(
      status === "Confirmed" ? "Appointment confirmed ✓" :
      status === "Cancelled" ? "Appointment cancelled" : "Status updated",
      status === "Confirmed" ? "success" : status === "Cancelled" ? "warn" : "info"
    );
    // Persist to DB if we have a real id
    if (appt._id) {
      updateAppointment(appt._id, { status }).then(() => refresh()).catch(() => {});
    }
  };

  const sendReminder = (name: string) => {
    addToast(`Reminder sent to ${name} via WhatsApp 📱`, "info");
    setExpandedIdx(null);
  };

  const filtered = appts.filter(a => filter === "All" || a.status === filter);

  const stats = [
    { value: appts.filter(a => a.status !== "Cancelled").length.toString(), label: "Appointments Today", note: "↑12% from yesterday", color: "text-emerald-400", trend: "up" },
    { value: appts.filter(a => a.status === "Pending").length.toString(), label: "Pending Confirmations", note: "Action needed", color: "text-amber-400", trend: "warn" },
    { value: "3", label: "Missed Calls Recovered", note: "This week", color: "text-cyan-400", trend: "up" },
    { value: "91%", label: "Show-up Rate", note: "↑8% this month", color: "text-emerald-400", trend: "up" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 cursor-default">
            <p className="text-slate-400 text-xs mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-white mb-1.5">{s.value}</p>
            <div className="flex items-center gap-1">
              {s.trend === "up" ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
              <span className={`text-xs ${s.color}`}>{s.note}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Appointments + Conversations */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        {/* Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Today&apos;s Appointments</h2>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
              {(["All", "Confirmed", "Pending", "Cancelled"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-all duration-150
                    ${filter === f ? "bg-white/[0.1] text-white font-medium" : "text-slate-500 hover:text-slate-300"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-0.5">
            {filtered.map((appt, i) => {
              const realIdx = appts.indexOf(appt);
              const isOpen = expandedIdx === realIdx;
              return (
                <div key={i}>
                  <div onClick={() => setExpandedIdx(isOpen ? null : realIdx)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 cursor-pointer
                      ${isOpen ? "bg-white/[0.07] border border-white/[0.1]" : "hover:bg-white/[0.04]"}`}>
                    <span className="text-slate-400 text-xs w-16 shrink-0 font-mono">{appt.time}</span>
                    <Avatar initials={appt.initials} color={appt.avatarColor} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{appt.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{appt.type}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-600 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2.5 flex-wrap">
                          <button onClick={() => updateStatus(realIdx, "Confirmed")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-colors border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Confirm
                          </button>
                          <button onClick={() => updateStatus(realIdx, "Cancelled")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors border border-red-500/20">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                          <button onClick={() => { addToast("Reschedule link sent to patient", "info"); setExpandedIdx(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors border border-blue-500/20">
                            <Clock className="w-3 h-3" /> Reschedule
                          </button>
                          <button onClick={() => sendReminder(appt.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 text-xs font-medium hover:bg-cyan-500/25 transition-colors border border-cyan-500/20">
                            <Send className="w-3 h-3" /> Send Reminder
                          </button>
                          <BriefButton
                            patientName={appt.name}
                            submitted={BRIEF_SUBMITTED.includes(appt.name)}
                            onViewBrief={() => setBriefPatient(appt)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Conversations preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Recent WhatsApp Chats</h2>
            <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">3 unread</span>
          </div>
          <div className="space-y-0.5 flex-1">
            {CONVERSATIONS.map((c) => (
              <div key={c.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer group">
                <div className="relative">
                  <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                  {c.unread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#050714]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{c.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{c.preview}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-slate-500 text-[10px]">{c.time}</span>
                  {c.unread && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {c.unread}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
              </div>
            ))}
          </div>
          <button className="mt-3 w-full py-2 text-xs text-cyan-400 hover:text-cyan-300 border border-white/[0.06] hover:border-cyan-500/30 rounded-xl transition-all duration-150">
            Open full inbox →
          </button>
        </motion.div>
      </div>

      {/* Recall campaign */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300
          ${recallSent ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.03] border-cyan-500/20"}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${recallSent ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`} />
            <h3 className="text-white font-semibold text-sm">{recallSent ? "Recall Campaign Sent ✓" : "Recall Campaign Ready"}</h3>
          </div>
          <p className="text-slate-400 text-sm">
            {recallSent
              ? "87 WhatsApp messages sent. Replies will appear in your inbox."
              : <>87 patients due for 6-month dental recall. <span className="text-slate-300">Send campaign?</span></>}
          </p>
          {!recallSent && (
            <p className="text-slate-500 text-xs mt-1 italic">
              Preview: &ldquo;Hi [Name], it&apos;s time for your 6-month checkup at Dr. Sharma&apos;s Clinic. Reply YES to book. 😊&rdquo;
            </p>
          )}
        </div>
        {!recallSent ? (
          <button onClick={() => setRecallModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-cyan-500/20 shrink-0">
            <Send className="w-4 h-4" /> Send Campaign
          </button>
        ) : (
          <span className="flex items-center gap-2 text-emerald-400 text-sm font-semibold shrink-0">
            <CheckCheck className="w-4 h-4" /> Sent to 87 patients
          </span>
        )}
      </motion.div>

      {/* Doctor Brief Panel */}
      <AnimatePresence>
        {briefPatient && (
          <DoctorBrief
            patient={{
              name: briefPatient.name,
              initials: briefPatient.initials,
              avatarColor: briefPatient.avatarColor,
              appointmentType: briefPatient.type,
              time: briefPatient.time,
            }}
            onClose={() => setBriefPatient(null)}
          />
        )}
      </AnimatePresence>

      {/* Recall confirm modal */}
      <AnimatePresence>
        {recallModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRecallModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1024] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-white font-bold text-lg mb-2">Send Recall Campaign?</h3>
              <p className="text-slate-400 text-sm mb-4">This will send WhatsApp messages to <span className="text-white font-semibold">87 patients</span> who are due for their 6-month dental checkup.</p>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 mb-5 text-sm text-slate-300 italic">
                &ldquo;Hi [Name], it&apos;s time for your 6-month dental checkup at Dr. Sharma&apos;s Clinic! Reply YES to book your appointment, or STOP to opt out. 😊&rdquo;
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRecallModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-slate-400 text-sm hover:bg-white/[0.05] transition-colors">Cancel</button>
                <button onClick={() => { setRecallSent(true); setRecallModal(false); addToast("Campaign sent to 87 patients! 🚀", "success"); }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  Send Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Calendar View ─── */
function CalendarView() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today.getDate());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const apptDays: Record<number, number> = { 3: 4, 8: 7, 15: 3, 18: 9, 22: 2, [today.getDate()]: 7, [today.getDate() + 1]: 5 };

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  const dayAppts = APPOINTMENTS_INIT.filter((_, i) => i < (apptDays[selected] || 0));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
      {/* Calendar grid */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">{monthName} {year}</h2>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} className="text-center text-slate-500 text-xs py-2 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSel = day === selected;
            const count = apptDays[day];
            return (
              <button key={day} onClick={() => setSelected(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-150 font-medium
                  ${isSel ? "bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg" :
                    isToday ? "bg-white/[0.1] text-white border border-cyan-500/40" :
                    "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}>
                {day}
                {count && !isSel && (
                  <div className={`absolute bottom-1 flex gap-0.5 ${isSel ? "" : ""}`}>
                    {Array(Math.min(count, 3)).fill(null).map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-cyan-400" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day appointments */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-1">
          {selected === today.getDate() ? "Today" : `${monthName} ${selected}`}
        </h3>
        <p className="text-slate-500 text-xs mb-4">{apptDays[selected] || 0} appointments</p>
        {(apptDays[selected] || 0) === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <Calendar className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No appointments this day</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayAppts.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
                <span className="text-cyan-400 text-xs font-mono shrink-0">{a.time}</span>
                <Avatar initials={a.initials} color={a.avatarColor} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{a.name}</p>
                  <p className="text-slate-500 text-[11px]">{a.type}</p>
                </div>
                <StatusBadge status={a.status} />
              </motion.div>
            ))}
          </div>
        )}
        <button className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-white/[0.1] text-slate-500 text-xs hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-150 flex items-center justify-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Appointment
        </button>
      </div>
    </div>
  );
}

/* ─── Messages View ─── */
function MessagesView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const { conversations: realConvos, refresh } = useDashboard();

  // Merge real conversations over mock data — real data wins when available
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [selected, setSelected] = useState<Conversation>(CONVERSATIONS[0]);
  const [liveMessages, setLiveMessages] = useState<RevaMessage[]>([]);
  const [selectedRealId, setSelectedRealId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);

  // When real convos load, convert and merge them
  useEffect(() => {
    if (realConvos.length === 0) return;
    const mapped: Conversation[] = realConvos.map((rc, i) => ({
      id: i + 1000, // avoid collision with mock ids
      name: rc.contact_name ?? rc.contact_phone,
      initials: (rc.contact_name ?? "??").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      avatarColor: AVATAR_COLORS_LIST[i % AVATAR_COLORS_LIST.length],
      preview: rc.last_message ?? "",
      time: new Date(rc.last_message_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      unread: rc.unread_count > 0 ? rc.unread_count : undefined,
      messages: [],
      _realId: rc.id,
    } as Conversation & { _realId: string }));
    setConvos(mapped);
    if (mapped.length > 0) {
      setSelected(mapped[0]);
      setSelectedRealId((mapped[0] as Conversation & { _realId?: string })._realId ?? null);
    }
  }, [realConvos]);

  // Load messages when a real conversation is selected
  useEffect(() => {
    if (!selectedRealId) return;
    getMessages(selectedRealId)
      .then(msgs => setLiveMessages(msgs))
      .catch(() => {});
    markConversationRead(selectedRealId).catch(() => {});
  }, [selectedRealId]);

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight;
  }, [selected, liveMessages]);

  const sendMsg = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    if (selectedRealId) {
      // Real send via API
      try {
        const msg = await sendMessage(selectedRealId, text);
        setLiveMessages(prev => [...prev, msg]);
        setConvos(prev => prev.map(c =>
          (c as Conversation & { _realId?: string })._realId === selectedRealId
            ? { ...c, preview: text, unread: undefined }
            : c
        ));
        refresh();
        addToast("Message sent via WhatsApp", "success");
      } catch {
        addToast("Failed to send message", "warn");
      }
    } else {
      // Mock fallback
      const newMsg = { from: "reva" as const, text, time: "Now" };
      setConvos(prev => prev.map(c => c.id === selected.id
        ? { ...c, preview: text, unread: undefined, messages: [...c.messages, newMsg] }
        : c
      ));
      setSelected(prev => ({ ...prev, messages: [...prev.messages, newMsg], preview: text, unread: undefined }));
      addToast("Message sent via WhatsApp", "success");
    }
  };

  // Build display messages: prefer live messages if real conversation, else use mock
  const displayMessages: { from: "reva" | "patient"; text: string; time: string }[] =
    selectedRealId && liveMessages.length > 0
      ? liveMessages.map(m => ({
          from: m.direction === "outbound" ? "reva" : "patient",
          text: m.content,
          time: new Date(m.sent_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        }))
      : selected.messages;

  const filtered = convos.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-0 h-[calc(100vh-160px)] rounded-2xl overflow-hidden border border-white/[0.08]">
      {/* Convo list */}
      <div className="w-72 shrink-0 bg-white/[0.02] border-r border-white/[0.08] flex flex-col">
        <div className="p-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..." className="bg-transparent text-sm text-white placeholder-slate-600 flex-1 outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} onClick={() => { setSelected({ ...c, unread: undefined }); setSelectedRealId((c as Conversation & { _realId?: string })._realId ?? null); setLiveMessages([]); }}
              className={`flex items-center gap-3 p-3.5 cursor-pointer border-b border-white/[0.05] transition-all duration-150
                ${selected.id === c.id ? "bg-white/[0.07] border-l-2 border-l-cyan-400" : "hover:bg-white/[0.04] border-l-2 border-l-transparent"}`}>
              <div className="relative">
                <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                {c.unread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#050714]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-xs font-medium">{c.name}</p>
                  <span className="text-slate-600 text-[10px]">{c.time}</span>
                </div>
                <p className="text-slate-500 text-[11px] truncate mt-0.5">{c.preview}</p>
              </div>
              {c.unread && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {c.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-[#080c18]">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <Avatar initials={selected.initials} color={selected.avatarColor} size="md" />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">{selected.name}</p>
            <p className="text-emerald-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> online</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-slate-400 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08] text-slate-400 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={msgRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
          style={{ background: "radial-gradient(ellipse at 80% 10%, rgba(6,182,212,0.03) 0%, transparent 60%), #080c18" }}>
          {displayMessages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex ${m.from === "reva" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                ${m.from === "reva"
                  ? "bg-gradient-to-br from-cyan-600/80 to-violet-700/80 text-white rounded-br-sm"
                  : "bg-white/[0.08] text-white rounded-bl-sm border border-white/[0.06]"}`}>
                {m.text.split("\n").map((line, j) => <p key={j}>{line}</p>)}
                <p className={`text-[10px] mt-1 ${m.from === "reva" ? "text-white/50 text-right" : "text-slate-500"}`}>{m.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/[0.08] flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.08] text-slate-500 transition-colors"><Smile className="w-4 h-4" /></button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.08] text-slate-500 transition-colors"><Paperclip className="w-4 h-4" /></button>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMsg()}
            placeholder="Type a message..." className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors" />
          <button onClick={sendMsg} disabled={!input.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-white hover:opacity-90 disabled:opacity-30 transition-opacity">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Analytics View ─── */
function AnalyticsView() {
  const maxVal = Math.max(...WEEKLY_CHART.map(d => d.value));
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Revenue Recovered", value: "₹47,200", sub: "from missed calls this month", icon: ArrowUpRight, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Bookings", value: "312", sub: "this month ↑18%", icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Avg Response Time", value: "48s", sub: "Reva replies instantly", icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Patient Retention", value: "87%", sub: "returned within 3 months", icon: RefreshCcw, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className="text-slate-600 text-[11px] mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        {/* Bar chart */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm">Weekly Bookings</h3>
              <p className="text-slate-500 text-xs mt-0.5">Current week</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +23% vs last week
            </span>
          </div>
          <div className="flex items-end gap-3 h-36">
            {WEEKLY_CHART.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-slate-400 text-xs font-medium">{d.value}</span>
                <div className="w-full flex items-end" style={{ height: "96px" }}>
                  <motion.div
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500/60 to-violet-500/60"
                    initial={{ height: 0 }}
                    animate={{ height: visible ? `${(d.value / maxVal) * 96}px` : 0 }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                  />
                </div>
                <span className={`text-[11px] font-medium ${d.day === "Fri" ? "text-cyan-400" : "text-slate-500"}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top services */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Top Services</h3>
          <div className="space-y-4">
            {TOP_SERVICES.map((s, i) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-300 text-xs">{s.name}</span>
                  <span className="text-slate-400 text-xs">{s.count}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: visible ? `${s.pct}%` : 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications View ─── */
function NotificationsView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS_INIT);

  const markAll = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    addToast("All notifications marked as read", "info");
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-bold text-lg">Notifications</h2>
          <p className="text-slate-500 text-sm">{notifs.filter(n => !n.read).length} unread</p>
        </div>
        <button onClick={markAll} className="text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors">
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifs.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
            className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200
              ${n.read ? "bg-white/[0.02] border-white/[0.06] opacity-60" : "bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.06]"}`}>
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-lg shrink-0">
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{n.text}</p>
              <p className="text-slate-400 text-xs mt-0.5">{n.sub}</p>
              <p className="text-slate-600 text-[11px] mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Settings View ─── */
function SettingsView({ addToast }: { addToast: (msg: string, type: Toast["type"]) => void }) {
  const [form, setForm] = useState({
    clinicName: "Dr. Sharma's Clinic",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "dr.sharma@gmail.com",
    city: "Mumbai",
    greeting: "Hi [Name]! 👋 Welcome to Dr. Sharma's Clinic. How can I help you today?",
    openTime: "09:00",
    closeTime: "18:00",
    reminders: true,
    recalls: true,
    voiceReply: false,
  });

  const save = () => addToast("Settings saved successfully ✓", "success");

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`w-11 h-6 rounded-full border transition-all duration-200 flex items-center
      ${val ? "bg-cyan-500/30 border-cyan-500/50" : "bg-white/[0.05] border-white/[0.1]"}`}>
      <motion.div animate={{ x: val ? 22 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`w-4 h-4 rounded-full shadow ${val ? "bg-cyan-400" : "bg-slate-500"}`} />
    </button>
  );

  const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
    <div>
      <label className="block text-slate-400 text-xs mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Clinic info */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> Clinic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Clinic Name" value={form.clinicName} onChange={v => setForm(f => ({ ...f, clinicName: v }))} />
          <Field label="City" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} />
          <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <Field label="WhatsApp Number" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
          <div className="sm:col-span-2">
            <Field label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          </div>
        </div>
      </div>

      {/* Working hours */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-violet-400" /> Working Hours</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-slate-400 text-xs mb-1.5">Opens at</label>
            <input type="time" value={form.openTime} onChange={e => setForm(f => ({ ...f, openTime: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" />
          </div>
          <div className="flex-1">
            <label className="block text-slate-400 text-xs mb-1.5">Closes at</label>
            <input type="time" value={form.closeTime} onChange={e => setForm(f => ({ ...f, closeTime: e.target.value }))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" />
          </div>
        </div>
      </div>

      {/* Reva greeting */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-400" /> Reva Greeting Message</h3>
        <textarea value={form.greeting} onChange={e => setForm(f => ({ ...f, greeting: e.target.value }))} rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors resize-none" />
        <p className="text-slate-600 text-xs">Use [Name] to insert the patient&apos;s name automatically.</p>
      </div>

      {/* Toggles */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Automation Settings</h3>
        {[
          { label: "Smart Appointment Reminders", sub: "Send WhatsApp reminders 24hr and 1hr before appointments", key: "reminders" as const },
          { label: "Recall Campaigns", sub: "Auto-detect patients due for follow-ups and send recall messages", key: "recalls" as const },
          { label: "Voice Call Replies", sub: "Answer missed calls with an instant WhatsApp message (beta)", key: "voiceReply" as const },
        ].map(item => (
          <div key={item.key} className="flex items-start justify-between gap-4 py-2">
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
            </div>
            <Toggle val={form[item.key]} onToggle={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))} />
          </div>
        ))}
      </div>

      <button onClick={save}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-violet-500/20">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );
}

/* ─── Main Page ─── */
function DashboardPageInner() {
  const [activeView, setActiveView] = useState<View>("Dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { clinic } = useDashboard();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return; // skip in demo
    if (!localStorage.getItem("reva_onboarded")) setShowOnboarding(true);
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const unreadNotifs = NOTIFICATIONS_INIT.filter(n => !n.read).length;
  const clinicDisplayName = clinic?.name ?? "My Clinic";

  const addToast = (message: string, type: Toast["type"]) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const viewTitles: Record<View, { title: string; sub: string }> = {
    Dashboard:     { title: "Good morning, Dr. Sharma 👋",  sub: today },
    Calendar:      { title: "Appointment Calendar",          sub: "View and manage your schedule" },
    Messages:      { title: "WhatsApp Inbox",                sub: "All patient conversations" },
    Patients:      { title: "Patient CRM",                   sub: "Your complete patient database" },
    Queue:         { title: "Live Queue",                    sub: "Real-time patient queue management" },
    Billing:       { title: "Billing & Revenue",             sub: "Track payments and outstanding balances" },
    "Follow-Up":   { title: "Follow-Up Engine",             sub: "Automated post-visit WhatsApp sequences" },
    "No-Show":     { title: "No-Show Prediction",           sub: "AI risk scoring for today's appointments" },
    Prescriptions:  { title: "Prescription Builder",         sub: "Create and send digital prescriptions via WhatsApp" },
    "Lab Reports":  { title: "Lab Report Inbox",            sub: "Upload reports and notify patients via WhatsApp" },
    Referrals:      { title: "Referral Network",            sub: "Track sent and received specialist referrals" },
    Consent:        { title: "Digital Consent Forms",       sub: "Send, collect and archive patient consent via WhatsApp" },
    Analytics:     { title: "Analytics",                     sub: "Your clinic performance at a glance" },
    Notifications: { title: "Notifications",                 sub: `${unreadNotifs} unread notifications` },
    Settings:      { title: "Settings",                      sub: "Manage your Reva configuration" },
    Availability:  { title: "Availability & Slots",          sub: "Block time, set working hours, manage leaves" },
    Deposits:      { title: "Deposits & Payments",           sub: "Razorpay deposit links and revenue tracking" },
    Reviews:       { title: "Reviews & Reputation",          sub: "Manage patient feedback and Google reviews" },
  };

  return (
    <div className="flex h-screen bg-[#050714] text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/[0.08] bg-white/[0.015]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-white text-xs font-black">R</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Reva <span className="text-cyan-400">AI</span></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ml-auto animate-pulse" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, badge }) => {
            const active = activeView === label;
            return (
              <button key={label} onClick={() => setActiveView(label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
                  ${active
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/10 text-white border border-white/[0.08]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"}`}>
                {active && <motion.div layoutId="nav-pill" className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400 rounded-full" />}
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-cyan-400" : ""}`} />
                {label}
                {badge && !active && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center border border-cyan-500/20">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Clinic badge */}
        <div className="px-4 py-4 border-t border-white/[0.08]">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-white text-xs font-medium truncate">{clinicDisplayName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-2.5 h-2.5" /> Reva Active
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => { localStorage.removeItem("reva_onboarded"); setShowOnboarding(true); }}
                  className="text-slate-600 hover:text-cyan-400 transition-colors" title="Setup Guide">
                  <Zap className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => addToast("Logged out", "info")} className="text-slate-600 hover:text-slate-400 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.08] shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white">{viewTitles[activeView].title}</h1>
            <p className="text-slate-500 text-xs mt-0.5">{viewTitles[activeView].sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveView("Notifications")}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/[0.08]">
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 border border-[#050714]" />
              )}
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white hover:bg-white/[0.07] transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              Open WhatsApp
            </button>
            <button onClick={() => addToast("New appointment slot added", "success")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-xs text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-3.5 h-3.5" /> Add Appointment
            </button>
          </div>
        </header>

        {/* View content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              {activeView === "Dashboard"     && <DashboardView addToast={addToast} />}
              {activeView === "Calendar"      && <CalendarView />}
              {activeView === "Messages"      && <MessagesView addToast={addToast} />}
              {activeView === "Patients"      && <PatientsView addToast={addToast} />}
              {activeView === "Queue"         && <QueueView addToast={addToast} />}
              {activeView === "Billing"       && <BillingView addToast={addToast} />}
              {activeView === "Follow-Up"     && <FollowUpView addToast={addToast} />}
              {activeView === "No-Show"       && <NoShowView addToast={addToast} />}
              {activeView === "Prescriptions" && <PrescriptionView addToast={addToast} />}
              {activeView === "Lab Reports"  && <LabReportsView addToast={addToast} />}
              {activeView === "Referrals"    && <ReferralView addToast={addToast} />}
              {activeView === "Consent"      && <ConsentView addToast={addToast} />}
              {activeView === "Availability" && <AvailabilityView addToast={addToast} />}
              {activeView === "Deposits"     && <DepositsView addToast={addToast} />}
              {activeView === "Reviews"      && <ReviewsView clinicId={clinic?.id ?? ""} />}
              {activeView === "Analytics"     && <AnalyticsView />}
              {activeView === "Notifications" && <NotificationsView addToast={addToast} />}
              {activeView === "Settings"      && <SettingsView addToast={addToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ToastStack toasts={toasts} remove={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={() => { setShowOnboarding(false); addToast("Reva is live! 🚀", "success"); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardPageInner />
    </DashboardProvider>
  );
}
