"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  QrCode,
  Users,
  Clock,
  Send,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Bell,
  Wifi,
  Pause,
  Play,
  AlertTriangle,
  TrendingDown,
  BarChart2,
  Copy,
  Printer,
  MessageCircle,
} from "lucide-react";

interface QueueViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Patient {
  id: string;
  name: string;
  initials: string;
  waitMins: number;
  type: string;
}

const INITIAL_QUEUE: Patient[] = [
  { id: "1", name: "Priya Sharma", initials: "PS", waitMins: 12, type: "General" },
  { id: "2", name: "Rahul Gupta", initials: "RG", waitMins: 20, type: "Follow-up" },
  { id: "3", name: "Ananya Nair", initials: "AN", waitMins: 28, type: "Consultation" },
  { id: "4", name: "Vikram Mehta", initials: "VM", waitMins: 35, type: "General" },
  { id: "5", name: "Sneha Patel", initials: "SP", waitMins: 42, type: "Follow-up" },
];

const NO_SHOW_RISKS = [
  {
    name: "Arun Krishnan",
    risk: 78,
    reasons: ["Booked 3 weeks ago", "Cancelled before", "Monday 9AM slot"],
  },
  {
    name: "Meera Joshi",
    risk: 63,
    reasons: ["No-show history", "Long gap since last visit"],
  },
];

function Avatar({ initials, isNext }: { initials: string; isNext?: boolean }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        isNext
          ? "bg-gradient-to-br from-cyan-500 to-violet-600 text-white"
          : "bg-white/[0.08] text-slate-300"
      }`}
    >
      {initials}
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? "bg-cyan-500" : "bg-white/[0.1]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
            value ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function QueueView({ addToast }: QueueViewProps) {
  const [queue, setQueue] = useState<Patient[]>(INITIAL_QUEUE);
  const [paused, setPaused] = useState(false);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [notifyAhead, setNotifyAhead] = useState(true);
  const [notifyLate, setNotifyLate] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState("General");
  const [showAddForm, setShowAddForm] = useState(false);

  const callNext = () => {
    if (!queue.length) return;
    const next = queue[0];
    setCallingId(next.id);
    addToast(`Calling ${next.name}… WhatsApp sent ✓`, "success");
    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setCallingId(null);
    }, 1800);
  };

  const removePatient = (id: string) => {
    setQueue((prev) => prev.filter((p) => p.id !== id));
    addToast("Patient removed from queue", "warn");
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setQueue((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const addPatient = () => {
    if (!addName.trim()) return;
    const initials = addName
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
    const newPat: Patient = {
      id: Date.now().toString(),
      name: addName.trim(),
      initials,
      waitMins: (queue.length + 1) * 7 + 5,
      type: addType,
    };
    setQueue((prev) => [...prev, newPat]);
    setAddName("");
    setShowAddForm(false);
    addToast(`${addName.trim()} added to queue`, "success");
  };

  const copyLink = () => {
    navigator.clipboard?.writeText("reva.ai/queue/dr-sharma").catch(() => {});
    addToast("Queue link copied!", "info");
  };

  const sendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    addToast("Update sent to all waiting patients", "success");
    setBroadcastMsg("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6">
      {/* ══════════════════ LEFT — Live Queue ══════════════════ */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">Live Queue</h2>
          </div>
          <span className="bg-white/[0.07] text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            {queue.length} patients
          </span>
          <span className="bg-white/[0.07] text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Avg wait: 18 mins
          </span>
        </div>

        {/* Action bar */}
        <div className="flex gap-3">
          <motion.button
            onClick={callNext}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            disabled={!queue.length || !!callingId}
            className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
          >
            {callingId ? "Calling…" : "Call Next Patient"}
          </motion.button>

          <motion.button
            onClick={() => {
              setPaused((v) => !v);
              addToast(paused ? "Queue resumed" : "Queue paused", paused ? "success" : "warn");
            }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 border transition-all ${
              paused
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-white/[0.05] border-white/[0.08] text-slate-400 hover:text-white"
            }`}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? "Resume" : "Pause"}
          </motion.button>
        </div>

        {/* Queue list */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {queue.map((patient, idx) => {
              const isNext = idx === 0;
              return (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  whileHover={{ scale: 1.005 }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                    isNext
                      ? "border-cyan-500/30 bg-cyan-500/[0.06] shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                      : callingId === patient.id
                      ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                      : "border-white/[0.06] bg-white/[0.025]"
                  }`}
                >
                  {/* Position */}
                  <div className="flex flex-col items-center w-8 flex-shrink-0">
                    <span className="text-slate-500 text-xs font-mono">#{idx + 1}</span>
                    {isNext && (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded mt-0.5">
                        NEXT
                      </span>
                    )}
                  </div>

                  <Avatar initials={patient.initials} isNext={isNext} />

                  {/* Name + type */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.type}</p>
                  </div>

                  {/* Wait */}
                  <div className="flex items-center gap-1 text-slate-400 text-xs flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {patient.waitMins}m
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isNext ? (
                      <motion.button
                        onClick={callNext}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => moveUp(idx)}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => removePatient(patient.id)}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 rounded-lg bg-white/[0.05] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!queue.length && (
            <div className="text-center py-10 text-slate-600 text-sm">Queue is empty</div>
          )}
        </div>

        {/* Add to queue */}
        <div>
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 flex gap-2 overflow-hidden"
              >
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPatient()}
                  placeholder="Patient name"
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
                />
                <select
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                  className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none"
                >
                  <option value="General">General</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Emergency">Emergency</option>
                </select>
                <button
                  onClick={addPatient}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-sm font-medium hover:bg-cyan-500/25 transition-colors"
                >
                  Add
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="w-full py-3 rounded-xl border border-dashed border-white/[0.1] text-slate-500 text-sm hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add to Queue"}
          </button>
        </div>
      </div>

      {/* ══════════════════ RIGHT — Intelligence ══════════════════ */}
      <div className="space-y-4">
        {/* No-Show Risk */}
        <GlassCard className="border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">No-Show Risk</h3>
          </div>
          <div className="space-y-4">
            {NO_SHOW_RISKS.map((p) => (
              <div key={p.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{p.name}</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {p.risk}% risk
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.reasons.map((r) => (
                    <span
                      key={r}
                      className="text-[11px] text-slate-400 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToast(`Confirmation sent to ${p.name}`, "info")}
                  className="text-xs text-amber-400 border border-amber-400/30 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors w-full"
                >
                  Send Confirmation Request
                </motion.button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Analytics */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Queue Analytics</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Avg Wait Today</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-white">18m</span>
                <span className="text-xs text-emerald-400 flex items-center gap-0.5 mb-0.5">
                  <TrendingDown className="w-3 h-3" />
                  vs 24m
                </span>
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Patients Seen</p>
              <span className="text-xl font-bold text-white">12</span>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Estimated Walk-outs</p>
              <span className="text-xl font-bold text-amber-400">1</span>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Peak Hour</p>
              <span className="text-xl font-bold text-white">11 AM</span>
            </div>
          </div>
        </GlassCard>

        {/* WhatsApp Notifications */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">WhatsApp Notifications</h3>
          </div>
          <div className="space-y-4">
            <Toggle
              value={notifyAhead}
              onChange={(v) => {
                setNotifyAhead(v);
                addToast(v ? "Ahead notifications ON" : "Ahead notifications OFF", v ? "success" : "warn");
              }}
              label="Notify patients when 2 ahead"
            />
            <Toggle
              value={notifyLate}
              onChange={(v) => {
                setNotifyLate(v);
                addToast(v ? "Late alert ON" : "Late alert OFF", v ? "success" : "warn");
              }}
              label="'Running late' alert if wait > 30 mins"
            />

            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500 mb-2">Send custom update to all waiting</p>
              <div className="flex gap-2">
                <input
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendBroadcast()}
                  placeholder="e.g. Doctor running 10 min late…"
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-green-500/40"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={sendBroadcast}
                  className="p-2.5 rounded-xl bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* QR Code */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">QR Code</h3>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 border-2 border-slate-700 rounded-xl flex items-center justify-center bg-white/[0.03] flex-shrink-0">
              <QrCode className="w-10 h-10 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-1">Queue URL</p>
              <p className="text-sm text-cyan-400 font-mono truncate mb-3">
                reva.ai/queue/dr-sharma
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={copyLink}
                  className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-lg hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToast("Print dialog opened", "info")}
                  className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-lg hover:border-violet-500/30 hover:text-violet-300 transition-colors"
                >
                  <Printer className="w-3 h-3" />
                  Print Poster
                </motion.button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
