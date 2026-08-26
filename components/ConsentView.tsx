"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Copy,
  Shield,
  MessageSquare,
  RefreshCw,
  X,
  Check,
  Zap,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface ConsentViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type ConsentStatus = "Signed" | "Pending";
type ProcedureCategory = "surgical" | "dental" | "diagnostic" | "therapeutic";
type ActiveTab = "queue" | "templates" | "archive";
type SortDir = "asc" | "desc" | null;
type SortCol = "patient" | "procedure" | "sentDate" | "signedDate" | "signTime" | null;

interface ConsentRecord {
  id: number;
  patient: string;
  initials: string;
  avatarColor: string;
  procedure: string;
  category: ProcedureCategory;
  sentTime: string;
  status: ConsentStatus;
  signedAt: string | null;
  signTimeMin: number | null;
  ipAddress: string;
}

interface Template {
  id: number;
  name: string;
  usedCount: number;
  lastEdited: string;
  content: string;
}

interface ArchiveRecord {
  id: number;
  patient: string;
  procedure: string;
  sentDate: string;
  signedDate: string;
  signTime: number;
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const CONSENT_RECORDS: ConsentRecord[] = [
  { id: 1,  patient: "Priya Sharma",  initials: "PS", avatarColor: "from-pink-500 to-rose-500",      procedure: "Minor Surgical Procedure", category: "surgical",    sentTime: "9:00 AM",  status: "Signed",  signedAt: "9:14 AM",   signTimeMin: 14, ipAddress: "103.21.xx.xx" },
  { id: 2,  patient: "Rahul Gupta",   initials: "RG", avatarColor: "from-blue-500 to-cyan-500",      procedure: "Endoscopy",                category: "diagnostic",  sentTime: "9:15 AM",  status: "Signed",  signedAt: "9:31 AM",   signTimeMin: 16, ipAddress: "106.67.xx.xx" },
  { id: 3,  patient: "Ananya Nair",   initials: "AN", avatarColor: "from-violet-500 to-purple-500",  procedure: "Dental Extraction",        category: "dental",      sentTime: "9:30 AM",  status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 4,  patient: "Vikram Patel",  initials: "VP", avatarColor: "from-emerald-500 to-teal-500",   procedure: "Lumbar Injection",         category: "therapeutic", sentTime: "10:00 AM", status: "Signed",  signedAt: "10:08 AM",  signTimeMin: 8, ipAddress: "49.36.xx.xx" },
  { id: 5,  patient: "Sunita Rao",    initials: "SR", avatarColor: "from-amber-500 to-orange-500",   procedure: "Blood Transfusion",        category: "therapeutic", sentTime: "10:15 AM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 6,  patient: "Karan Mehta",   initials: "KM", avatarColor: "from-slate-400 to-gray-500",     procedure: "Biopsy",                   category: "diagnostic",  sentTime: "10:30 AM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 7,  patient: "Deepa Singh",   initials: "DS", avatarColor: "from-fuchsia-500 to-pink-500",   procedure: "X-Ray (Contrast)",         category: "diagnostic",  sentTime: "11:00 AM", status: "Signed",  signedAt: "11:12 AM",  signTimeMin: 12, ipAddress: "117.55.xx.xx" },
  { id: 8,  patient: "Meera Joshi",   initials: "MJ", avatarColor: "from-cyan-500 to-sky-500",       procedure: "Physiotherapy Consent",    category: "therapeutic", sentTime: "11:15 AM", status: "Signed",  signedAt: "11:22 AM",  signTimeMin: 7, ipAddress: "122.161.xx.xx" },
  { id: 9,  patient: "Arjun Kumar",   initials: "AK", avatarColor: "from-green-500 to-emerald-500",  procedure: "Minor Surgical Procedure", category: "surgical",    sentTime: "11:30 AM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 10, patient: "Raj Verma",     initials: "RV", avatarColor: "from-indigo-500 to-violet-500",  procedure: "Dental Implant",           category: "dental",      sentTime: "12:00 PM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
  { id: 11, patient: "Kavya Reddy",   initials: "KR", avatarColor: "from-rose-500 to-red-500",       procedure: "Anesthesia Consent",       category: "surgical",    sentTime: "12:15 PM", status: "Signed",  signedAt: "12:19 AM",  signTimeMin: 4, ipAddress: "59.163.xx.xx" },
  { id: 12, patient: "Mohan Das",     initials: "MD", avatarColor: "from-teal-500 to-cyan-500",      procedure: "Endoscopy",                category: "diagnostic",  sentTime: "12:30 PM", status: "Pending", signedAt: null,        signTimeMin: null, ipAddress: "" },
];

const TEMPLATES_DATA: Template[] = [
  { id: 1, name: "Minor Surgical Procedure", usedCount: 34, lastEdited: "Apr 10", content: "I, the undersigned patient, hereby give my voluntary consent to undergo the minor surgical procedure as recommended by my treating physician at Reva Clinic.\n\nPROCEDURE DESCRIPTION\nThe procedure involves a minor surgical intervention under local anesthesia. The nature, purpose, and expected outcomes have been explained to me in detail.\n\nRISKS AND COMPLICATIONS\nI understand and accept the following potential risks:\n• Infection at the surgical site\n• Bleeding or hematoma formation\n• Allergic reaction to anesthesia\n• Scarring or keloid formation\n• Rare risk of nerve injury\n\nALTERNATIVES\nMy doctor has informed me of the following non-surgical alternatives that I have considered and declined.\n\nPATIENT RIGHTS\nI understand I have the right to withdraw consent at any time before the procedure begins. I may ask questions and receive clear answers. My personal health information will remain confidential." },
  { id: 2, name: "Dental Extraction",        usedCount: 28, lastEdited: "Mar 22", content: "I hereby consent to the dental extraction procedure recommended by my dental surgeon.\n\nPROCEDURE DESCRIPTION\nThe extraction involves removal of one or more teeth under local anesthesia. Pre-operative X-rays have been reviewed.\n\nRISKS AND COMPLICATIONS\n• Dry socket post-extraction\n• Temporary numbness (paresthesia)\n• Jaw stiffness or trismus\n• Infection requiring antibiotics\n• Sinus involvement (upper molars)\n\nALTERNATIVES\nRoot canal therapy or tooth restoration where clinically feasible.\n\nPATIENT RIGHTS\nPost-operative care instructions will be provided. I consent to being contacted for follow-up." },
  { id: 3, name: "Endoscopy",               usedCount: 19, lastEdited: "Apr 1",  content: "I consent to an endoscopic examination to evaluate my gastrointestinal or respiratory tract as advised by my gastroenterologist.\n\nPROCEDURE DESCRIPTION\nA flexible camera is inserted through natural body openings or a small incision under sedation to visualize internal structures.\n\nRISKS AND COMPLICATIONS\n• Reaction to sedation\n• Perforation (rare)\n• Bleeding if biopsy taken\n• Aspiration risk\n\nALTERNATIVES\nImaging studies (CT, MRI) as non-invasive alternatives.\n\nPATIENT RIGHTS\nResults will be communicated within 48 hours." },
  { id: 4, name: "Anesthesia Consent",      usedCount: 15, lastEdited: "Mar 15", content: "I consent to the administration of anesthesia during my scheduled procedure.\n\nPROCEDURE DESCRIPTION\nAnesthesia will be administered by a qualified anesthesiologist. Type of anesthesia: General / Local / Regional (as applicable).\n\nRISKS AND COMPLICATIONS\n• Nausea and vomiting\n• Allergic reaction\n• Respiratory complications\n• Dental damage\n• In rare cases: awareness under anesthesia\n\nALTERNATIVES\nModified anesthesia protocols based on patient history.\n\nPATIENT RIGHTS\nPre-anesthetic evaluation will be conducted. NPO instructions must be followed." },
  { id: 5, name: "Biopsy",                  usedCount: 12, lastEdited: "Apr 5",  content: "I consent to a biopsy procedure for tissue sample collection and pathological examination.\n\nPROCEDURE DESCRIPTION\nA tissue sample will be extracted from the specified site using needle aspiration or excisional technique under local anesthesia.\n\nRISKS AND COMPLICATIONS\n• Pain or discomfort\n• Bruising or bleeding\n• Infection\n• Inconclusive results requiring repeat biopsy\n\nALTERNATIVES\nImaging-based diagnosis where pathologically feasible.\n\nPATIENT RIGHTS\nResults will be shared with the treating physician within 5-7 working days." },
  { id: 6, name: "Blood Transfusion",       usedCount: 8,  lastEdited: "Feb 28", content: "I consent to receive a blood transfusion as medically necessary for my treatment.\n\nPROCEDURE DESCRIPTION\nBlood or blood components will be administered intravenously. All units are screened per NACO guidelines for HIV, Hepatitis B/C, Syphilis, and Malaria.\n\nRISKS AND COMPLICATIONS\n• Transfusion reaction (fever, chills)\n• Allergic reaction\n• Alloimmunization\n• Rarely: infection transmission despite screening\n• Volume overload in cardiac patients\n\nALTERNATIVES\nAutologous transfusion or pharmacological blood conservation where feasible.\n\nPATIENT RIGHTS\nRight to refuse transfusion. Right to know blood product type administered." },
];

const ARCHIVE_DATA: ArchiveRecord[] = [
  { id: 1,  patient: "Priya Sharma",  procedure: "Minor Surgical Procedure", sentDate: "Apr 24", signedDate: "Apr 24", signTime: 14 },
  { id: 2,  patient: "Rahul Gupta",   procedure: "Endoscopy",                sentDate: "Apr 24", signedDate: "Apr 24", signTime: 16 },
  { id: 3,  patient: "Vikram Patel",  procedure: "Lumbar Injection",         sentDate: "Apr 24", signedDate: "Apr 24", signTime: 8  },
  { id: 4,  patient: "Deepa Singh",   procedure: "X-Ray (Contrast)",         sentDate: "Apr 24", signedDate: "Apr 24", signTime: 12 },
  { id: 5,  patient: "Meera Joshi",   procedure: "Physiotherapy Consent",    sentDate: "Apr 24", signedDate: "Apr 24", signTime: 7  },
  { id: 6,  patient: "Kavya Reddy",   procedure: "Anesthesia Consent",       sentDate: "Apr 24", signedDate: "Apr 24", signTime: 4  },
  { id: 7,  patient: "Neha Sharma",   procedure: "Dental Extraction",        sentDate: "Apr 23", signedDate: "Apr 23", signTime: 9  },
  { id: 8,  patient: "Suresh Babu",   procedure: "Biopsy",                   sentDate: "Apr 23", signedDate: "Apr 23", signTime: 22 },
  { id: 9,  patient: "Preethi Rao",   procedure: "Endoscopy",                sentDate: "Apr 22", signedDate: "Apr 22", signTime: 11 },
  { id: 10, patient: "Amit Kapoor",   procedure: "Blood Transfusion",        sentDate: "Apr 22", signedDate: "Apr 22", signTime: 18 },
  { id: 11, patient: "Ravi Shankar",  procedure: "Anesthesia Consent",       sentDate: "Apr 21", signedDate: "Apr 21", signTime: 6  },
  { id: 12, patient: "Lakshmi Nair",  procedure: "Minor Surgical Procedure", sentDate: "Apr 21", signedDate: "Apr 21", signTime: 13 },
  { id: 13, patient: "Pooja Mehta",   procedure: "Dental Implant",           sentDate: "Apr 20", signedDate: "Apr 20", signTime: 15 },
  { id: 14, patient: "Dinesh Kumar",  procedure: "Lumbar Injection",         sentDate: "Apr 19", signedDate: "Apr 19", signTime: 10 },
  { id: 15, patient: "Geetha Balan",  procedure: "Biopsy",                   sentDate: "Apr 18", signedDate: "Apr 18", signTime: 20 },
];

const PROCEDURES = [
  "Minor Surgical Procedure",
  "Dental Extraction",
  "Endoscopy",
  "Anesthesia Consent",
  "Biopsy",
  "Blood Transfusion",
];

const PATIENTS = CONSENT_RECORDS.map((r) => r.patient);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function categoryColor(cat: ProcedureCategory) {
  switch (cat) {
    case "surgical":    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
    case "dental":      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
    case "diagnostic":  return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
    case "therapeutic": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  }
}

function categoryLabel(cat: ProcedureCategory) {
  switch (cat) {
    case "surgical":    return "Surgical";
    case "dental":      return "Dental";
    case "diagnostic":  return "Diagnostic";
    case "therapeutic": return "Therapeutic";
  }
}

// ─────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.35 } },
};

const staggerContainer = (stagger = 0.07) => ({
  show: { transition: { staggerChildren: stagger } },
});

const tabContent = {
  hidden: { opacity: 0, x: 20 },
  show:   { opacity: 1, x: 0, transition: { ease: "easeOut" as const, duration: 0.3 } },
  exit:   { opacity: 0, x: -20, transition: { ease: "easeOut" as const, duration: 0.2 } },
};

const expandAnim = {
  hidden: { height: 0, opacity: 0 },
  show:   { height: "auto", opacity: 1, transition: { ease: "easeOut" as const, duration: 0.3 } },
  exit:   { height: 0, opacity: 0, transition: { ease: "easeOut" as const, duration: 0.2 } },
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.95 },
  show:   { opacity: 1, scale: 1, transition: { ease: "easeOut" as const, duration: 0.25 } },
  exit:   { opacity: 0, scale: 0.95, transition: { ease: "easeOut" as const, duration: 0.15 } },
};

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({
  label,
  target,
  sub,
  accent,
  icon: Icon,
  delay,
  isTime,
}: {
  label: string;
  target: number;
  sub: string;
  accent: string;
  icon: React.ElementType;
  delay: number;
  isTime?: boolean;
}) {
  const val = useCountUp(target, 1200);
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-1"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={15} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white">
        {isTime ? `${val} min` : val}
      </div>
      <div className="text-xs text-slate-400">{sub}</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// CONSENT ROW
// ─────────────────────────────────────────────
function ConsentRow({
  record,
  index,
  addToast,
}: {
  record: ConsentRecord;
  index: number;
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [manualReason, setManualReason] = useState("");
  const [manualSigned, setManualSigned] = useState(false);
  const isPending = record.status === "Pending";

  const handleReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast(`Reminder sent to ${record.patient} via WhatsApp`, "info");
  };

  const handleManualSign = () => {
    if (!manualReason.trim()) {
      addToast("Please enter a reason for manual sign", "warn");
      return;
    }
    setManualSigned(true);
    addToast(`${record.patient} marked as manually signed`, "success");
  };

  return (
    <motion.div
      layout
      variants={fadeUp}
      className={`border border-white/[0.06] rounded-xl overflow-hidden transition-colors ${
        expanded ? "bg-white/[0.06]" : "bg-white/[0.02] hover:bg-white/[0.04]"
      }`}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer group"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${record.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {record.initials}
        </div>

        {/* Patient + procedure */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{record.patient}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400 truncate">{record.procedure}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${categoryColor(record.category)}`}>
              {categoryLabel(record.category)}
            </span>
          </div>
        </div>

        {/* Sent time */}
        <div className="text-xs text-slate-500 shrink-0 w-20 text-center">{record.sentTime}</div>

        {/* Status */}
        <div className="shrink-0 w-32 flex items-center justify-end gap-2">
          {isPending ? (
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs text-amber-400 font-medium">Pending</span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Signed</span>
              </div>
              <span className="text-[10px] text-slate-500">{record.signedAt}</span>
            </div>
          )}
        </div>

        {/* Action buttons — show on hover via group */}
        <div className="shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {isPending ? (
            <>
              <button
                onClick={handleReminder}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium"
              >
                Send Reminder
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
              >
                View Form
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium"
              >
                View Signed
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); addToast(`Downloading PDF for ${record.patient}`, "info"); }}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
              >
                Download PDF
              </button>
            </>
          )}
        </div>

        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-slate-500 shrink-0" />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            variants={expandAnim}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
              {isPending && !manualSigned ? (
                <div className="space-y-4">
                  {/* WhatsApp message preview */}
                  <div className="bg-[#075E54]/20 border border-[#075E54]/40 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={14} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">WhatsApp message sent at {record.sentTime}</span>
                    </div>
                    <div className="bg-[#DCF8C6]/10 border border-[#DCF8C6]/10 rounded-lg p-3 text-sm text-slate-300 leading-relaxed">
                      Hi {record.patient}, Dr. Sharma needs your consent before your{" "}
                      <span className="text-white font-medium">{record.procedure}</span> appointment today.
                      Please tap the link to read and sign digitally:{" "}
                      <span className="text-cyan-400 underline">reva.ai/consent/rnd8x2</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock size={12} className="text-amber-400" />
                      <span className="text-xs text-amber-400">Sent {record.sentTime} — no response yet</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToast(`Consent form resent to ${record.patient}`, "info")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors font-medium"
                    >
                      <RefreshCw size={12} /> Resend
                    </button>
                  </div>

                  {/* Manual sign fallback */}
                  <div className="border border-white/[0.08] rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-medium mb-2">Paper Fallback — Mark as Manually Signed</div>
                    <textarea
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      placeholder="Reason (e.g. patient signed physical form at reception)"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 resize-none outline-none focus:border-cyan-500/50 transition-colors"
                      rows={2}
                    />
                    <button
                      onClick={handleManualSign}
                      className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 text-slate-300 border border-white/[0.1] hover:text-white hover:bg-slate-700 transition-colors font-medium"
                    >
                      Mark Manually Signed
                    </button>
                  </div>
                </div>
              ) : !isPending ? (
                // Signed preview
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-emerald-500/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Reva Clinic · Digital Consent Form</div>
                        <div className="text-base font-semibold text-white">{record.procedure}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <CheckCircle size={12} />
                        Verified
                      </div>
                    </div>

                    <div className="border-t border-white/[0.06] pt-4 mt-4">
                      <div className="text-xs text-slate-500 mb-2">Patient Signature</div>
                      <div
                        className="text-2xl text-cyan-300 py-1"
                        style={{ fontFamily: "cursive", fontSize: "1.4rem" }}
                      >
                        {record.patient}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-500">Signed At</div>
                        <div className="text-white font-medium">{record.signedAt} · Apr 24, 2026</div>
                      </div>
                      <div>
                        <div className="text-slate-500">IP Address</div>
                        <div className="text-white font-medium">{record.ipAddress}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 border-t border-white/[0.06] pt-3">
                      <Shield size={11} className="text-cyan-400" />
                      Digitally signed via WhatsApp · Encrypted · Audit-logged
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToast(`Downloading signed form for ${record.patient}`, "info")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium"
                    >
                      <Download size={12} /> Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400 py-2">
                  <CheckCircle size={15} />
                  Manually marked as signed
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// TEMPLATE CARD
// ─────────────────────────────────────────────
function TemplateCard({
  template,
  onEdit,
  addToast,
}: {
  template: Template | null;
  onEdit: (t: Template) => void;
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}) {
  if (!template) {
    return (
      <motion.div
        variants={fadeUp}
        className="border border-dashed border-white/[0.12] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all group"
        onClick={() =>
          addToast("Template editor coming soon", "info")
        }
      >
        <div className="w-10 h-10 rounded-xl border border-dashed border-white/20 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
          <Plus size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
        <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors font-medium">New Template</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-colors group"
    >
      <div>
        <div className="text-sm font-semibold text-white mb-1">{template.name}</div>
        <div className="text-xs text-slate-400">
          Used {template.usedCount}× · Last edited {template.lastEdited}
        </div>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onEdit(template)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium"
        >
          <Edit3 size={11} /> Edit
        </button>
        <button
          onClick={() => addToast(`Previewing "${template.name}"`, "info")}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={() => addToast(`"${template.name}" duplicated`, "success")}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <Copy size={11} /> Duplicate
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// EDIT TEMPLATE MODAL
// ─────────────────────────────────────────────
function EditTemplateModal({
  template,
  onClose,
  onSave,
}: {
  template: Template;
  onClose: () => void;
  onSave: (t: Template) => void;
}) {
  const [name, setName] = useState(template.name);
  const [content, setContent] = useState(template.content);
  const [lang, setLang] = useState<"en" | "hi" | "hinglish">("en");

  const placeholderByLang = {
    en: "Type consent form content in English...",
    hi: "सहमति फ़ॉर्म की सामग्री हिंदी में टाइप करें...",
    hinglish: "Yahan consent form ka content Hinglish mein likho...",
  };

  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(5,7,20,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        variants={modalAnim}
        initial="hidden"
        animate="show"
        exit="exit"
        className="w-full max-w-2xl bg-[#0a0d1f] border border-white/[0.1] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="text-base font-semibold text-white">Edit Template</div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Template Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Language toggle */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Language</label>
            <div className="flex gap-2">
              {(["en", "hi", "hinglish"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                    lang === l
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      : "border-white/[0.1] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {l === "en" ? "English" : l === "hi" ? "Hindi" : "Hinglish"}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Consent Text</label>
            <textarea
              value={lang === "en" ? content : ""}
              onChange={(e) => lang === "en" && setContent(e.target.value)}
              placeholder={placeholderByLang[lang]}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none outline-none focus:border-cyan-500/50 transition-colors"
              rows={10}
            />
          </div>

          {/* Sections */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-2 block">Sections</label>
            <div className="flex flex-wrap gap-2">
              {["Procedure Description", "Risks", "Alternatives", "Patient Rights"].map((sec) => (
                <div
                  key={sec}
                  className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center gap-1.5"
                >
                  {sec}
                  <button className="text-violet-500 hover:text-rose-400 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-white/[0.12] text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors flex items-center gap-1">
                <Plus size={10} /> Add Section
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-xl border border-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...template, name, content })}
            className="text-sm px-5 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-medium"
          >
            Save Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ARCHIVE TAB
// ─────────────────────────────────────────────
function ArchiveTab({ addToast }: { addToast: (msg: string, type: "success" | "info" | "warn") => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "week" | "month" | string>("all");
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const filtered = ARCHIVE_DATA.filter((r) =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.procedure.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol || !sortDir) return 0;
    let va: string | number = "";
    let vb: string | number = "";
    if (sortCol === "patient")    { va = a.patient;    vb = b.patient; }
    if (sortCol === "procedure")  { va = a.procedure;  vb = b.procedure; }
    if (sortCol === "sentDate")   { va = a.sentDate;   vb = b.sentDate; }
    if (sortCol === "signedDate") { va = a.signedDate; vb = b.signedDate; }
    if (sortCol === "signTime")   { va = a.signTime;   vb = b.signTime; }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const paged = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ArrowUpDown size={10} className="text-slate-600" />;
    if (sortDir === "asc") return <ChevronUp size={10} className="text-cyan-400" />;
    if (sortDir === "desc") return <ChevronDown size={10} className="text-cyan-400" />;
    return <ArrowUpDown size={10} className="text-slate-600" />;
  };

  const th = "text-left text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-300 transition-colors select-none";

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient or procedure..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "week", "month"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors font-medium ${
                filter === f
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              {f === "all" ? "All" : f === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className={`${th} px-4 py-3`} onClick={() => toggleSort("patient")}>
                <div className="flex items-center gap-1">Patient <SortIcon col="patient" /></div>
              </th>
              <th className={`${th} px-4 py-3`} onClick={() => toggleSort("procedure")}>
                <div className="flex items-center gap-1">Procedure <SortIcon col="procedure" /></div>
              </th>
              <th className={`${th} px-4 py-3`} onClick={() => toggleSort("sentDate")}>
                <div className="flex items-center gap-1">Sent <SortIcon col="sentDate" /></div>
              </th>
              <th className={`${th} px-4 py-3`} onClick={() => toggleSort("signedDate")}>
                <div className="flex items-center gap-1">Signed <SortIcon col="signedDate" /></div>
              </th>
              <th className={`${th} px-4 py-3`} onClick={() => toggleSort("signTime")}>
                <div className="flex items-center gap-1">Sign Time <SortIcon col="signTime" /></div>
              </th>
              <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {paged.map((row, i) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white font-medium">{row.patient}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{row.procedure}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{row.sentDate}</td>
                  <td className="px-4 py-3 text-xs text-emerald-400 font-medium">{row.signedDate}</td>
                  <td className="px-4 py-3 text-xs text-violet-400 font-medium">{row.signTime} min</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => addToast(`Viewing signed form for ${row.patient}`, "info")}
                        className="text-[11px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/30 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => addToast(`Downloading PDF for ${row.patient}`, "info")}
                        className="text-[11px] px-2 py-1 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-xs text-slate-500">
            {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SEND CONSENT PANEL (right col)
// ─────────────────────────────────────────────
function SendConsentPanel({ addToast }: { addToast: (msg: string, type: "success" | "info" | "warn") => void }) {
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showPatientDrop, setShowPatientDrop] = useState(false);
  const [procedure, setProcedure] = useState("");
  const [urgency, setUrgency] = useState<"standard" | "urgent">("standard");

  const filteredPatients = PATIENTS.filter((p) =>
    p.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSend = () => {
    if (!selectedPatient || !procedure) {
      addToast("Please select a patient and procedure", "warn");
      return;
    }
    addToast(`Consent form sent to ${selectedPatient} via WhatsApp ✓`, "success");
    setSelectedPatient("");
    setPatientSearch("");
    setProcedure("");
    setUrgency("standard");
  };

  const displayPatient = selectedPatient || patientSearch;
  const displayProcedure = procedure || "[procedure]";

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-4">
      <div className="text-sm font-semibold text-white">Send Consent Form</div>

      {/* Patient search */}
      <div className="relative">
        <label className="text-xs text-slate-500 mb-1 block">Patient</label>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={selectedPatient || patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              setSelectedPatient("");
              setShowPatientDrop(true);
            }}
            onFocus={() => setShowPatientDrop(true)}
            onBlur={() => setTimeout(() => setShowPatientDrop(false), 150)}
            placeholder="Search patient..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <AnimatePresence>
          {showPatientDrop && filteredPatients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-20 top-full mt-1 w-full bg-[#0d1124] border border-white/[0.1] rounded-xl overflow-hidden shadow-xl"
            >
              {filteredPatients.slice(0, 6).map((p) => (
                <button
                  key={p}
                  onMouseDown={() => { setSelectedPatient(p); setPatientSearch(""); setShowPatientDrop(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Procedure */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Procedure</label>
        <select
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <option value="" className="bg-[#0d1124] text-slate-400">Select procedure...</option>
          {PROCEDURES.map((p) => (
            <option key={p} value={p} className="bg-[#0d1124] text-white">{p}</option>
          ))}
        </select>
      </div>

      {/* Urgency */}
      <div>
        <label className="text-xs text-slate-500 mb-1.5 block">Urgency</label>
        <div className="flex gap-2">
          {(["standard", "urgent"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUrgency(u)}
              className={`flex-1 text-xs py-2 rounded-xl border transition-colors font-medium ${
                urgency === u
                  ? u === "urgent"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              {u === "standard" ? "Standard" : "Urgent"}
            </button>
          ))}
        </div>
        {urgency === "urgent" && (
          <p className="text-[10px] text-amber-400 mt-1.5 flex items-center gap-1">
            <Zap size={10} /> Sends immediately + phone call note for doctor
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="bg-[#075E54]/10 border border-[#075E54]/30 rounded-xl p-3">
        <div className="text-[10px] text-emerald-400 font-medium mb-1.5 uppercase tracking-widest">Message Preview</div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Hi <span className="text-white">{displayPatient || "[patient]"}</span>, please sign the consent form for your{" "}
          <span className="text-white">{displayProcedure}</span> with Dr. Sharma before your appointment. Tap the link to read and sign:{" "}
          <span className="text-cyan-400">reva.ai/consent/...</span>
        </p>
      </div>

      {/* Send button */}
      <motion.button
        onClick={handleSend}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
      >
        <span className="flex items-center justify-center gap-2">
          <Send size={14} /> Send via WhatsApp
        </span>
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ConsentView({ addToast }: ConsentViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("queue");
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES_DATA);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleSaveTemplate = (updated: Template) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTemplate(null);
    addToast(`Template "${updated.name}" saved`, "success");
  };

  const pendingCount = CONSENT_RECORDS.filter((r) => r.status === "Pending").length;

  return (
    <div className="min-h-screen" style={{ background: "#050714" }}>
      <div className="p-6 space-y-6">

        {/* ── STAT CARDS ── */}
        <motion.div
          className="grid grid-cols-4 gap-4"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="show"
        >
          <StatCard label="Forms Sent"           target={156} sub="This month"   accent="bg-cyan-500/20 text-cyan-400"    icon={FileText}   delay={0} />
          <StatCard label="Signed"               target={148} sub="94.9% rate"   accent="bg-emerald-500/20 text-emerald-400" icon={CheckCircle} delay={1} />
          <StatCard label="Awaiting Signature"   target={8}   sub="Today"        accent="bg-amber-500/20 text-amber-400"  icon={Clock}      delay={2} />
          <StatCard label="Avg Sign Time"        target={11}  sub="Per patient"  accent="bg-violet-500/20 text-violet-400" icon={TrendingUp}  delay={3} isTime />
        </motion.div>

        {/* ── TWO-COL LAYOUT ── */}
        <div className="flex gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Tab bar */}
            <div className="relative flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1">
              {(["queue", "templates", "archive"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors z-10 ${
                    activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-white/[0.07] rounded-xl"
                    />
                  )}
                  <span className="relative z-10">
                    {tab === "queue" ? "Consent Queue" : tab === "templates" ? "Form Templates" : "Signed Archive"}
                  </span>
                  {tab === "queue" && pendingCount > 0 && (
                    <span className="relative z-10 ml-2 text-[10px] bg-amber-500/30 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "queue" && (
                <motion.div
                  key="queue"
                  variants={tabContent}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">Today's consent queue</span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
                      {pendingCount} awaiting signature
                    </span>
                  </div>
                  <motion.div
                    className="space-y-2"
                    variants={staggerContainer(0.05)}
                    initial="hidden"
                    animate="show"
                  >
                    {CONSENT_RECORDS.map((record, i) => (
                      <ConsentRow key={record.id} record={record} index={i} addToast={addToast} />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "templates" && (
                <motion.div
                  key="templates"
                  variants={tabContent}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    variants={staggerContainer(0.07)}
                    initial="hidden"
                    animate="show"
                  >
                    {templates.map((t) => (
                      <TemplateCard key={t.id} template={t} onEdit={setEditingTemplate} addToast={addToast} />
                    ))}
                    <TemplateCard template={null} onEdit={() => {}} addToast={addToast} />
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "archive" && (
                <motion.div
                  key="archive"
                  variants={tabContent}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <ArchiveTab addToast={addToast} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-[360px] shrink-0 space-y-4">

            {/* Send Consent Panel */}
            <SendConsentPanel addToast={addToast} />

            {/* Insights */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="text-sm font-semibold text-white mb-1">Insights</div>
              <div className="border-l-2 border-emerald-500 pl-3 py-1">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Zap size={11} /> Fastest Signer
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Kavya Reddy signed in 4 minutes — new record</div>
              </div>
              <div className="border-l-2 border-amber-500 pl-3 py-1">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <TrendingDown size={11} /> Slowest Category
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Blood Transfusion avg 18 min — consider simplifying</div>
              </div>
              <div className="border-l-2 border-violet-500 pl-3 py-1">
                <div className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                  <TrendingUp size={11} /> Peak Signing Time
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Most patients sign between 9–10 AM</div>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Shield size={14} className="text-cyan-400" />
                </div>
                <div className="text-sm font-semibold text-white">HIPAA-aligned digital consent</div>
              </div>
              <ul className="space-y-2">
                {[
                  "All signatures timestamped + IP logged",
                  "Stored encrypted for 7 years",
                  "Audit trail available on request",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check size={11} className="text-cyan-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => addToast("Generating compliance report...", "info")}
                className="mt-4 w-full text-xs py-2 rounded-xl border border-white/[0.1] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors font-medium"
              >
                Generate Compliance Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <EditTemplateModal
            key="edit-modal"
            template={editingTemplate}
            onClose={() => setEditingTemplate(null)}
            onSave={handleSaveTemplate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
