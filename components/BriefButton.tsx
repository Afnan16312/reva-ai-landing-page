"use client";

import { motion } from "framer-motion";

interface BriefButtonProps {
  patientName: string;
  onViewBrief: () => void;
  submitted: boolean;
}

export default function BriefButton({ patientName, onViewBrief, submitted }: BriefButtonProps) {
  if (!submitted) {
    return (
      <div className="inline-flex items-center gap-1.5 border border-white/[0.05] text-slate-600 text-xs rounded-lg px-3 py-1.5 cursor-default select-none">
        <span>⏳</span>
        <span>Brief pending</span>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onViewBrief}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 border border-cyan-500/30 text-cyan-400 text-xs font-medium rounded-lg px-3 py-1.5 transition-all"
    >
      {/* Pulse dot */}
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
      </span>
      <span>📋 AI Brief</span>
    </motion.button>
  );
}
