"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Phone,
  Copy,
  MessageCircle,
  Calendar,
  Pencil,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";

interface PatientsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Patient {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  age: number;
  gender: "M" | "F";
  lastVisit: string;
  nextAppt?: string;
  totalVisits: number;
  status: "Active" | "Inactive" | "New";
  conditions: string[];
  notes: string;
  history: { date: string; type: string; doctor: string; notes: string }[];
}

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    name: "Priya Sharma",
    initials: "PS",
    avatarColor: "from-pink-500 to-rose-500",
    phone: "+91 98012 34567",
    age: 34,
    gender: "F",
    lastVisit: "Dec 15, 2025",
    nextAppt: "Dec 31, 10:30 AM",
    totalVisits: 12,
    status: "Active",
    conditions: ["Hypertension", "Diabetes"],
    notes:
      "Patient is managing hypertension well with current medication. BP readings have been stable over the last three months. Monitor potassium levels at next visit due to diuretic use.",
    history: [
      { date: "Dec 15, 2025", type: "Follow-up", doctor: "Dr. Mehta", notes: "BP 128/82. Medication adjusted." },
      { date: "Nov 10, 2025", type: "Blood Test Review", doctor: "Dr. Mehta", notes: "HbA1c at 6.8 — improved." },
      { date: "Oct 5, 2025", type: "General Checkup", doctor: "Dr. Mehta", notes: "Routine checkup, vitals stable." },
      { date: "Aug 22, 2025", type: "Consultation", doctor: "Dr. Kapoor", notes: "Referred for dietary counselling." },
    ],
  },
  {
    id: 2,
    name: "Rahul Gupta",
    initials: "RG",
    avatarColor: "from-blue-500 to-cyan-500",
    phone: "+91 97543 21098",
    age: 28,
    gender: "M",
    lastVisit: "Dec 18, 2025",
    nextAppt: "Jan 2, 11:00 AM",
    totalVisits: 4,
    status: "Active",
    conditions: ["Asthma"],
    notes:
      "Patient experiences seasonal asthma flares, especially in winter months. Currently on Salbutamol inhaler as needed. Has not required hospitalisation in the past two years.",
    history: [
      { date: "Dec 18, 2025", type: "Follow-up", doctor: "Dr. Iyer", notes: "Lung function improved. Inhaler use reduced." },
      { date: "Sep 14, 2025", type: "Consultation", doctor: "Dr. Iyer", notes: "Seasonal flare. Prescribed short course of steroids." },
      { date: "Jun 3, 2025", type: "General Checkup", doctor: "Dr. Iyer", notes: "All clear. No active wheeze." },
    ],
  },
  {
    id: 3,
    name: "Ananya Nair",
    initials: "AN",
    avatarColor: "from-violet-500 to-purple-500",
    phone: "+91 96123 45678",
    age: 41,
    gender: "F",
    lastVisit: "Dec 10, 2025",
    nextAppt: "Dec 31, 11:30 AM",
    totalVisits: 7,
    status: "Active",
    conditions: [],
    notes:
      "No chronic conditions currently on record. Patient visits regularly for preventive health checkups. Last thyroid panel was within normal range.",
    history: [
      { date: "Dec 10, 2025", type: "General Checkup", doctor: "Dr. Mehta", notes: "Vitals normal. Thyroid normal." },
      { date: "Aug 5, 2025", type: "Blood Test Review", doctor: "Dr. Mehta", notes: "CBC normal. Iron borderline low." },
      { date: "Apr 17, 2025", type: "General Checkup", doctor: "Dr. Mehta", notes: "Routine visit. No concerns." },
    ],
  },
  {
    id: 4,
    name: "Vikram Patel",
    initials: "VP",
    avatarColor: "from-emerald-500 to-teal-500",
    phone: "+91 95432 10987",
    age: 55,
    gender: "M",
    lastVisit: "Dec 20, 2025",
    nextAppt: "Dec 31, 12:00 PM",
    totalVisits: 19,
    status: "Active",
    conditions: ["Diabetes", "Cholesterol"],
    notes:
      "Long-term diabetic patient with well-controlled LDL on statins. Recent HbA1c was 7.1. Advised to increase physical activity and reduce refined carbohydrates.",
    history: [
      { date: "Dec 20, 2025", type: "Blood Test Review", doctor: "Dr. Kapoor", notes: "LDL 98. HbA1c 7.1. Statin continued." },
      { date: "Oct 15, 2025", type: "Follow-up", doctor: "Dr. Kapoor", notes: "Weight increased by 2kg. Diet counselling done." },
      { date: "Jul 30, 2025", type: "General Checkup", doctor: "Dr. Kapoor", notes: "BP and sugar stable." },
      { date: "Apr 10, 2025", type: "Consultation", doctor: "Dr. Kapoor", notes: "Reviewed medication plan for Q2." },
      { date: "Jan 8, 2025", type: "Blood Test Review", doctor: "Dr. Kapoor", notes: "Annual lipid panel — cholesterol slightly elevated." },
    ],
  },
  {
    id: 5,
    name: "Sunita Rao",
    initials: "SR",
    avatarColor: "from-amber-500 to-orange-500",
    phone: "+91 94321 09876",
    age: 62,
    gender: "F",
    lastVisit: "Dec 12, 2025",
    totalVisits: 23,
    status: "Active",
    conditions: ["Hypertension", "Arthritis"],
    notes:
      "Patient has been managing knee osteoarthritis with physiotherapy and NSAIDs. Hypertension is stable on Amlodipine 5mg daily. Follow-up on renal function due to long-term NSAID use.",
    history: [
      { date: "Dec 12, 2025", type: "Follow-up", doctor: "Dr. Mehta", notes: "BP 130/80. Knee pain moderate." },
      { date: "Oct 1, 2025", type: "Consultation", doctor: "Dr. Rao", notes: "Physiotherapy referral renewed." },
      { date: "Jul 5, 2025", type: "Blood Test Review", doctor: "Dr. Mehta", notes: "Creatinine within range. Continue NSAIDs with caution." },
      { date: "Mar 14, 2025", type: "General Checkup", doctor: "Dr. Mehta", notes: "Annual checkup. BP well controlled." },
    ],
  },
  {
    id: 6,
    name: "Karan Mehta",
    initials: "KM",
    avatarColor: "from-slate-400 to-gray-500",
    phone: "+91 93210 98765",
    age: 31,
    gender: "M",
    lastVisit: "Sep 3, 2025",
    totalVisits: 2,
    status: "Inactive",
    conditions: [],
    notes:
      "Patient visited twice for minor acute complaints. No follow-up since September 2025. No chronic conditions identified. Consider outreach to re-engage.",
    history: [
      { date: "Sep 3, 2025", type: "Consultation", doctor: "Dr. Iyer", notes: "Sore throat and mild fever. Antibiotics prescribed." },
      { date: "Mar 20, 2025", type: "General Checkup", doctor: "Dr. Iyer", notes: "First visit. General health — good." },
    ],
  },
  {
    id: 7,
    name: "Deepa Singh",
    initials: "DS",
    avatarColor: "from-fuchsia-500 to-pink-500",
    phone: "+91 92109 87654",
    age: 29,
    gender: "F",
    lastVisit: "Nov 28, 2025",
    nextAppt: "Dec 31, 3:30 PM",
    totalVisits: 5,
    status: "Active",
    conditions: ["Migraine"],
    notes:
      "Patient suffers from chronic migraines with approximately 3–4 episodes per month. Triggers include stress and bright lights. Currently on preventive therapy — Propranolol 40mg.",
    history: [
      { date: "Nov 28, 2025", type: "Follow-up", doctor: "Dr. Kapoor", notes: "Migraine frequency down to 2/month. Good response to Propranolol." },
      { date: "Sep 10, 2025", type: "Consultation", doctor: "Dr. Kapoor", notes: "Started preventive therapy." },
      { date: "Jun 22, 2025", type: "General Checkup", doctor: "Dr. Kapoor", notes: "Discussed trigger management." },
    ],
  },
  {
    id: 8,
    name: "Arjun Kumar",
    initials: "AK",
    avatarColor: "from-emerald-500 to-teal-500",
    phone: "+91 91098 76543",
    age: 47,
    gender: "M",
    lastVisit: "Dec 8, 2025",
    totalVisits: 8,
    status: "Active",
    conditions: ["Back Pain"],
    notes:
      "Patient has chronic lumbar back pain, likely mechanical in origin. MRI showed mild L4-L5 disc bulge. Managed with physiotherapy and muscle relaxants. No surgical indication at present.",
    history: [
      { date: "Dec 8, 2025", type: "Follow-up", doctor: "Dr. Rao", notes: "Pain reduced to 3/10. Physio ongoing." },
      { date: "Sep 25, 2025", type: "Consultation", doctor: "Dr. Rao", notes: "MRI reviewed. Conservative management advised." },
      { date: "Jul 11, 2025", type: "General Checkup", doctor: "Dr. Rao", notes: "Back pain onset. Referred for MRI." },
      { date: "Feb 4, 2025", type: "Consultation", doctor: "Dr. Rao", notes: "Earlier back episode. Resolved with rest." },
    ],
  },
  {
    id: 9,
    name: "Meera Joshi",
    initials: "MJ",
    avatarColor: "from-violet-500 to-purple-500",
    phone: "+91 90987 65432",
    age: 38,
    gender: "F",
    lastVisit: "Dec 22, 2025",
    totalVisits: 1,
    status: "New",
    conditions: [],
    notes:
      "New patient, first visit for general health assessment. No significant past medical history reported. Blood tests ordered for baseline. Follow-up to be scheduled after results.",
    history: [
      { date: "Dec 22, 2025", type: "General Checkup", doctor: "Dr. Mehta", notes: "First visit. Baseline investigations ordered." },
    ],
  },
  {
    id: 10,
    name: "Ravi Sharma",
    initials: "RS",
    avatarColor: "from-cyan-500 to-blue-500",
    phone: "+91 89876 54321",
    age: 53,
    gender: "M",
    lastVisit: "Dec 5, 2025",
    totalVisits: 11,
    status: "Active",
    conditions: ["Cholesterol"],
    notes:
      "Patient is on Rosuvastatin 10mg for elevated LDL. Last lipid panel showed LDL at 102. Tolerating medication well with no myopathy symptoms. Annual liver function test due.",
    history: [
      { date: "Dec 5, 2025", type: "Blood Test Review", doctor: "Dr. Kapoor", notes: "LDL 102. Statin continued. LFT ordered." },
      { date: "Sep 2, 2025", type: "Follow-up", doctor: "Dr. Kapoor", notes: "No side effects. Compliance good." },
      { date: "Jun 10, 2025", type: "General Checkup", doctor: "Dr. Kapoor", notes: "Annual review. Weight stable." },
      { date: "Jan 15, 2025", type: "Consultation", doctor: "Dr. Kapoor", notes: "Statin initiated after elevated lipid panel." },
    ],
  },
  {
    id: 11,
    name: "Sneha Kapoor",
    initials: "SK",
    avatarColor: "from-pink-500 to-fuchsia-500",
    phone: "+91 88765 43210",
    age: 25,
    gender: "F",
    lastVisit: "Dec 24, 2025",
    totalVisits: 1,
    status: "New",
    conditions: [],
    notes:
      "New patient presenting with fatigue and irregular periods. Thyroid panel and hormonal workup ordered. No significant past medical history. Follow-up scheduled pending results.",
    history: [
      { date: "Dec 24, 2025", type: "Consultation", doctor: "Dr. Mehta", notes: "Fatigue, irregular cycles. Thyroid + hormonal workup ordered." },
    ],
  },
  {
    id: 12,
    name: "Mohammed Ali",
    initials: "MA",
    avatarColor: "from-amber-500 to-yellow-500",
    phone: "+91 87654 32109",
    age: 44,
    gender: "M",
    lastVisit: "Jul 15, 2025",
    totalVisits: 6,
    status: "Inactive",
    conditions: ["Hypertension"],
    notes:
      "Patient missed last two follow-up appointments. Hypertension was borderline controlled at last visit with BP 145/90. Consider phone outreach to reassess medication compliance.",
    history: [
      { date: "Jul 15, 2025", type: "Follow-up", doctor: "Dr. Iyer", notes: "BP 145/90. Medication compliance poor. Counselled." },
      { date: "Apr 8, 2025", type: "General Checkup", doctor: "Dr. Iyer", notes: "BP elevated. Antihypertensive prescribed." },
      { date: "Jan 20, 2025", type: "Consultation", doctor: "Dr. Iyer", notes: "First presentation with high BP readings." },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Inactive: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  New: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
};

const CONDITION_COLORS = [
  "bg-rose-500/20 text-rose-300",
  "bg-violet-500/20 text-violet-300",
  "bg-amber-500/20 text-amber-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-pink-500/20 text-pink-300",
];

const SORT_OPTIONS = [
  { value: "lastVisit", label: "Last Visit" },
  { value: "name", label: "Name" },
  { value: "totalVisits", label: "Total Visits" },
];

function AddPatientModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: Patient) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "M" as "M" | "F",
    conditions: "",
    firstAppt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = form.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const colors = [
      "from-cyan-500 to-blue-500",
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500",
      "from-emerald-500 to-teal-500",
    ];
    const newPatient: Patient = {
      id: Date.now(),
      name: form.name,
      initials,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      phone: form.phone,
      age: parseInt(form.age) || 0,
      gender: form.gender,
      lastVisit: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      nextAppt: form.firstAppt || undefined,
      totalVisits: 1,
      status: "New",
      conditions: form.conditions ? form.conditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      notes: "",
      history: [],
    };
    onAdd(newPatient);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-md bg-[#0b0f23] border border-white/[0.08] rounded-2xl p-6"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Add Patient</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Full Name</label>
            <input
              required
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Phone</label>
            <input
              required
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-slate-400 text-sm mb-1 block">Age</label>
              <input
                required
                type="number"
                min="1"
                max="120"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-sm mb-1 block">Gender</label>
              <div className="flex gap-2 mt-1">
                {(["M", "F"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                      form.gender === g
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                        : "border-white/[0.08] text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {g === "M" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Conditions (comma-separated)</label>
            <input
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
              placeholder="e.g. Hypertension, Diabetes"
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">First Appointment Slot</label>
            <input
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
              placeholder="e.g. Jan 5, 10:00 AM"
              value={form.firstAppt}
              onChange={(e) => setForm({ ...form, firstAppt: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add Patient
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Avatar({ patient, size = "sm" }: { patient: Patient; size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "w-14 h-14 text-lg" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${dims} rounded-2xl bg-gradient-to-br ${patient.avatarColor} flex items-center justify-center font-bold text-white flex-shrink-0`}
    >
      {patient.initials}
    </div>
  );
}

export default function PatientsView({ addToast }: PatientsViewProps) {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive" | "New">("All");
  const [sort, setSort] = useState<"lastVisit" | "name" | "totalVisits">("lastVisit");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "notes">("overview");
  const [showModal, setShowModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    let list = patients.filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.conditions.some((c) => c.toLowerCase().includes(q))
      );
    });
    if (filter !== "All") list = list.filter((p) => p.status === filter);
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "totalVisits") return b.totalVisits - a.totalVisits;
      return 0; // lastVisit — original order (array is already sorted by recency)
    });
    return list;
  }, [patients, search, filter, sort]);

  const selectPatient = (p: Patient) => {
    setSelectedId(p.id);
    setActiveTab("overview");
    setNoteContent(p.notes);
    setNoteDirty(false);
  };

  const handleCopyPhone = () => {
    if (!selectedPatient) return;
    navigator.clipboard.writeText(selectedPatient.phone);
    addToast("Copied!", "success");
  };

  const handleSaveNote = () => {
    if (!selectedPatient) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, notes: noteContent } : p))
    );
    setNoteDirty(false);
    addToast("Note saved", "success");
  };

  const handleAddPatient = (p: Patient) => {
    setPatients((prev) => [p, ...prev]);
    setShowModal(false);
    addToast(`${p.name} added`, "success");
  };

  const TABS: { id: "overview" | "history" | "notes"; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="flex h-full gap-4 overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold">Patients</h2>
              <span className="text-xs bg-white/[0.08] text-slate-400 px-2 py-0.5 rounded-full">
                {patients.length}
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-xs bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Plus size={13} />
              Add
            </button>
          </div>
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/40 placeholder:text-slate-600"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Filter chips */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {(["All", "Active", "Inactive", "New"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  filter === f
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "border-white/[0.08] text-slate-400 hover:border-white/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="w-full appearance-none bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-1.5 text-slate-400 text-xs focus:outline-none pr-7 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0b0f23]">
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
              No patients found
            </div>
          )}
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              onClick={() => selectPatient(p)}
              onHoverStart={() => setHoveredId(p.id)}
              onHoverEnd={() => setHoveredId(null)}
              className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2 ${
                selectedId === p.id
                  ? "bg-white/[0.07] border-l-cyan-500"
                  : "border-l-transparent hover:bg-white/[0.04]"
              }`}
              whileHover={{ x: 1 }}
            >
              <Avatar patient={p} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white text-sm font-medium truncate">{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{p.lastVisit}</span>
                  <span>·</span>
                  <span>{p.totalVisits} visits</span>
                </div>
              </div>
              <AnimatePresence>
                {hoveredId === p.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex-shrink-0"
                  >
                    <MessageCircle size={14} className="text-emerald-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 min-w-0 relative">
        <AnimatePresence mode="wait">
          {!selectedPatient ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-slate-500 gap-3"
            >
              <Users size={40} className="opacity-30" />
              <p className="text-sm">Select a patient to view their details</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedPatient.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="h-full flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
            >
              {/* Detail header */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-start gap-4">
                  <Avatar patient={selectedPatient} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-white text-xl font-bold">{selectedPatient.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedPatient.status]}`}>
                        {selectedPatient.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                      <Phone size={13} />
                      <span>{selectedPatient.phone}</span>
                      <button
                        onClick={handleCopyPhone}
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                      <span className="text-slate-600">·</span>
                      <span className="bg-white/[0.06] text-slate-300 text-xs px-2 py-0.5 rounded-full">
                        {selectedPatient.age}{selectedPatient.gender}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-all">
                        <MessageCircle size={12} />
                        WhatsApp
                      </button>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 transition-all">
                        <Calendar size={12} />
                        Book Appt
                      </button>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-500/40 text-slate-400 hover:bg-slate-500/10 transition-all">
                        <Pencil size={12} />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex gap-0 border-b border-white/[0.06] px-5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-600"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-5"
                    >
                      {/* Conditions */}
                      <div>
                        <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-medium">Conditions</h3>
                        {selectedPatient.conditions.length === 0 ? (
                          <p className="text-slate-600 text-sm">No chronic conditions on record</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.conditions.map((c, i) => (
                              <span key={c} className={`text-xs px-3 py-1 rounded-full font-medium ${CONDITION_COLORS[i % CONDITION_COLORS.length]}`}>
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Next appointment */}
                      {selectedPatient.nextAppt && (
                        <div>
                          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-medium">Next Appointment</h3>
                          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 border-l-2 border-l-cyan-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-cyan-400" />
                              <span className="text-white text-sm">{selectedPatient.nextAppt}</span>
                            </div>
                            <p className="text-slate-500 text-xs mt-1 ml-5">Follow-up Consultation</p>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div>
                        <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-medium">Stats</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "First Visit", value: selectedPatient.history.at(-1)?.date ?? "—" },
                            { label: "Total Visits", value: selectedPatient.totalVisits },
                            { label: "Last Visit", value: selectedPatient.lastVisit },
                          ].map((s) => (
                            <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                              <p className="text-white font-semibold text-sm">{s.value}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "history" && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="relative"
                    >
                      <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/[0.06]" />
                      <div className="space-y-5">
                        {selectedPatient.history.map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex gap-4"
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex-shrink-0 mt-1 relative z-10" />
                            <div className="flex-1 pb-1">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-white text-sm font-semibold">{h.type}</span>
                                <span className="text-slate-500 text-xs">{h.date}</span>
                              </div>
                              <p className="text-slate-400 text-xs mb-1">{h.doctor}</p>
                              <p className="text-slate-500 text-xs">{h.notes}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "notes" && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3"
                    >
                      <h3 className="text-slate-400 text-xs uppercase tracking-wider font-medium">Clinical Notes</h3>
                      <div className="relative">
                        <textarea
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500/40 resize-none min-h-[180px] leading-relaxed placeholder:text-slate-600"
                          value={noteContent}
                          onChange={(e) => {
                            setNoteContent(e.target.value);
                            setNoteDirty(e.target.value !== selectedPatient.notes);
                          }}
                          placeholder="Add clinical notes..."
                        />
                        <span className="absolute bottom-3 right-3 text-slate-600 text-xs">
                          {noteContent.length} chars
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-slate-600 text-xs">Last updated: {selectedPatient.lastVisit}</p>
                        <AnimatePresence>
                          {noteDirty && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              onClick={handleSaveNote}
                              className="text-xs px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all font-medium"
                            >
                              Save Note
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showModal && (
          <AddPatientModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddPatient}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
