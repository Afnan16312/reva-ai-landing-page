"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/utils";
import {
  TrendingUp,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Search,
  Send,
  Plus,
  Download,
  Check,
  X,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  Edit3,
  RefreshCcw,
  Receipt,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type PaymentMethod = "Cash" | "UPI" | "Card" | null;
type InvoiceStatus = "Paid" | "Pending" | "Waived";

interface Invoice {
  id: number;
  patientName: string;
  initials: string;
  avatarColor: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  daysOverdue: number;
}

interface BillingViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

// ─────────────────────────────────────────────
// INVOICE DATA
// ─────────────────────────────────────────────
const INVOICES_DATA: Invoice[] = [
  { id: 1,  patientName: "Priya Sharma",   initials: "PS", avatarColor: "from-pink-500 to-rose-500",      service: "General Checkup",        date: "Today",     time: "10:30 AM", amount: 400,  paymentMethod: "UPI",  status: "Paid",    daysOverdue: 0 },
  { id: 2,  patientName: "Rahul Gupta",    initials: "RG", avatarColor: "from-blue-500 to-cyan-500",      service: "Follow-up",              date: "Today",     time: "11:00 AM", amount: 250,  paymentMethod: null,   status: "Pending", daysOverdue: 0 },
  { id: 3,  patientName: "Ananya Nair",    initials: "AN", avatarColor: "from-violet-500 to-purple-500",  service: "Dental Cleaning",        date: "Today",     time: "11:30 AM", amount: 1500, paymentMethod: "Cash", status: "Paid",    daysOverdue: 0 },
  { id: 4,  patientName: "Vikram Patel",   initials: "VP", avatarColor: "from-emerald-500 to-teal-500",   service: "Consultation",           date: "Today",     time: "12:00 PM", amount: 500,  paymentMethod: "Card", status: "Paid",    daysOverdue: 0 },
  { id: 5,  patientName: "Sunita Rao",     initials: "SR", avatarColor: "from-amber-500 to-orange-500",   service: "Blood Pressure Check",   date: "Today",     time: "2:30 PM",  amount: 200,  paymentMethod: "UPI",  status: "Paid",    daysOverdue: 0 },
  { id: 6,  patientName: "Karan Mehta",    initials: "KM", avatarColor: "from-slate-400 to-gray-500",     service: "General Checkup",        date: "Today",     time: "3:00 PM",  amount: 400,  paymentMethod: null,   status: "Pending", daysOverdue: 0 },
  { id: 7,  patientName: "Deepa Singh",    initials: "DS", avatarColor: "from-fuchsia-500 to-pink-500",   service: "X-Ray Review",           date: "Today",     time: "3:30 PM",  amount: 800,  paymentMethod: null,   status: "Pending", daysOverdue: 0 },
  { id: 8,  patientName: "Arjun Kumar",    initials: "AK", avatarColor: "from-emerald-500 to-teal-500",   service: "Root Canal (Part 1)",    date: "Yesterday", time: "10:00 AM", amount: 4000, paymentMethod: "Card", status: "Paid",    daysOverdue: 0 },
  { id: 9,  patientName: "Meera Joshi",    initials: "MJ", avatarColor: "from-violet-500 to-purple-500",  service: "Consultation",           date: "Yesterday", time: "11:30 AM", amount: 500,  paymentMethod: "Cash", status: "Paid",    daysOverdue: 0 },
  { id: 10, patientName: "Ravi Sharma",    initials: "RS", avatarColor: "from-cyan-500 to-blue-500",      service: "General Checkup",        date: "Yesterday", time: "2:00 PM",  amount: 400,  paymentMethod: null,   status: "Pending", daysOverdue: 1 },
  { id: 11, patientName: "Sneha Kapoor",   initials: "SK", avatarColor: "from-pink-500 to-fuchsia-500",   service: "Dental Cleaning",        date: "Yesterday", time: "4:00 PM",  amount: 1500, paymentMethod: "UPI",  status: "Paid",    daysOverdue: 0 },
  { id: 12, patientName: "Mohammed Ali",   initials: "MA", avatarColor: "from-amber-500 to-yellow-500",   service: "Follow-up",              date: "Dec 22",    time: "10:30 AM", amount: 250,  paymentMethod: null,   status: "Pending", daysOverdue: 2 },
  { id: 13, patientName: "Priya Sharma",   initials: "PS", avatarColor: "from-pink-500 to-rose-500",      service: "Blood Test Review",      date: "Dec 22",    time: "3:00 PM",  amount: 300,  paymentMethod: "Cash", status: "Paid",    daysOverdue: 0 },
  { id: 14, patientName: "Vikram Patel",   initials: "VP", avatarColor: "from-emerald-500 to-teal-500",   service: "Dental Implant Consult", date: "Dec 21",    time: "11:00 AM", amount: 800,  paymentMethod: "UPI",  status: "Paid",    daysOverdue: 0 },
  { id: 15, patientName: "Sunita Rao",     initials: "SR", avatarColor: "from-amber-500 to-orange-500",   service: "Consultation",           date: "Dec 21",    time: "2:30 PM",  amount: 500,  paymentMethod: null,   status: "Pending", daysOverdue: 3 },
  { id: 16, patientName: "Rahul Gupta",    initials: "RG", avatarColor: "from-blue-500 to-cyan-500",      service: "X-Ray Review",           date: "Dec 20",    time: "10:00 AM", amount: 800,  paymentMethod: "Card", status: "Paid",    daysOverdue: 0 },
  { id: 17, patientName: "Ananya Nair",    initials: "AN", avatarColor: "from-violet-500 to-purple-500",  service: "Follow-up",              date: "Dec 20",    time: "3:00 PM",  amount: 250,  paymentMethod: null,   status: "Pending", daysOverdue: 4 },
  { id: 18, patientName: "Karan Mehta",    initials: "KM", avatarColor: "from-slate-400 to-gray-500",     service: "General Checkup",        date: "Dec 19",    time: "11:30 AM", amount: 400,  paymentMethod: "Cash", status: "Waived",  daysOverdue: 0 },
  { id: 19, patientName: "Meera Joshi",    initials: "MJ", avatarColor: "from-violet-500 to-purple-500",  service: "Dental Cleaning",        date: "Dec 19",    time: "4:00 PM",  amount: 1500, paymentMethod: "UPI",  status: "Paid",    daysOverdue: 0 },
  { id: 20, patientName: "Ravi Sharma",    initials: "RS", avatarColor: "from-cyan-500 to-blue-500",      service: "Root Canal (Part 2)",    date: "Dec 18",    time: "2:00 PM",  amount: 4000, paymentMethod: "Card", status: "Paid",    daysOverdue: 0 },
];

const SERVICE_OPTIONS = [
  "General Checkup", "Follow-up", "Consultation", "Dental Cleaning",
  "X-Ray Review", "Blood Pressure Check", "Blood Test Review",
  "Root Canal", "Dental Implant Consult", "Other",
];

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function fmtAmount(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  pulse?: boolean;
  delay: number;
}

function StatCard({ label, value, prefix = "", suffix = "", sub, color, icon, badge, badgeColor, pulse, delay }: StatCardProps) {
  const displayed = useCountUp(value);
  const formatted = prefix === "₹"
    ? "₹" + displayed.toLocaleString("en-IN") + suffix
    : prefix + displayed + suffix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors cursor-default group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center`}
          style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className={`bg-gradient-to-br ${color} bg-clip-text`} style={{ color: "transparent", display: "flex" }}>
            {icon}
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor} flex items-center gap-1`}>
          {pulse && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />}
          {badge}
        </span>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{formatted}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// PAYMENT METHOD BADGE
// ─────────────────────────────────────────────
function MethodBadge({ method }: { method: PaymentMethod }) {
  if (!method) return null;
  const styles: Record<string, string> = {
    Cash: "bg-green-500/10 text-green-400 border border-green-500/20",
    UPI:  "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    Card: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  const icons: Record<string, React.ReactNode> = {
    Cash: <Banknote size={10} />,
    UPI:  <Smartphone size={10} />,
    Card: <CreditCard size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${styles[method]}`}>
      {icons[method]}{method}
    </span>
  );
}

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status, daysOverdue }: { status: InvoiceStatus; daysOverdue: number }) {
  const styles: Record<InvoiceStatus, string> = {
    Paid:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    Waived:  "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  };
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {status === "Pending" && daysOverdue > 0 && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      )}
      {status}
    </motion.span>
  );
}

// ─────────────────────────────────────────────
// ADD INVOICE MODAL
// ─────────────────────────────────────────────
interface AddModalProps {
  onClose: () => void;
  onAdd: (inv: Invoice) => void;
  existingPatients: string[];
}

function AddInvoiceModal({ onClose, onAdd, existingPatients }: AddModalProps) {
  const [name, setName] = useState("");
  const [service, setService] = useState("General Checkup");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMethod, setPayMethod] = useState<PaymentMethod | "Pending">("Pending");
  const [notes, setNotes] = useState("");

  const avatarColors = [
    "from-pink-500 to-rose-500", "from-blue-500 to-cyan-500",
    "from-violet-500 to-purple-500", "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const newInv: Invoice = {
      id: Date.now(),
      patientName: name.trim(),
      initials,
      avatarColor: color,
      service,
      date: "Today",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      amount: parseInt(amount),
      paymentMethod: payMethod === "Pending" ? null : payMethod,
      status: payMethod === "Pending" ? "Pending" : "Paid",
      daysOverdue: 0,
    };
    onAdd(newInv);
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.06] transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,7,20,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-[#0c0e1f] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">New Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Patient Name</label>
            <input
              list="patients-list"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={inputCls}
              required
            />
            <datalist id="patients-list">
              {existingPatients.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Service</label>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className={inputCls + " cursor-pointer"}
            >
              {SERVICE_OPTIONS.map(s => <option key={s} value={s} className="bg-[#0c0e1f]">{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="500"
                  className={inputCls + " pl-7"}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputCls + " [color-scheme:dark]"}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Payment Method</label>
            <div className="flex gap-2">
              {(["Cash", "UPI", "Card", "Pending"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayMethod(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    payMethod === m
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className={inputCls + " resize-none"}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 transition-opacity mt-1"
          >
            Create Invoice
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// INVOICE ROW
// ─────────────────────────────────────────────
interface InvoiceRowProps {
  invoice: Invoice;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: number, patch: Partial<Invoice>) => void;
  addToast: BillingViewProps["addToast"];
}

function InvoiceRow({ invoice, index, isExpanded, onToggle, onUpdate, addToast }: InvoiceRowProps) {
  const [showPayPicker, setShowPayPicker] = useState(false);
  const [showWaiveConfirm, setShowWaiveConfirm] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editAmountVal, setEditAmountVal] = useState(String(invoice.amount));
  const inv = invoice;

  const markPaid = (method: PaymentMethod) => {
    onUpdate(inv.id, { status: "Paid", paymentMethod: method, daysOverdue: 0 });
    setShowPayPicker(false);
    addToast(`Payment recorded for ${inv.patientName} ✓`, "success");
  };

  const sendReminder = () => {
    const upiLink = "upi://pay?pa=drsharma@upi&am=" + inv.amount;
    addToast(
      `Reminder sent to ${inv.patientName}: "Hi ${inv.patientName.split(" ")[0]}, you have an outstanding balance of ₹${inv.amount.toLocaleString("en-IN")} from your visit at Dr. Sharma's Clinic. Pay here: ${upiLink} 🙏"`,
      "info"
    );
  };

  const waive = () => {
    onUpdate(inv.id, { status: "Waived", daysOverdue: 0 });
    setShowWaiveConfirm(false);
    addToast(`Invoice waived for ${inv.patientName}`, "warn");
  };

  const saveAmount = () => {
    const parsed = parseInt(editAmountVal);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdate(inv.id, { amount: parsed });
      addToast("Amount updated", "success");
    }
    setEditingAmount(false);
  };

  const restore = () => {
    onUpdate(inv.id, { status: "Pending", daysOverdue: 0 });
    addToast(`Invoice restored for ${inv.patientName}`, "info");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      {/* Main row */}
      <div
        onClick={onToggle}
        className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
          isExpanded
            ? "bg-white/[0.06] border-white/[0.08]"
            : "hover:bg-white/[0.04] border-transparent"
        }`}
      >
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${inv.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {inv.initials}
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{inv.patientName}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{inv.date} · {inv.time}</div>
        </div>

        {/* Service */}
        <div className="hidden sm:block flex-1 min-w-0">
          <div className="text-xs text-slate-400 truncate">{inv.service}</div>
        </div>

        {/* Amount */}
        <div className="text-sm font-semibold text-white flex-shrink-0">{fmtAmount(inv.amount)}</div>

        {/* Method badge */}
        <div className="hidden md:flex flex-shrink-0 w-16 justify-center">
          <MethodBadge method={inv.paymentMethod} />
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <AnimatePresence mode="wait">
            <StatusBadge key={inv.status} status={inv.status} daysOverdue={inv.daysOverdue} />
          </AnimatePresence>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-slate-500 flex-shrink-0"
        >
          <ChevronRight size={15} />
        </motion.div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              {inv.status === "Pending" && (
                <div className="flex flex-wrap gap-2">
                  {/* Mark as Paid */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPayPicker(v => !v)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check size={12} />
                      Mark as Paid
                      <ChevronRight size={10} className={`transition-transform ${showPayPicker ? "rotate-90" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showPayPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          className="absolute top-8 left-0 z-10 flex gap-1.5 p-2 rounded-xl bg-[#0c0e1f] border border-white/[0.1] shadow-xl"
                        >
                          {(["Cash", "UPI", "Card"] as PaymentMethod[]).map(m => (
                            <button
                              key={m}
                              onClick={() => markPaid(m)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white transition-colors border border-white/[0.06]"
                            >
                              {m === "Cash" && <Banknote size={11} />}
                              {m === "UPI" && <Smartphone size={11} />}
                              {m === "Card" && <CreditCard size={11} />}
                              {m}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Send reminder */}
                  <button
                    onClick={sendReminder}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                  >
                    <Smartphone size={12} />
                    Send WhatsApp
                  </button>

                  {/* Waive */}
                  <div className="relative">
                    <button
                      onClick={() => setShowWaiveConfirm(v => !v)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition-colors"
                    >
                      <X size={12} />
                      Waive
                    </button>
                    <AnimatePresence>
                      {showWaiveConfirm && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          className="absolute top-8 left-0 z-10 flex items-center gap-2 p-2 rounded-xl bg-[#0c0e1f] border border-white/[0.1] shadow-xl whitespace-nowrap"
                        >
                          <span className="text-xs text-slate-300">Are you sure?</span>
                          <button onClick={waive} className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20">Yes, waive</button>
                          <button onClick={() => setShowWaiveConfirm(false)} className="text-xs px-2 py-1 rounded-lg bg-white/[0.05] text-slate-400 hover:bg-white/[0.1]">Cancel</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Edit amount */}
                  <div className="flex items-center gap-2">
                    {editingAmount ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          value={editAmountVal}
                          onChange={e => setEditAmountVal(e.target.value)}
                          className="w-20 bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                          autoFocus
                          onKeyDown={e => e.key === "Enter" && saveAmount()}
                        />
                        <button onClick={saveAmount} className="text-xs px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><Check size={10} /></button>
                        <button onClick={() => setEditingAmount(false)} className="text-xs px-2 py-1 rounded-lg bg-white/[0.05] text-slate-400 hover:bg-white/[0.1]"><X size={10} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditAmountVal(String(inv.amount)); setEditingAmount(true); }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                      >
                        <Edit3 size={12} />
                        Edit Amount
                      </button>
                    )}
                  </div>
                </div>
              )}

              {inv.status === "Paid" && (
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Check size={12} className="text-emerald-400" />
                    Paid on {inv.date} at {inv.time}
                  </div>
                  {inv.paymentMethod && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      via <MethodBadge method={inv.paymentMethod} />
                    </div>
                  )}
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
                    <Receipt size={12} />
                    Print Receipt
                  </button>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/8 text-red-400/70 border border-red-500/10 hover:bg-red-500/15 transition-colors">
                    <RefreshCcw size={12} />
                    Refund
                  </button>
                </div>
              )}

              {inv.status === "Waived" && (
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <X size={12} className="text-slate-400" />
                    Waived on {inv.date}
                  </div>
                  <div className="text-xs text-slate-500">Reason: Patient hardship</div>
                  <button
                    onClick={restore}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    <RefreshCcw size={12} />
                    Restore
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="mx-3 border-b border-white/[0.04]" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// OUTSTANDING SIDEBAR
// ─────────────────────────────────────────────
function OutstandingSidebar({ invoices, onRemind, onRemindAll }: {
  invoices: Invoice[];
  onRemind: (inv: Invoice) => void;
  onRemindAll: () => void;
}) {
  const pending = invoices.filter(i => i.status === "Pending");
  const total = pending.reduce((s, i) => s + i.amount, 0);

  // Payment breakdown
  const paid = invoices.filter(i => i.status === "Paid");
  const byMethod = {
    Cash: paid.filter(i => i.paymentMethod === "Cash").reduce((s, i) => s + i.amount, 0),
    UPI:  paid.filter(i => i.paymentMethod === "UPI").reduce((s, i) => s + i.amount, 0),
    Card: paid.filter(i => i.paymentMethod === "Card").reduce((s, i) => s + i.amount, 0),
  };
  const totalPaid = byMethod.Cash + byMethod.UPI + byMethod.Card || 1;
  const pct = {
    Cash: Math.round((byMethod.Cash / totalPaid) * 100),
    UPI:  Math.round((byMethod.UPI  / totalPaid) * 100),
    Card: Math.round((byMethod.Card / totalPaid) * 100),
  };

  return (
    <div className="w-64 flex-shrink-0 hidden lg:block">
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 sticky top-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">Outstanding</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-amber-400 mb-4">{fmtAmount(total)}</div>

        {/* Pending list */}
        <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
          {pending.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-4">No outstanding invoices</div>
          )}
          {pending.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${inv.avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                {inv.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{inv.patientName.split(" ")[0]}</div>
                <div className="text-amber-400 text-[11px] font-semibold">{fmtAmount(inv.amount)}</div>
              </div>
              {inv.daysOverdue > 0 && (
                <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {inv.daysOverdue}d
                </span>
              )}
              <button
                onClick={() => onRemind(inv)}
                className="text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Send reminder"
              >
                <Send size={12} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Send All */}
        {pending.length > 0 && (
          <button
            onClick={onRemindAll}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity mb-4"
          >
            Send All Reminders →
          </button>
        )}

        {/* Payment breakdown */}
        <div>
          <div className="text-[11px] text-slate-500 mb-3 font-medium uppercase tracking-wide">Payment Breakdown</div>
          <div className="space-y-2.5">
            {(["Cash", "UPI", "Card"] as const).map((m, i) => {
              const colors = { Cash: "bg-emerald-500", UPI: "bg-violet-500", Card: "bg-blue-500" };
              const labels = { Cash: "text-emerald-400", UPI: "text-violet-400", Card: "text-blue-400" };
              return (
                <div key={m}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-medium ${labels[m]}`}>{m}</span>
                    <span className="text-[11px] text-slate-400">{pct[m]}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct[m]}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${colors[m]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function BillingView({ addToast }: BillingViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES_DATA);
  const [filter, setFilter] = useState<"All" | InvoiceStatus>("All");
  const [dateFilter, setDateFilter] = useState<"Today" | "Yesterday" | "This Week" | "This Month">("This Week");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [remindShaking, setRemindShaking] = useState(false);

  // ── COMPUTED STATS ──
  const todayRevenue = invoices
    .filter(i => i.status === "Paid" && i.date === "Today")
    .reduce((s, i) => s + i.amount, 0);

  const pendingInvoices = invoices.filter(i => i.status === "Pending");
  const pendingAmount = pendingInvoices.reduce((s, i) => s + i.amount, 0);

  const paidCount = invoices.filter(i => i.status === "Paid").length;
  const pendingCount = invoices.filter(i => i.status === "Pending").length;
  const collectionRate = Math.round((paidCount / (paidCount + pendingCount)) * 100);

  // ── FILTER + SEARCH ──
  const DATE_MAP: Record<string, string[]> = {
    "Today":      ["Today"],
    "Yesterday":  ["Yesterday"],
    "This Week":  ["Today", "Yesterday", "Dec 22", "Dec 21", "Dec 20", "Dec 19", "Dec 18"],
    "This Month": ["Today", "Yesterday", "Dec 22", "Dec 21", "Dec 20", "Dec 19", "Dec 18"],
  };

  const filtered = invoices.filter(inv => {
    const matchStatus = filter === "All" || inv.status === filter;
    const matchDate   = DATE_MAP[dateFilter]?.includes(inv.date) ?? true;
    const matchSearch = !search ||
      inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDate && matchSearch;
  });

  // ── UPDATE HANDLER ──
  const updateInvoice = useCallback((id: number, patch: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...patch } : inv));
  }, []);

  // ── ADD INVOICE ──
  const addInvoice = (inv: Invoice) => {
    setInvoices(prev => [inv, ...prev]);
    setShowAddModal(false);
    addToast("Invoice created ✓", "success");
  };

  // ── SEND ALL REMINDERS ──
  const sendAllReminders = () => {
    const n = pendingInvoices.length;
    if (n === 0) return;
    setRemindShaking(true);
    setTimeout(() => setRemindShaking(false), 600);
    addToast(`Reminders sent to ${n} patients via WhatsApp 📱`, "success");
  };

  // ── SINGLE REMIND ──
  const remindOne = (inv: Invoice) => {
    addToast(`Reminder sent to ${inv.patientName} for ₹${inv.amount.toLocaleString("en-IN")} 📱`, "info");
  };

  const existingPatients = [...new Set(invoices.map(i => i.patientName))];

  const filterPills = ["All", "Paid", "Pending", "Waived"] as const;
  const datePills = ["Today", "Yesterday", "This Week", "This Month"] as const;

  return (
    <div className="flex flex-col gap-6 min-h-full">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={todayRevenue}
          prefix="₹"
          sub="collected today"
          color="from-emerald-400 to-teal-500"
          icon={<TrendingUp size={18} />}
          badge="+14% vs yesterday"
          badgeColor="bg-emerald-500/10 text-emerald-400"
          delay={0}
        />
        <StatCard
          label="Pending Amount"
          value={pendingAmount}
          prefix="₹"
          sub={`from ${pendingCount} patients`}
          color="from-amber-400 to-orange-500"
          icon={<AlertCircle size={18} />}
          badge="Needs attention"
          badgeColor="bg-amber-500/10 text-amber-400"
          pulse
          delay={0.06}
        />
        <StatCard
          label="Collection Rate"
          value={collectionRate}
          suffix="%"
          sub="this week"
          color="from-cyan-400 to-sky-500"
          icon={<Activity size={18} />}
          badge="This week"
          badgeColor="bg-cyan-500/10 text-cyan-400"
          delay={0.12}
        />
        <StatCard
          label="Monthly Revenue"
          value={234800}
          prefix="₹"
          sub="this month"
          color="from-violet-400 to-purple-500"
          icon={<ArrowUpRight size={18} />}
          badge="+18% vs last"
          badgeColor="bg-violet-500/10 text-violet-400"
          delay={0.18}
        />
      </div>

      {/* ── FILTERS + ACTIONS ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Status pills */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {filterPills.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-white/[0.1] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Date pills */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {datePills.map(d => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  dateFilter === d
                    ? "bg-white/[0.1] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient or service..."
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 transition-all w-52"
            />
          </div>

          {/* Send All Reminders */}
          {pendingInvoices.length > 0 && (
            <motion.button
              onClick={sendAllReminders}
              whileTap={{ scale: 0.95 }}
              animate={remindShaking ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <Send size={12} />
              Send All Reminders ({pendingInvoices.length})
            </motion.button>
          )}

          {/* Add Invoice */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={13} />
            Add Invoice
          </motion.button>

          {/* Export CSV */}
          <button
            onClick={() => addToast("Exported to CSV", "info")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex gap-4 flex-1">

        {/* Invoice list */}
        <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
          {/* List header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Invoices</span>
            <span className="text-xs text-slate-500">{filtered.length} records</span>
          </div>

          {/* Column headers */}
          <div className="px-3.5 py-2 flex items-center gap-3 border-b border-white/[0.04]">
            <div className="w-9 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-[10px] font-medium text-slate-500 uppercase tracking-wide">Patient</div>
            <div className="hidden sm:block flex-1 min-w-0 text-[10px] font-medium text-slate-500 uppercase tracking-wide">Service</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide flex-shrink-0">Amount</div>
            <div className="hidden md:block w-16 text-[10px] font-medium text-slate-500 uppercase tracking-wide text-center flex-shrink-0">Method</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide flex-shrink-0">Status</div>
            <div className="w-4 flex-shrink-0" />
          </div>

          {/* Rows */}
          <div className="divide-y-0">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm">No invoices match your filters</div>
            )}
            {filtered.map((inv, i) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                index={i}
                isExpanded={expandedId === inv.id}
                onToggle={() => setExpandedId(prev => prev === inv.id ? null : inv.id)}
                onUpdate={updateInvoice}
                addToast={addToast}
              />
            ))}
          </div>
        </div>

        {/* Outstanding sidebar */}
        <OutstandingSidebar
          invoices={invoices}
          onRemind={remindOne}
          onRemindAll={sendAllReminders}
        />
      </div>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddInvoiceModal
            onClose={() => setShowAddModal(false)}
            onAdd={addInvoice}
            existingPatients={existingPatients}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
