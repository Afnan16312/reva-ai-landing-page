"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useCountUp } from "@/lib/utils";
import {
  UploadCloud,
  Search,
  Filter,
  ChevronDown,
  Send,
  Eye,
  Flag,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  X,
  CheckSquare,
  Square,
  Clock,
  TrendingUp,
  Activity,
  Inbox,
} from "lucide-react";

interface LabReportsViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

interface Report {
  id: number;
  patient: string;
  age: number;
  test: string;
  date: string;
  status: "Delivered" | "Pending";
  flagged: boolean;
  notes: string;
  phone: string;
}

const INITIAL_REPORTS: Report[] = [
  { id: 1, patient: "Priya Sharma", age: 34, test: "CBC", date: "Apr 24", status: "Delivered", flagged: false, notes: "WBC slightly elevated", phone: "+91 98765 43210" },
  { id: 2, patient: "Rahul Gupta", age: 45, test: "Lipid Profile", date: "Apr 24", status: "Pending", flagged: false, notes: "", phone: "+91 87654 32109" },
  { id: 3, patient: "Ananya Nair", age: 29, test: "HbA1c", date: "Apr 23", status: "Delivered", flagged: true, notes: "HbA1c 8.2 — above normal", phone: "+91 76543 21098" },
  { id: 4, patient: "Vikram Patel", age: 52, test: "LFT", date: "Apr 23", status: "Delivered", flagged: false, notes: "", phone: "+91 65432 10987" },
  { id: 5, patient: "Sunita Rao", age: 41, test: "Blood Sugar Fast", date: "Apr 23", status: "Pending", flagged: false, notes: "", phone: "+91 54321 09876" },
  { id: 6, patient: "Karan Mehta", age: 38, test: "TSH", date: "Apr 22", status: "Delivered", flagged: true, notes: "TSH 6.8 — subclinical hypothyroid", phone: "+91 43210 98765" },
  { id: 7, patient: "Deepa Singh", age: 26, test: "Urine Routine", date: "Apr 22", status: "Delivered", flagged: false, notes: "", phone: "+91 32109 87654" },
  { id: 8, patient: "Meera Joshi", age: 60, test: "Chest X-Ray", date: "Apr 21", status: "Delivered", flagged: false, notes: "Mild cardiomegaly noted", phone: "+91 21098 76543" },
  { id: 9, patient: "Arjun Kumar", age: 47, test: "ECG", date: "Apr 21", status: "Delivered", flagged: false, notes: "", phone: "+91 10987 65432" },
  { id: 10, patient: "Priya Sharma", age: 34, test: "Lipid Profile", date: "Apr 20", status: "Delivered", flagged: false, notes: "", phone: "+91 98765 43210" },
  { id: 11, patient: "Rahul Gupta", age: 45, test: "RFT", date: "Apr 20", status: "Delivered", flagged: false, notes: "", phone: "+91 87654 32109" },
  { id: 12, patient: "Ananya Nair", age: 29, test: "CBC", date: "Apr 19", status: "Delivered", flagged: false, notes: "", phone: "+91 76543 21098" },
  { id: 13, patient: "Vikram Patel", age: 52, test: "HbA1c", date: "Apr 19", status: "Delivered", flagged: true, notes: "HbA1c 7.9 — borderline", phone: "+91 65432 10987" },
  { id: 14, patient: "Sunita Rao", age: 41, test: "Lipid Profile", date: "Apr 18", status: "Delivered", flagged: false, notes: "", phone: "+91 54321 09876" },
  { id: 15, patient: "Karan Mehta", age: 38, test: "Blood Sugar PP", date: "Apr 18", status: "Delivered", flagged: false, notes: "", phone: "+91 43210 98765" },
];

const PENDING_REPORTS = [
  { id: 2, patient: "Rahul Gupta", test: "Lipid Profile", uploadedAt: "Apr 24 · 2:30 PM", timeAgo: "3 hrs ago" },
  { id: 5, patient: "Sunita Rao", test: "Blood Sugar Fast", uploadedAt: "Apr 23 · 11:15 AM", timeAgo: "1 day ago" },
  { id: 16, patient: "Neha Verma", test: "Thyroid Panel", uploadedAt: "Apr 24 · 9:00 AM", timeAgo: "6 hrs ago" },
  { id: 17, patient: "Amit Desai", test: "Kidney Function", uploadedAt: "Apr 24 · 10:45 AM", timeAgo: "4 hrs ago" },
  { id: 18, patient: "Pooja Iyer", test: "Iron Studies", uploadedAt: "Apr 23 · 3:00 PM", timeAgo: "23 hrs ago" },
];

const FLAGGED_REPORTS = [
  { id: 3, patient: "Ananya Nair", test: "HbA1c", note: "HbA1c 8.2 — above normal" },
  { id: 6, patient: "Karan Mehta", test: "TSH", note: "TSH 6.8 — subclinical hypothyroid" },
  { id: 13, patient: "Vikram Patel", test: "HbA1c", note: "HbA1c 7.9 — borderline" },
];

const DAILY_DELIVERIES = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 9 },
  { day: "Thu", count: 21 },
  { day: "Fri", count: 8 },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarGradient(name: string) {
  const gradients = [
    "from-cyan-500 to-violet-600",
    "from-emerald-500 to-cyan-600",
    "from-violet-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeOut" as const } },
};

const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

function StatCard({
  label,
  value,
  suffix,
  sub,
  color,
  icon,
  index,
}: {
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  index: number;
}) {
  const count = useCountUp(value);
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 font-medium uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-xl bg-white/[0.05] ${color}`}>{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${color}`}>
          {count}{suffix}
        </span>
        {sub && <span className="text-xs text-white/40 mb-1">{sub}</span>}
      </div>
    </motion.div>
  );
}

function UploadZone({
  onUpload,
  uploading,
  uploadProgress,
}: {
  onUpload: () => void;
  uploading: boolean;
  uploadProgress: number;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <motion.div
      whileHover={{ borderColor: "rgba(6,182,212,0.6)", backgroundColor: "rgba(6,182,212,0.03)" }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onUpload(); }}
      onClick={onUpload}
      className="relative border-2 border-dashed border-cyan-500/30 rounded-2xl h-28 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-200 overflow-hidden"
      style={{ backgroundColor: dragging ? "rgba(6,182,212,0.05)" : undefined }}
    >
      {uploading ? (
        <div className="w-full px-8 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Uploading report...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
              style={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </div>
      ) : (
        <>
          <UploadCloud className="w-6 h-6 text-cyan-400/70" />
          <p className="text-sm text-white/50 font-medium">Drop lab reports here or click to upload</p>
          <p className="text-xs text-white/30">PDF, JPG, PNG — max 10MB</p>
        </>
      )}
    </motion.div>
  );
}

function ReportRow({
  report,
  index,
  selected,
  onSelect,
  onSend,
  onFlag,
  addToast,
}: {
  report: Report;
  index: number;
  selected: boolean;
  onSelect: (id: number) => void;
  onSend: (report: Report) => void;
  onFlag: (id: number) => void;
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState(report.notes || "Results within normal range");
  const [reviewed, setReviewed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const whatsappMsg = `Hi ${report.patient.split(" ")[0]}, your ${report.test} report from Dr. Sharma's Clinic is ready. ${noteText}. Please consult your doctor if you have questions.`;

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      layout
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        <div onClick={(e) => { e.stopPropagation(); onSelect(report.id); }} className="flex-shrink-0">
          {selected ? (
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          ) : (
            <Square className="w-4 h-4 text-white/20" />
          )}
        </div>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(report.patient)} flex items-center justify-center flex-shrink-0`}>
          <span className="text-xs font-bold text-white">{getInitials(report.patient)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{report.patient}</p>
          <p className="text-xs text-white/40">{report.test} · {report.date}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {report.flagged && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Abnormal
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            report.status === "Delivered"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
          }`}>
            {report.status}
          </span>
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15, ease: "easeOut" as const }}
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { onSend(report); }}
                  className="text-xs px-2 py-1 rounded-lg bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/25 transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> Send
                </button>
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onFlag(report.id)}
                  className={`p-1.5 rounded-lg transition-colors ${report.flagged ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-white/40 hover:text-rose-400"}`}
                >
                  <Flag className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-white/30 mb-0.5">Patient</p>
                  <p className="text-white font-medium">{report.patient}, {report.age}y</p>
                </div>
                <div>
                  <p className="text-white/30 mb-0.5">Test</p>
                  <p className="text-white font-medium">{report.test}</p>
                </div>
                <div>
                  <p className="text-white/30 mb-0.5">Ordered by</p>
                  <p className="text-white font-medium">Dr. Sharma</p>
                </div>
              </div>

              {report.flagged && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300">⚠ Abnormal values detected — review recommended</p>
                </div>
              )}

              <div>
                <p className="text-xs text-white/30 mb-1.5">Report Summary</p>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white/80 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
                  rows={2}
                />
              </div>

              <div className="p-3 rounded-xl bg-[#25D366]/5 border border-[#25D366]/15">
                <p className="text-xs text-white/30 mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-[#25D366]" /> WhatsApp Message Preview
                </p>
                <p className="text-xs text-white/60 leading-relaxed">{whatsappMsg}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSend(report);
                    setExpanded(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30 transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Send to Patient via WhatsApp
                </button>
                <button
                  onClick={() => addToast("Doctor's note saved", "info")}
                  className="px-3 py-2 rounded-xl bg-white/5 text-white/40 border border-white/10 hover:text-white hover:bg-white/10 transition-colors text-xs"
                >
                  Add Doctor's Note
                </button>
                <button
                  onClick={() => setReviewed((r) => !r)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-colors ${reviewed ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20" : "bg-white/5 text-white/40 border-white/10"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> {reviewed ? "Reviewed" : "Mark Reviewed"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DeliveryGauge({ percent }: { percent: number }) {
  const controls = useAnimation();
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (percent / 100) * circumference;

  useEffect(() => {
    controls.start({ strokeDashoffset: dashoffset });
  }, [controls, dashoffset]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={controls}
            transition={{ duration: 1.2, ease: "easeOut" as const }}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{percent}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-0.5">WhatsApp Delivery Rate</p>
        <p className="text-xs text-white/40">89 of 94 reports delivered</p>
        <p className="text-xs text-emerald-400 mt-1">↑ 3% vs last month</p>
      </div>
    </div>
  );
}

function MiniBarChart() {
  const maxCount = Math.max(...DAILY_DELIVERIES.map((d) => d.count));
  return (
    <div className="flex items-end gap-2 h-14">
      {DAILY_DELIVERIES.map((d, i) => (
        <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full relative" style={{ height: "40px" }}>
            <motion.div
              className="absolute bottom-0 w-full rounded-t-sm bg-gradient-to-t from-cyan-500/60 to-violet-500/60"
              initial={{ height: 0 }}
              animate={{ height: `${(d.count / maxCount) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }}
            />
          </div>
          <span className="text-[10px] text-white/30">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function LabReportsView({ addToast }: LabReportsViewProps) {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [pendingList, setPendingList] = useState(PENDING_REPORTS);
  const [flaggedList, setFlaggedList] = useState(FLAGGED_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Delivered" | "Flagged">("All");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleUpload = useCallback(() => {
    if (uploading) return;
    setUploading(true);
    setUploadProgress(0);
    let progress = 0;
    uploadIntervalRef.current = setInterval(() => {
      progress += 100 / 30;
      setUploadProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(uploadIntervalRef.current!);
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          const newReport: Report = {
            id: Date.now(),
            patient: "Neha Verma",
            age: 31,
            test: "Thyroid Panel",
            date: "Apr 24",
            status: "Pending",
            flagged: false,
            notes: "",
            phone: "+91 99887 76655",
          };
          setReports((prev) => [newReport, ...prev]);
          addToast("Report uploaded — patient notified via WhatsApp ✓", "success");
        }, 200);
      }
    }, 50);
  }, [uploading, addToast]);

  useEffect(() => {
    return () => { if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current); };
  }, []);

  const handleSend = (report: Report) => {
    addToast(`Report sent to ${report.patient} via WhatsApp ✓`, "success");
    setReports((prev) =>
      prev.map((r) => r.id === report.id ? { ...r, status: "Delivered" as const } : r)
    );
    setPendingList((prev) => prev.filter((p) => p.id !== report.id));
  };

  const handleFlag = (id: number) => {
    setReports((prev) =>
      prev.map((r) => r.id === id ? { ...r, flagged: !r.flagged } : r)
    );
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkSend = () => {
    addToast(`${selectedIds.length} reports sent via WhatsApp ✓`, "success");
    setSelectedIds([]);
  };

  const handleBulkReview = () => {
    addToast(`${selectedIds.length} reports marked as reviewed`, "success");
    setSelectedIds([]);
  };

  const handleSendPending = (id: number) => {
    const report = pendingList.find((p) => p.id === id);
    if (report) {
      setPendingList((prev) => prev.filter((p) => p.id !== id));
      addToast(`Report sent to ${report.patient} via WhatsApp ✓`, "success");
    }
  };

  const handleSendAllPending = () => {
    setPendingList([]);
    addToast("All pending reports sent via WhatsApp ✓", "success");
  };

  const handleReviewFlagged = (id: number) => {
    setFlaggedList((prev) => prev.filter((f) => f.id !== id));
    addToast("Marked as reviewed", "success");
  };

  const filteredReports = reports
    .filter((r) => {
      const q = searchQuery.toLowerCase();
      if (q && !r.patient.toLowerCase().includes(q) && !r.test.toLowerCase().includes(q)) return false;
      if (filterStatus === "Pending" && r.status !== "Pending") return false;
      if (filterStatus === "Delivered" && r.status !== "Delivered") return false;
      if (filterStatus === "Flagged" && !r.flagged) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "Patient A-Z") return a.patient.localeCompare(b.patient);
      if (sortOrder === "Oldest First") return a.id - b.id;
      return b.id - a.id;
    });

  const filterPills = (["All", "Pending", "Delivered", "Flagged"] as const);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Reports This Month" value={94} color="text-cyan-400" icon={<Activity className="w-4 h-4" />} index={0} />
        <StatCard label="Delivered via WhatsApp" value={89} sub="94% delivery" color="text-emerald-400" icon={<MessageCircle className="w-4 h-4" />} index={1} />
        <StatCard label="Awaiting Delivery" value={5} color="text-amber-400" icon={<Clock className="w-4 h-4" />} index={2} />
        <StatCard label="Avg Delivery Time" value={4} suffix=" min" color="text-violet-400" icon={<TrendingUp className="w-4 h-4" />} index={3} />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* LEFT COL */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Upload Zone */}
          <UploadZone onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} />

          {/* Filter + Search */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient or test..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-1">
                {filterPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setFilterStatus(pill)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filterStatus === pill
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-white/[0.03] text-white/40 border border-white/[0.08] hover:text-white/70"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown((s) => !s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <Filter className="w-3 h-3" /> {sortOrder} <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" as const }}
                      className="absolute right-0 top-full mt-1 bg-[#0d1017] border border-white/[0.1] rounded-xl overflow-hidden z-20 min-w-[160px]"
                    >
                      {["Newest First", "Oldest First", "Patient A-Z"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setSortOrder(opt); setShowSortDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors ${sortOrder === opt ? "text-cyan-400 bg-cyan-500/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl"
              >
                <span className="text-xs text-white/50 flex-1">{selectedIds.length} selected</span>
                <button onClick={handleBulkSend} className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30 transition-colors">Send All via WhatsApp</button>
                <button onClick={handleBulkReview} className="text-xs px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/30 transition-colors">Mark All Reviewed</button>
                <button onClick={() => setSelectedIds([])} className="p-1 text-white/30 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            <AnimatePresence>
              {filteredReports.map((report, i) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  index={i}
                  selected={selectedIds.includes(report.id)}
                  onSelect={handleSelect}
                  onSend={handleSend}
                  onFlag={handleFlag}
                  addToast={addToast}
                />
              ))}
            </AnimatePresence>
            {filteredReports.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <Inbox className="w-8 h-8 mb-2" />
                <p className="text-sm">No reports match your filter</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COL */}
        <div className="w-[360px] flex flex-col gap-4 flex-shrink-0">
          {/* Pending Delivery */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Pending Delivery
              </h3>
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{pendingList.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {pendingList.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeOut" as const } }}
                    transition={{ duration: 0.25, ease: "easeOut" as const }}
                    className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarGradient(p.patient)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-bold text-white">{getInitials(p.patient)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{p.patient}</p>
                      <p className="text-[10px] text-white/40 truncate">{p.test} · {p.uploadedAt}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">{p.timeAgo}</span>
                      <button
                        onClick={() => handleSendPending(p.id)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Send Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {pendingList.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-400 text-center py-2"
                >
                  ✓ All reports delivered
                </motion.p>
              )}
            </div>
            {pendingList.length > 0 && (
              <button
                onClick={handleSendAllPending}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
              >
                Send All Pending ({pendingList.length})
              </button>
            )}
          </div>

          {/* Flagged Reports */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Flagged Reports
              </h3>
              <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">{flaggedList.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {flaggedList.map((f, i) => (
                  <motion.div
                    key={f.id}
                    custom={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.25, ease: "easeOut" as const } }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeOut" as const } }}
                    layout
                    className="flex items-start gap-2.5 p-2.5 rounded-xl border-l-2 border-rose-500/50 bg-rose-500/5 border border-rose-500/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{f.patient}</p>
                      <p className="text-[10px] text-white/40">{f.test}</p>
                      <p className="text-[10px] text-rose-300/70 mt-0.5">{f.note}</p>
                    </div>
                    <button
                      onClick={() => handleReviewFlagged(f.id)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/40 border border-white/10 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/20 transition-colors flex-shrink-0"
                    >
                      Review
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {flaggedList.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" as const }}
                    className="flex items-center gap-2 justify-center py-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-emerald-400">All flagged reports reviewed</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Delivery Stats */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-4 flex-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Delivery Stats
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50">Today:</span>
              <span className="text-emerald-400 font-medium">8 sent</span>
              <span className="text-white/20">·</span>
              <span className="text-amber-400 font-medium">2 pending</span>
            </div>
            <div>
              <p className="text-[10px] text-white/30 mb-2 uppercase tracking-widest">This Week</p>
              <MiniBarChart />
            </div>
            <DeliveryGauge percent={94} />
          </div>
        </div>
      </div>
    </div>
  );
}
