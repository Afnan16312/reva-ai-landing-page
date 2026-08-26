"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  Search,
  Zap,
  Plus,
  X,
  Smartphone,
  Printer,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface PrescriptionViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type DosageOption = "Once daily" | "Twice daily" | "Thrice daily" | "SOS" | "At bedtime";
type TimingOption = "Before meals" | "After meals" | "With meals" | "Empty stomach";
type DurationUnit = "days" | "weeks" | "months";

interface Medicine {
  id: string;
  name: string;
  dosage: DosageOption;
  timing: TimingOption;
  duration: string;
  durationUnit: DurationUnit;
  instructions: string;
}

interface PatientInfo {
  name: string;
  age: number;
  lastVisit: string;
  bloodGroup: string;
  allergies: string[];
}

interface RecentRx {
  id: string;
  patient: string;
  date: string;
  diagnosis: string;
  medicineCount: number;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MEDICINE_LIST = [
  "Paracetamol 500mg",
  "Amoxicillin 500mg",
  "Metformin 500mg",
  "Amlodipine 5mg",
  "Atorvastatin 10mg",
  "Omeprazole 20mg",
  "Cetirizine 10mg",
  "Azithromycin 500mg",
  "Ibuprofen 400mg",
  "Pantoprazole 40mg",
  "Montelukast 10mg",
  "Clopidogrel 75mg",
  "Losartan 50mg",
  "Levothyroxine 50mcg",
  "Vitamin D3 60000IU",
  "Calcium + D3",
  "B-Complex",
  "Iron + Folic Acid",
  "Dolo 650",
  "Crocin 500mg",
];

const TEST_SUGGESTIONS = [
  "CBC",
  "LFT",
  "RFT",
  "HbA1c",
  "Lipid Profile",
  "TSH",
  "Blood Sugar Fasting",
  "Urine Routine",
  "Chest X-Ray",
  "ECG",
];

const DIAGNOSIS_SUGGESTIONS = [
  "Viral Fever",
  "Hypertension Follow-up",
  "Type 2 Diabetes Check",
  "Upper Respiratory Infection",
];

const FOLLOWUP_OPTIONS = [
  "3 days",
  "1 week",
  "2 weeks",
  "1 month",
  "3 months",
  "As needed",
];

const DOSAGE_OPTIONS: DosageOption[] = [
  "Once daily",
  "Twice daily",
  "Thrice daily",
  "SOS",
  "At bedtime",
];

const TIMING_OPTIONS: TimingOption[] = [
  "Before meals",
  "After meals",
  "With meals",
  "Empty stomach",
];

const INTERACTION_PAIRS: [string, string][] = [
  ["Warfarin", "Aspirin"],
  ["Metformin", "Alcohol note"],
  ["Clopidogrel", "Ibuprofen"],
];

const PATIENTS: PatientInfo[] = [
  { name: "Priya Sharma", age: 34, lastVisit: "Apr 22", bloodGroup: "B+", allergies: ["Penicillin"] },
  { name: "Rahul Gupta", age: 45, lastVisit: "Apr 21", bloodGroup: "O+", allergies: [] },
  { name: "Ananya Nair", age: 28, lastVisit: "Apr 20", bloodGroup: "A+", allergies: ["Aspirin"] },
  { name: "Vikram Patel", age: 52, lastVisit: "Apr 18", bloodGroup: "AB+", allergies: [] },
  { name: "Sunita Rao", age: 61, lastVisit: "Apr 17", bloodGroup: "B-", allergies: ["Sulfa"] },
];

const RECENT_RX: RecentRx[] = [
  { id: "r1", patient: "Priya Sharma", date: "Apr 22", diagnosis: "Viral Fever", medicineCount: 3, initials: "PS", gradientFrom: "#06B6D4", gradientTo: "#8B5CF6" },
  { id: "r2", patient: "Rahul Gupta", date: "Apr 21", diagnosis: "Hypertension Follow-up", medicineCount: 2, initials: "RG", gradientFrom: "#8B5CF6", gradientTo: "#F43F5E" },
  { id: "r3", patient: "Ananya Nair", date: "Apr 20", diagnosis: "Dental Post-op", medicineCount: 4, initials: "AN", gradientFrom: "#10B981", gradientTo: "#06B6D4" },
  { id: "r4", patient: "Vikram Patel", date: "Apr 18", diagnosis: "Diabetes Check", medicineCount: 3, initials: "VP", gradientFrom: "#F59E0B", gradientTo: "#F43F5E" },
  { id: "r5", patient: "Sunita Rao", date: "Apr 17", diagnosis: "BP Routine", medicineCount: 2, initials: "SR", gradientFrom: "#10B981", gradientTo: "#8B5CF6" },
];

const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: "m1",
    name: "Paracetamol 500mg",
    dosage: "Thrice daily",
    timing: "After meals",
    duration: "5",
    durationUnit: "days",
    instructions: "Take if fever > 101°F",
  },
  {
    id: "m2",
    name: "Vitamin D3 60000IU",
    dosage: "Once daily",
    timing: "After meals",
    duration: "4",
    durationUnit: "weeks",
    instructions: "Take with milk",
  },
];

const dosageShort: Record<DosageOption, string> = {
  "Once daily": "1×/day",
  "Twice daily": "2×/day",
  "Thrice daily": "3×/day",
  "SOS": "SOS",
  "At bedtime": "HS",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2);
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
  delay,
}: {
  label: string;
  value: number;
  sub?: string;
  color: string;
  delay: number;
}) {
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" as const }}
      className="relative rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent 70%)` }}
      />
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>
        {count}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

function PillSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-xs px-2 py-1 rounded-full border transition-all ${
            value === opt
              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
              : "bg-transparent border-white/[0.08] text-slate-400 hover:border-white/20"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MedicineRow({
  medicine,
  index,
  onChange,
  onRemove,
}: {
  medicine: Medicine;
  index: number;
  onChange: (m: Medicine) => void;
  onRemove: () => void;
}) {
  const update = <K extends keyof Medicine>(key: K, val: Medicine[K]) =>
    onChange({ ...medicine, [key]: val });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" as const }}
      className="relative rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500 font-medium">Medicine {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Medicine name */}
      <input
        list="medicines-list"
        value={medicine.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="Medicine name..."
        className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
      />
      <datalist id="medicines-list">
        {MEDICINE_LIST.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      {/* Dosage */}
      <div>
        <p className="text-xs text-slate-500 mb-1.5">Dosage</p>
        <PillSelector options={DOSAGE_OPTIONS} value={medicine.dosage} onChange={(v) => update("dosage", v)} />
      </div>

      {/* Timing */}
      <div>
        <p className="text-xs text-slate-500 mb-1.5">Timing</p>
        <PillSelector options={TIMING_OPTIONS} value={medicine.timing} onChange={(v) => update("timing", v)} />
      </div>

      {/* Duration + Instructions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Duration</p>
          <div className="flex gap-1">
            <input
              type="number"
              min="1"
              value={medicine.duration}
              onChange={(e) => update("duration", e.target.value)}
              className="w-16 bg-transparent border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
            <select
              value={medicine.durationUnit}
              onChange={(e) => update("durationUnit", e.target.value as DurationUnit)}
              className="flex-1 bg-[#050714] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="days">days</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
            </select>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Instructions</p>
          <input
            value={medicine.instructions}
            onChange={(e) => update("instructions", e.target.value)}
            placeholder="e.g. Take with warm water"
            className="w-full bg-transparent border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// LIVE RX PREVIEW
// ─────────────────────────────────────────────
function LivePreview({
  patient,
  diagnosis,
  medicines,
  tests,
  advice,
  followUp,
  rxNumber,
}: {
  patient: PatientInfo | null;
  diagnosis: string;
  medicines: Medicine[];
  tests: string[];
  advice: string;
  followUp: string;
  rxNumber: string;
}) {
  const controls = useAnimation();
  const prevKey = useRef("");

  const currentKey = JSON.stringify({ patient, diagnosis, medicines, tests, advice, followUp });

  useEffect(() => {
    if (currentKey !== prevKey.current) {
      prevKey.current = currentKey;
      controls.start({
        scale: [1, 1.003, 1],
        transition: { duration: 0.3, ease: "easeOut" as const },
      });
    }
  }, [currentKey, controls]);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div animate={controls} className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 text-[11px] leading-relaxed space-y-3 overflow-auto max-h-[340px]">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/[0.08] pb-2">
        <div>
          <p className="font-bold text-white text-sm">Dr. Sharma&apos;s Clinic</p>
          <p className="text-slate-400">Dr. Priya Sharma, MBBS MD</p>
          <p className="text-slate-500">Reg: MH-12345</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400">{today}</p>
          <p className="text-cyan-400 font-mono">{rxNumber}</p>
        </div>
      </div>

      {/* Patient */}
      {patient ? (
        <div className="space-y-0.5">
          <p><span className="text-slate-500">Patient: </span><span className="text-white font-medium">{patient.name}</span></p>
          <p><span className="text-slate-500">Age: </span><span className="text-white">{patient.age} yrs</span></p>
        </div>
      ) : (
        <p className="text-slate-600 italic">No patient selected</p>
      )}

      {/* Diagnosis */}
      {diagnosis && (
        <div>
          <p className="text-slate-500">Diagnosis:</p>
          <p className="text-cyan-400 italic">{diagnosis}</p>
        </div>
      )}

      {/* Rx symbol */}
      <div>
        <p className="text-2xl font-serif text-white/20 leading-none">℞</p>
        {medicines.length > 0 ? (
          <ol className="space-y-1 mt-1">
            {medicines.map((m, i) => (
              <li key={m.id} className="text-slate-300">
                <span className="text-white font-medium">{i + 1}. {m.name || "—"}</span>
                <span className="text-slate-500"> — {dosageShort[m.dosage]}, {m.timing}, {m.duration} {m.durationUnit}</span>
                {m.instructions && <span className="text-slate-600"> ({m.instructions})</span>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-600 italic">No medicines added</p>
        )}
      </div>

      {/* Tests */}
      {tests.length > 0 && (
        <div>
          <p className="text-slate-500">Investigations:</p>
          <p className="text-slate-300">{tests.join(", ")}</p>
        </div>
      )}

      {/* Advice */}
      {advice && (
        <div>
          <p className="text-slate-500">Advice:</p>
          <p className="text-slate-300">{advice}</p>
        </div>
      )}

      {/* Follow-up */}
      {followUp && (
        <p className="text-slate-400">Follow-up in: <span className="text-amber-400">{followUp}</span></p>
      )}

      {/* Footer */}
      <div className="border-t border-white/[0.08] pt-2 mt-2">
        <p className="text-slate-600">____________________</p>
        <p className="text-slate-600">Dr. Priya Sharma</p>
        <p className="text-slate-600 text-[9px] mt-1">Digitally generated by Reva AI</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function PrescriptionView({ addToast }: PrescriptionViewProps) {
  // Patient state
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);

  // Form state
  const [diagnosis, setDiagnosis] = useState("");
  const [showDiagChips, setShowDiagChips] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(DEFAULT_MEDICINES);
  const [tests, setTests] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("1 week");
  const [dismissedInteraction, setDismissedInteraction] = useState<string | null>(null);

  // Builder flash state
  const [builderFlash, setBuilderFlash] = useState(false);

  const rxNumber = "RX-2026-0047";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Drug interaction detection
  const detectedInteraction = (() => {
    const names = medicines.map((m) => m.name.toLowerCase());
    for (const [a, b] of INTERACTION_PAIRS) {
      const aMatch = names.some((n) => n.includes(a.toLowerCase()));
      const bMatch = names.some((n) => n.includes(b.toLowerCase()));
      if (aMatch && bMatch) {
        const key = `${a}+${b}`;
        if (key === dismissedInteraction) return null;
        return { a, b, key };
      }
    }
    return null;
  })();

  // Filtered patients
  const filteredPatients = PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Medicine handlers
  const addMedicine = useCallback(() => {
    setMedicines((prev) => [
      ...prev,
      {
        id: genId(),
        name: "",
        dosage: "Once daily",
        timing: "After meals",
        duration: "5",
        durationUnit: "days",
        instructions: "",
      },
    ]);
  }, []);

  const updateMedicine = useCallback((id: string, updated: Medicine) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  const removeMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Test handlers
  const addTest = (test: string) => {
    const t = test.trim();
    if (t && !tests.includes(t)) {
      setTests((prev) => [...prev, t]);
    }
    setTestInput("");
    setShowTestSuggestions(false);
  };

  const removeTest = (t: string) => setTests((prev) => prev.filter((x) => x !== t));

  // Load recent Rx
  const loadRecentRx = (rx: RecentRx) => {
    const patient = PATIENTS.find((p) => p.name === rx.patient) || null;
    setSelectedPatient(patient);
    setDiagnosis(rx.diagnosis);
    setBuilderFlash(true);
    setTimeout(() => setBuilderFlash(false), 600);
    addToast(`Loaded prescription for ${rx.patient}`, "info");
  };

  // Clear form
  const clearForm = () => {
    setSelectedPatient(null);
    setDiagnosis("");
    setMedicines([]);
    setTests([]);
    setAdvice("");
    setFollowUp("1 week");
    setPatientSearch("");
    setDismissedInteraction(null);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050714] text-white p-6 space-y-6">
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Prescriptions Today" value={14} color="#06B6D4" delay={0} />
        <StatCard label="Sent via WhatsApp" value={12} sub="86% delivery rate" color="#10B981" delay={0.08} />
        <StatCard label="Avg Medicines/Rx" value={28} sub="÷10 = 2.8" color="#8B5CF6" delay={0.16} />
        <StatCard label="Follow-ups Generated" value={8} color="#F59E0B" delay={0.24} />
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex gap-6 items-start">
        {/* ── LEFT: BUILDER ── */}
        <motion.div
          className={`flex-1 space-y-5 transition-all duration-300 ${builderFlash ? "ring-2 ring-cyan-500/60 rounded-xl" : ""}`}
          animate={builderFlash ? { boxShadow: ["0 0 0px #06B6D4", "0 0 30px #06B6D420", "0 0 0px #06B6D4"] } : {}}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        >
          {/* PATIENT SELECTOR */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patients..."
                className="w-full bg-transparent border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredPatients.map((p) => (
                <motion.button
                  key={p.name}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPatient(p)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    selectedPatient?.name === p.name
                      ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border-cyan-500/50 text-cyan-300"
                      : "bg-transparent border-white/[0.08] text-slate-400 hover:border-white/20"
                  }`}
                >
                  {p.name}
                </motion.button>
              ))}
            </div>

            {/* Selected patient info */}
            <AnimatePresence>
              {selectedPatient && (
                <motion.div
                  key={selectedPatient.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" as const }}
                  className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.06]"
                >
                  <span className="text-white font-medium text-sm">{selectedPatient.name}</span>
                  <span className="text-slate-400 text-xs">{selectedPatient.age} yrs</span>
                  <span className="text-slate-500 text-xs">Last visit: {selectedPatient.lastVisit}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{selectedPatient.bloodGroup}</span>
                  {selectedPatient.allergies.map((a) => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      ⚠ {a}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PRESCRIPTION HEADER CARD */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="flex justify-between items-start p-4">
              <div>
                <p className="font-bold text-white">Dr. Priya Sharma</p>
                <p className="text-sm text-slate-400">MBBS, MD — General Physician</p>
                <p className="text-xs text-slate-500 mt-0.5">Reg. No: MH-12345</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-slate-400">{today}</p>
                <p className="text-sm font-mono text-cyan-400">{rxNumber}</p>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle size={10} />
                  Digital Prescription
                </span>
              </div>
            </div>
            <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-violet-500 to-transparent" />
          </div>

          {/* DIAGNOSIS */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
            <label className="text-sm font-medium text-slate-300">Chief Complaint / Diagnosis</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              onFocus={() => setShowDiagChips(true)}
              rows={2}
              placeholder="e.g. Viral fever with mild cough, hypertension follow-up..."
              className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
            />
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDiagChips((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Zap size={12} />
                AI Suggest
              </motion.button>
            </div>
            <AnimatePresence>
              {showDiagChips && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" as const }}
                  className="flex flex-wrap gap-2"
                >
                  {DIAGNOSIS_SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, ease: "easeOut" as const }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setDiagnosis(s);
                        setShowDiagChips(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 transition-colors"
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MEDICINES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Medicines</h3>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={addMedicine}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300 hover:from-cyan-500/30 hover:to-violet-500/30 transition-all"
              >
                <Plus size={12} />
                Add Medicine
              </motion.button>
            </div>

            {/* Interaction warning */}
            <AnimatePresence>
              {detectedInteraction && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" as const }}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} />
                    <span>Potential interaction: <strong>{detectedInteraction.a}</strong> + <strong>{detectedInteraction.b}</strong> — review dosage</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedInteraction(detectedInteraction.key)}
                    className="hover:text-amber-300 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {medicines.map((m, i) => (
                <MedicineRow
                  key={m.id}
                  medicine={m}
                  index={i}
                  onChange={(updated) => updateMedicine(m.id, updated)}
                  onRemove={() => removeMedicine(m.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* TESTS */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
            <label className="text-sm font-medium text-slate-300">Investigations / Tests</label>
            <div
              className="flex flex-wrap gap-2 min-h-[36px] border border-white/[0.08] rounded-lg px-3 py-2 cursor-text"
              onClick={() => document.getElementById("test-input")?.focus()}
            >
              <AnimatePresence>
                {tests.map((t) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" as const }}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300"
                  >
                    {t}
                    <button type="button" onClick={() => removeTest(t)} className="hover:text-white">
                      <X size={10} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <input
                id="test-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onFocus={() => setShowTestSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTestSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTest(testInput);
                  }
                }}
                placeholder={tests.length === 0 ? "Type test name + Enter..." : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <AnimatePresence>
              {showTestSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" as const }}
                  className="flex flex-wrap gap-2"
                >
                  {TEST_SUGGESTIONS.filter((s) => !tests.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => addTest(s)}
                      className="text-xs px-2 py-1 rounded-full bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ADVICE + FOLLOW-UP */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-2">
              <label className="text-sm font-medium text-slate-300">General Advice</label>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                rows={3}
                placeholder="Rest, avoid cold drinks, stay hydrated..."
                className="w-full bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
              />
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-2">
              <label className="text-sm font-medium text-slate-300">Follow-up In</label>
              <select
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="w-full bg-[#050714] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                {FOLLOWUP_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="sticky bottom-0 flex gap-3 pt-4 pb-2 bg-[#050714]">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => addToast(`Prescription sent to ${selectedPatient?.name ?? "patient"} via WhatsApp ✓`, "success")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Smartphone size={15} />
              Send via WhatsApp
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => addToast(`Saved as ${rxNumber}`, "success")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-sm font-semibold hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Printer size={15} />
              Save &amp; Print
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={clearForm}
              className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-medium hover:bg-rose-500/10 transition-all"
            >
              <Trash2 size={15} />
            </motion.button>
          </div>
        </motion.div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-[380px] shrink-0 space-y-4">
          {/* LIVE RX PREVIEW */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={14} className="text-cyan-400" />
                Live Rx Preview
              </h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </span>
            </div>
            <LivePreview
              patient={selectedPatient}
              diagnosis={diagnosis}
              medicines={medicines}
              tests={tests}
              advice={advice}
              followUp={followUp}
              rxNumber={rxNumber}
            />
          </div>

          {/* RECENT PRESCRIPTIONS */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Prescriptions</h3>
              <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors">
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {RECENT_RX.map((rx, i) => (
                <RecentRxCard key={rx.id} rx={rx} delay={i * 0.06} onLoad={loadRecentRx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RECENT RX CARD
// ─────────────────────────────────────────────
function RecentRxCard({
  rx,
  delay,
  onLoad,
}: {
  rx: RecentRx;
  delay: number;
  onLoad: (rx: RecentRx) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" as const }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all cursor-pointer group"
      onClick={() => onLoad(rx)}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${rx.gradientFrom}, ${rx.gradientTo})` }}
      >
        {rx.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white truncate">{rx.patient}</p>
          <p className="text-xs text-slate-500 ml-1 shrink-0">{rx.date}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-slate-500 truncate">{rx.diagnosis}</p>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 shrink-0">
            {rx.medicineCount} med
          </span>
        </div>
      </div>

      {/* Status / Resend */}
      <div className="shrink-0">
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.button
              key="resend"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" as const }}
              type="button"
              className="text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <RefreshCw size={10} />
              Resend
            </motion.button>
          ) : (
            <motion.span
              key="sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" as const }}
              className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"
            >
              <CheckCircle size={10} />
              Sent
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
