"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Calendar, Pill, AlertTriangle, FileText, ExternalLink, Edit3, Brain } from "lucide-react";
import { useEffect, useState } from "react";

interface DoctorBriefProps {
  patient: {
    name: string;
    initials: string;
    avatarColor: string;
    appointmentType: string;
    time: string;
  };
  onClose: () => void;
}

interface BriefData {
  complaint: string;
  symptoms: string[];
  severity: number;
  severityLabel: string;
  duration: string;
  medications: string;
  allergies: string;
  notes: string;
  submittedAt: string;
  aiAssessment: { condition: string; probability: number; color: string }[];
  lastVisit: { date: string; diagnosis: string; notes: string };
}

function getBriefData(name: string): BriefData {
  if (name === "Priya Sharma") {
    return {
      complaint: "Recurring headache for 3 days, getting worse in the evening",
      symptoms: ["Headache", "Fatigue", "Dizziness", "Nausea"],
      severity: 6,
      severityLabel: "Moderate",
      duration: "2-3 days",
      medications: "Amlodipine 5mg (morning), Metformin 500mg (twice daily)",
      allergies: "Penicillin",
      notes: "Symptoms worsen when looking at screens. Had similar episode 2 months ago.",
      submittedAt: "9:45 AM today",
      aiAssessment: [
        { condition: "Tension Headache", probability: 78, color: "cyan" },
        { condition: "Migraine", probability: 45, color: "violet" },
        { condition: "Hypertension-related", probability: 31, color: "amber" },
      ],
      lastVisit: {
        date: "Nov 15, 2025",
        diagnosis: "Hypertension management",
        notes: "BP 138/88. Continued Amlodipine. Advised low sodium diet.",
      },
    };
  }
  return {
    complaint: "General health check and routine follow-up",
    symptoms: ["Fatigue", "Mild cough"],
    severity: 3,
    severityLabel: "Mild",
    duration: "About a week",
    medications: "None",
    allergies: "None reported",
    notes: "",
    submittedAt: "10:02 AM today",
    aiAssessment: [
      { condition: "Routine Check", probability: 92, color: "emerald" },
      { condition: "Viral Infection", probability: 18, color: "amber" },
    ],
    lastVisit: {
      date: "Sep 3, 2025",
      diagnosis: "General checkup",
      notes: "All vitals normal.",
    },
  };
}

const symptomGradients = [
  "from-cyan-500/20 to-cyan-400/10 border-cyan-500/30 text-cyan-300",
  "from-violet-500/20 to-violet-400/10 border-violet-500/30 text-violet-300",
  "from-amber-500/20 to-amber-400/10 border-amber-500/30 text-amber-300",
  "from-rose-500/20 to-rose-400/10 border-rose-500/30 text-rose-300",
  "from-emerald-500/20 to-emerald-400/10 border-emerald-500/30 text-emerald-300",
  "from-sky-500/20 to-sky-400/10 border-sky-500/30 text-sky-300",
];

const assessmentBarColor: Record<string, string> = {
  cyan: "from-cyan-500 to-cyan-400",
  violet: "from-violet-500 to-violet-400",
  amber: "from-amber-500 to-amber-400",
  emerald: "from-emerald-500 to-emerald-400",
};

function SectionHeader({ label, pulse }: { label: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase whitespace-nowrap">
        {label}
      </span>
      {pulse && (
        <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-semibold px-2 py-0.5 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
          </span>
          AI Analysis
        </span>
      )}
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

const severityEmoji = (s: number) => {
  if (s <= 3) return "😌";
  if (s <= 6) return "😟";
  return "😰";
};

export default function DoctorBrief({ patient, onClose }: DoctorBriefProps) {
  const brief = getBriefData(patient.name);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const sections = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl h-full bg-[#070b1a] border-l border-white/[0.08] flex flex-col overflow-hidden"
        >
          {/* Top gradient accent */}
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-violet-600 flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Close
            </button>
            <span className="text-white text-sm font-semibold tracking-wide">Patient Brief</span>
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium">AI</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">

            {/* Patient identity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                style={{ background: patient.avatarColor }}
              >
                {patient.initials}
              </div>
              <div>
                <p className="text-white text-base font-semibold">{patient.name}</p>
                <p className="text-slate-400 text-sm">
                  {patient.appointmentType} &bull; {patient.time}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-cyan-400 text-xs">
                  <Zap className="w-3 h-3" />
                  <span>Submitted {brief.submittedAt}</span>
                </div>
              </div>
            </motion.div>

            {/* Chief Complaint */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader label="Chief Complaint" />
              <div className="border-l-2 border-cyan-400 pl-4">
                <p className="text-white text-lg font-medium italic leading-relaxed">
                  &ldquo;{brief.complaint}&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Symptoms */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 }}
            >
              <SectionHeader label={`Symptoms (${brief.symptoms.length})`} />
              <div className="flex flex-wrap gap-2">
                {brief.symptoms.map((symptom, i) => (
                  <motion.span
                    key={symptom}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={mounted ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className={`rounded-full px-3 py-1 text-xs font-medium border bg-gradient-to-r ${
                      symptomGradients[i % symptomGradients.length]
                    }`}
                  >
                    {symptom}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Severity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <SectionHeader label="Severity" />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{severityEmoji(brief.severity)}</span>
                <span className="text-white text-2xl font-bold">{brief.severity}</span>
                <span className="text-slate-400 text-sm">/10</span>
                <span className="ml-1 text-slate-300 text-sm font-medium">{brief.severityLabel}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={mounted ? { width: `${brief.severity * 10}%` } : {}}
                  transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, #22d3ee, #f59e0b, #ef4444)`,
                    width: `${brief.severity * 10}%`,
                  }}
                />
              </div>
            </motion.div>

            {/* Duration */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 }}
            >
              <SectionHeader label="Duration" />
              <div className="flex items-center gap-2 text-slate-200 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{brief.duration}</span>
              </div>
            </motion.div>

            {/* Medications & Allergies */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <SectionHeader label="Medications" />
              <div className="flex items-start gap-2 text-slate-200 text-sm mb-3">
                <Pill className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>{brief.medications}</span>
              </div>
              {brief.allergies && brief.allergies !== "None" && brief.allergies !== "None reported" && (
                <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  ALLERGY: {brief.allergies}
                </div>
              )}
            </motion.div>

            {/* Patient Notes */}
            {brief.notes && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 }}
              >
                <SectionHeader label="Patient Notes" />
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{brief.notes}&rdquo;</p>
                </div>
              </motion.div>
            )}

            {/* AI Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <SectionHeader label="AI Assessment" pulse />
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
                {brief.aiAssessment.map((item, i) => (
                  <div key={item.condition}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-sm font-medium">{item.condition}</span>
                      <span className="text-slate-400 text-xs">{item.probability}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={mounted ? { width: `${item.probability}%` } : {}}
                        transition={{ delay: 0.45 + i * 0.12, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          assessmentBarColor[item.color] ?? "from-slate-500 to-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Last Visit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 }}
            >
              <SectionHeader label={`Last Visit — ${brief.lastVisit.date}`} />
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-1">
                <p className="text-slate-200 text-sm font-medium">{brief.lastVisit.diagnosis}</p>
                <p className="text-slate-500 text-xs leading-relaxed">&ldquo;{brief.lastVisit.notes}&rdquo;</p>
              </div>
            </motion.div>

            {/* Bottom spacing */}
            <div className="h-4" />
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06] flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium rounded-xl py-2.5 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Add Note
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 hover:text-white text-sm font-medium rounded-xl py-2.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open Patient Record
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
