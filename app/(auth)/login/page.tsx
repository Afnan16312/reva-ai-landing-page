"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
        });
        if (error) throw error;

        // Create clinic row
        if (data.user) {
          await supabase.from("reva_clinics").insert({
            owner_id: data.user.id,
            name: clinicName || "My Clinic",
          });
        }

        setSuccess("Check your email to confirm your account, then log in.");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050714] flex items-center justify-center px-4"
      style={{ backgroundImage: "radial-gradient(ellipse at top, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(139,92,246,0.08) 0%, transparent 60%)" }}>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Reva <span className="text-cyan-400">AI</span></span>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl">
          {/* Tab */}
          <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300"}`}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-rose-400 text-xs mb-4 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-emerald-400 text-xs mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  <label className="block text-slate-400 text-xs mb-1.5">Clinic Name</label>
                  <input value={clinicName} onChange={e => setClinicName(e.target.value)}
                    placeholder="Dr. Sharma's Clinic"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="doctor@clinic.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-10 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 mt-2">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {mode === "login" && (
            <p className="text-center text-slate-600 text-xs mt-4">
              Don&apos;t have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign up free
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          AI Receptionist for Indian Clinics · Trusted by 200+ doctors
        </p>
      </motion.div>
    </div>
  );
}
