"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useCountUp } from "@/lib/utils";
import {
  CreditCard, TrendingUp, TrendingDown, Check, X,
  ChevronDown, ChevronUp, Send, Copy, ExternalLink,
  RefreshCcw, Plus, Zap, AlertCircle, Clock, Search,
  IndianRupee, Smartphone, ToggleLeft, ArrowUpRight
} from "lucide-react";

interface DepositsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" as const },
  }),
};

type TxStatus = "Paid" | "Pending" | "Refunded" | "Waived";
interface Transaction {
  id: number; patient: string; initials: string; color: string;
  appointment: string; deposit: number; status: TxStatus;
  paid_at: string; method: string;
}

const TRANSACTIONS: Transaction[] = [
  { id:1,  patient:"Priya Sharma",  initials:"PS", color:"from-pink-500 to-rose-500",      appointment:"Apr 24 10:30 AM", deposit:200, status:"Paid",     paid_at:"9:14 AM",       method:"UPI" },
  { id:2,  patient:"Rahul Gupta",   initials:"RG", color:"from-blue-500 to-cyan-500",      appointment:"Apr 24 11:00 AM", deposit:200, status:"Pending",  paid_at:"—",             method:"—" },
  { id:3,  patient:"Ananya Nair",   initials:"AN", color:"from-violet-500 to-purple-500",  appointment:"Apr 24 11:30 AM", deposit:150, status:"Paid",     paid_at:"8:52 AM",       method:"Card" },
  { id:4,  patient:"Vikram Patel",  initials:"VP", color:"from-emerald-500 to-teal-500",   appointment:"Apr 24 12:00 PM", deposit:300, status:"Paid",     paid_at:"Yesterday",     method:"UPI" },
  { id:5,  patient:"Sunita Rao",    initials:"SR", color:"from-amber-500 to-orange-500",   appointment:"Apr 24 2:30 PM",  deposit:200, status:"Pending",  paid_at:"—",             method:"—" },
  { id:6,  patient:"Karan Mehta",   initials:"KM", color:"from-slate-400 to-gray-500",     appointment:"Apr 24 3:00 PM",  deposit:200, status:"Waived",   paid_at:"—",             method:"—" },
  { id:7,  patient:"Deepa Singh",   initials:"DS", color:"from-fuchsia-500 to-pink-500",   appointment:"Apr 24 3:30 PM",  deposit:150, status:"Paid",     paid_at:"10:05 AM",      method:"Net Banking" },
  { id:8,  patient:"Meera Joshi",   initials:"MJ", color:"from-violet-500 to-purple-500",  appointment:"Apr 23 9:00 AM",  deposit:250, status:"Paid",     paid_at:"Apr 23 8:30AM", method:"Card" },
  { id:9,  patient:"Arjun Kumar",   initials:"AK", color:"from-emerald-500 to-teal-500",   appointment:"Apr 23 11:00 AM", deposit:200, status:"Refunded", paid_at:"Apr 23 12:00",  method:"UPI" },
  { id:10, patient:"Raj Verma",     initials:"RV", color:"from-cyan-500 to-blue-500",      appointment:"Apr 23 2:00 PM",  deposit:300, status:"Paid",     paid_at:"Apr 23 1:45PM", method:"UPI" },
  { id:11, patient:"Kavya Reddy",   initials:"KR", color:"from-rose-500 to-pink-500",      appointment:"Apr 22 10:00 AM", deposit:200, status:"Paid",     paid_at:"Apr 22 9:22AM", method:"Card" },
  { id:12, patient:"Mohan Das",     initials:"MD", color:"from-amber-500 to-orange-500",   appointment:"Apr 22 11:30 AM", deposit:150, status:"Pending",  paid_at:"—",             method:"—" },
  { id:13, patient:"Nalini Menon",  initials:"NM", color:"from-teal-500 to-emerald-500",   appointment:"Apr 22 3:00 PM",  deposit:200, status:"Paid",     paid_at:"Apr 22 2:44PM", method:"UPI" },
  { id:14, patient:"Arun Joshi",    initials:"AJ", color:"from-indigo-500 to-blue-500",    appointment:"Apr 21 9:30 AM",  deposit:300, status:"Paid",     paid_at:"Apr 21 9:00AM", method:"Card" },
  { id:15, patient:"Rekha Singh",   initials:"RS", color:"from-pink-500 to-fuchsia-500",   appointment:"Apr 21 11:00 AM", deposit:200, status:"Paid",     paid_at:"Apr 21 10:30",  method:"UPI" },
  { id:16, patient:"Suresh Babu",   initials:"SB", color:"from-slate-400 to-slate-500",    appointment:"Apr 20 10:00 AM", deposit:150, status:"Refunded", paid_at:"Apr 20 11:00",  method:"Card" },
  { id:17, patient:"Divya Nair",    initials:"DN", color:"from-violet-500 to-indigo-500",  appointment:"Apr 20 2:00 PM",  deposit:200, status:"Paid",     paid_at:"Apr 20 1:30PM", method:"UPI" },
  { id:18, patient:"Priya Sharma",  initials:"PS", color:"from-pink-500 to-rose-500",      appointment:"Apr 19 10:30 AM", deposit:200, status:"Paid",     paid_at:"Apr 19 9:50AM", method:"UPI" },
  { id:19, patient:"Rahul Gupta",   initials:"RG", color:"from-blue-500 to-cyan-500",      appointment:"Apr 18 11:00 AM", deposit:300, status:"Paid",     paid_at:"Apr 18 10:30",  method:"Card" },
  { id:20, patient:"Ananya Nair",   initials:"AN", color:"from-violet-500 to-purple-500",  appointment:"Apr 17 3:00 PM",  deposit:150, status:"Waived",   paid_at:"—",             method:"—" },
];

const METHOD_COLORS: Record<string, string> = {
  "UPI": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Card": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Net Banking": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "—": "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const STATUS_COLORS: Record<TxStatus, string> = {
  Paid:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Refunded: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Waived:   "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const AMOUNT_OPTIONS = [100, 150, 200, 250, 300];

export default function DepositsView({ addToast }: DepositsViewProps) {
  const [txns, setTxns] = useState(TRANSACTIONS);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [depositsActive, setDepositsActive] = useState(true);

  // Send form
  const [formPatient, setFormPatient] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formAmount, setFormAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  // Settings
  const [defaultAmt, setDefaultAmt] = useState(200);
  const [requireAll, setRequireAll] = useState(true);
  const [waiveReturning, setWaiveReturning] = useState(true);
  const [autoRefund, setAutoRefund] = useState(true);
  const [expiry, setExpiry] = useState("2hr");

  const totalCollected = txns.filter(t => t.status === "Paid").reduce((s, t) => s + t.deposit, 0);
  const totalRefunded = txns.filter(t => t.status === "Refunded").reduce((s, t) => s + t.deposit, 0);
  const collected = useCountUp(totalCollected, 1200) as number;
  const netVal = useCountUp(totalCollected - totalRefunded, 1300) as number;

  const filtered = txns.filter(t => {
    const matchSearch = t.patient.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function sendLink() {
    if (!formPatient) { addToast("Enter a patient name", "warn"); return; }
    const amt = useCustom ? parseInt(customAmount) || 200 : formAmount;
    const newTx: Transaction = {
      id: Date.now(), patient: formPatient,
      initials: formPatient.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      color: "from-cyan-500 to-violet-600",
      appointment: formDate && formTime ? `${formDate} ${formTime}` : "Upcoming",
      deposit: amt, status: "Pending", paid_at: "—", method: "—",
    };
    setTxns(prev => [newTx, ...prev]);
    addToast(`Deposit link sent to ${formPatient} via WhatsApp 💸`, "success");
    setFormPatient(""); setFormDate(""); setFormTime("");
  }

  // Spring toggle
  function Toggle({ val, onToggle }: { val: boolean; onToggle: () => void }) {
    return (
      <button onClick={onToggle}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 flex items-center ${val ? "bg-emerald-500" : "bg-white/10"}`}
        style={{ height: "22px", width: "40px" }}>
        <motion.div
          animate={{ x: val ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="w-4 h-4 rounded-full bg-white shadow-md"
        />
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        whileHover={{ backgroundPosition: "100% center" }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-6"
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(139,92,246,0.04) 50%, rgba(6,182,212,0.02) 100%)",
          borderLeft: "4px solid transparent",
          borderImage: "linear-gradient(to bottom, #06B6D4, #8B5CF6) 1",
        }}>
        {/* Shimmer */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" as const }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
        />
        <div className="flex items-center gap-8">
          {/* Big number */}
          <div>
            <p className="text-slate-400 text-xs mb-1">Deposits Collected This Month</p>
            <p className="text-4xl font-black text-white">₹{collected.toLocaleString("en-IN")}</p>
            <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% vs last month
            </p>
          </div>
          {/* Mini stats */}
          <div className="flex gap-6 flex-1">
            {[
              { label: "Confirmation Rate", value: "94%", icon: Check, color: "text-emerald-400" },
              { label: "No-Shows Prevented", value: "23", icon: TrendingDown, color: "text-rose-400" },
              { label: "Avg Deposit", value: "₹218", icon: IndianRupee, color: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className={`w-3 h-3 ${s.color}`} />
                  <span className="text-slate-400 text-[10px]">{s.label}</span>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Razorpay badge + toggle */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium"
              style={{ borderColor: "#3395FF33", color: "#3395FF", backgroundColor: "rgba(51,149,255,0.08)" }}>
              <div className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[8px] font-black"
                style={{ background: "#3395FF" }}>R</div>
              Powered by Razorpay
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Deposits Active</span>
              <Toggle val={depositsActive} onToggle={() => {
                setDepositsActive(p => !p);
                addToast(depositsActive ? "Deposits paused" : "Deposits activated", depositsActive ? "warn" : "success");
              }} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-6 items-start">
        {/* LEFT — transactions */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search patient..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/40" />
            </div>
            <div className="flex gap-1">
              {["All","Paid","Pending","Refunded","Waived"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === s ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"}`}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => addToast("Exported to CSV", "info")}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.04] transition-all">
              Export
            </button>
          </div>

          {/* Transaction list */}
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((tx, i) => (
                <motion.div key={tx.id} custom={i} variants={itemVariants} initial="hidden" animate="visible"
                  layout className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
                  <div className="group relative">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${tx.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                        {tx.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{tx.patient}</p>
                        <p className="text-slate-500 text-xs">{tx.appointment}</p>
                      </div>
                      <p className="text-white font-bold text-sm mr-2">₹{tx.deposit}</p>
                      {tx.method !== "—" && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${METHOD_COLORS[tx.method]}`}>
                          {tx.method}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${STATUS_COLORS[tx.status]}`}>
                        {tx.status === "Pending" && (
                          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        )}
                        {tx.status}
                      </span>
                      {expandedId === tx.id
                        ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    </button>

                    {/* Hover actions */}
                    <motion.div
                      initial={{ opacity: 0, x: 12 }} whileHover={{ opacity: 1, x: 0 }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5">
                      {tx.status === "Pending" && (
                        <>
                          <button onClick={() => { setTxns(p => p.map(t => t.id === tx.id ? {...t, status: "Paid" as TxStatus, paid_at: "Just now", method: "UPI"} : t)); addToast(`Reminder sent to ${tx.patient}`, "info"); }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                            Resend Link
                          </button>
                          <button onClick={() => { setTxns(p => p.map(t => t.id === tx.id ? {...t, status: "Waived" as TxStatus} : t)); addToast("Deposit waived", "warn"); }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                            Waive
                          </button>
                        </>
                      )}
                      {tx.status === "Paid" && (
                        <>
                          <button onClick={() => { setTxns(p => p.map(t => t.id === tx.id ? {...t, status: "Refunded" as TxStatus} : t)); addToast(`Refund initiated for ${tx.patient}`, "warn"); }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                            Refund
                          </button>
                          <button onClick={() => addToast("Receipt opened", "info")}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
                            Receipt
                          </button>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {expandedId === tx.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" as const }}
                        className="overflow-hidden border-t border-white/[0.06]">
                        <div className="px-4 py-4 space-y-3">
                          {/* Payment link */}
                          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
                            <span className="text-slate-400 text-xs flex-1 font-mono truncate">
                              https://rzp.io/l/reva-{tx.id}abc
                            </span>
                            <button onClick={() => addToast("Link copied!", "success")}
                              className="text-slate-500 hover:text-cyan-400 transition-colors">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Timeline */}
                          <div className="space-y-2">
                            {(tx.status === "Paid"
                              ? [`Link sent`, `Opened by patient`, `Payment of ₹${tx.deposit} received ✓`]
                              : [`Link sent`, `Opened by patient`, `Awaiting payment...`]
                            ).map((step, si) => (
                              <motion.div key={step}
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: si * 0.15, duration: 0.3 }}
                                className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${si === 2 && tx.status !== "Paid" ? "bg-amber-400 animate-pulse" : si === 2 ? "bg-emerald-400" : "bg-cyan-400"}`} />
                                <p className={`text-xs ${si === 2 && tx.status !== "Paid" ? "text-amber-400" : "text-slate-400"}`}>{step}</p>
                                {si < 2 && <div className="h-px flex-1 bg-white/[0.06]" />}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[360px] shrink-0 space-y-4">
          {/* Send deposit link */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" /> Send Deposit Link
            </p>
            <input value={formPatient} onChange={e => setFormPatient(e.target.value)}
              placeholder="Patient name..." list="dep-patients"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/40" />
            <datalist id="dep-patients">
              {TRANSACTIONS.map(t => <option key={t.id} value={t.patient} />)}
            </datalist>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500/40" />
              <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500/40" />
            </div>
            {/* Amount */}
            <div>
              <p className="text-slate-400 text-[10px] mb-1.5">Deposit Amount</p>
              <LayoutGroup>
                <div className="flex gap-1.5 flex-wrap">
                  {AMOUNT_OPTIONS.map(a => (
                    <button key={a} onClick={() => { setFormAmount(a); setUseCustom(false); }}
                      className={`relative px-2.5 py-1 rounded-lg text-xs border transition-all ${!useCustom && formAmount === a ? "text-white border-cyan-500/40" : "text-slate-400 border-white/[0.08] hover:text-white"}`}>
                      {!useCustom && formAmount === a && (
                        <motion.div layoutId="amt-pill" className="absolute inset-0 rounded-lg bg-cyan-500/20" />
                      )}
                      <span className="relative">₹{a}</span>
                    </button>
                  ))}
                  <button onClick={() => setUseCustom(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${useCustom ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "text-slate-400 border-white/[0.08]"}`}>
                    Custom
                  </button>
                </div>
              </LayoutGroup>
              <AnimatePresence>
                {useCustom && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                      <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-6 pr-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500/40" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Preview */}
            <div className="bg-[#0d1117] border border-white/[0.06] rounded-xl p-3">
              <p className="text-slate-500 text-[10px] mb-1">WhatsApp Preview</p>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Hi {formPatient || "[patient]"}! 👋 To confirm your appointment at Dr. Sharma&apos;s Clinic{formDate ? ` on ${formDate}` : ""}{formTime ? ` at ${formTime}` : ""}, please pay the booking deposit of ₹{useCustom ? customAmount || "—" : formAmount}. 💳 Pay here: rzp.io/l/reva-abc
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={sendLink}
              className="w-full py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3395FF, #06B6D4)" }}>
              <Send className="w-3.5 h-3.5" /> Send via WhatsApp
            </motion.button>
          </div>

          {/* Settings */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <p className="text-white text-sm font-semibold">Deposit Settings</p>
            {[
              { label: "Require for all bookings", val: requireAll, set: setRequireAll },
              { label: "Waive for returning patients", val: waiveReturning, set: setWaiveReturning },
              { label: "Auto-refund on clinic cancel", val: autoRefund, set: setAutoRefund },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">{s.label}</span>
                <Toggle val={s.val} onToggle={() => s.set(p => !p)} />
              </div>
            ))}
            <div>
              <p className="text-slate-400 text-[10px] mb-1.5">Link Expires In</p>
              <div className="flex gap-1.5">
                {["1hr","2hr","6hr","24hr"].map(e => (
                  <button key={e} onClick={() => setExpiry(e)}
                    className={`flex-1 py-1 rounded-lg text-xs border transition-all ${expiry === e ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/[0.03] text-slate-400 border-white/[0.08]"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => addToast("Settings saved ✓", "success")}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-medium">
              Save Settings
            </button>
          </div>

          {/* Revenue breakdown */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <p className="text-white text-sm font-semibold">Revenue Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Total Collected</span>
                <span className="text-white font-bold">₹{totalCollected.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Refunded</span>
                <span className="text-rose-400 font-medium text-sm">−₹{totalRefunded.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium">Net Deposits</span>
                <span className="text-emerald-400 font-bold text-lg">₹{netVal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-16 mt-2">
              {[8200,6400,9100,7800,11500].map((v, i) => (
                <motion.div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-500/60"
                  initial={{ height: 0 }} animate={{ height: `${(v/11500)*100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" as const }} />
              ))}
            </div>
            <div className="flex justify-between text-slate-600 text-[9px]">
              {["Mon","Tue","Wed","Thu","Fri"].map(d => <span key={d}>{d}</span>)}
            </div>
            <button onClick={() => addToast("Opening Razorpay dashboard...", "info")}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/[0.08] text-xs transition-all hover:bg-white/[0.04]"
              style={{ color: "#3395FF" }}>
              <ExternalLink className="w-3 h-3" /> Razorpay Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
