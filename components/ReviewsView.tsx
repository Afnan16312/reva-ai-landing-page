"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare, TrendingUp, Users, ThumbsUp, BarChart3, ExternalLink, RefreshCw, CheckCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string;
  rating: number;
  comment: string | null;
  reply_text: string | null;
  replied_at: string | null;
  created_at: string;
  patient: { name: string; phone: string } | null;
}

interface ReviewsViewProps {
  clinicId: string;
}

const AVATAR_COLORS = [
  "from-purple-500 to-violet-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-purple-600",
];

const MOCK_REVIEWS: Review[] = [
  { id: "r1", clinic_id: "", patient_id: "p1", rating: 5, comment: "Dr. Sharma was incredibly thorough and explained everything clearly. The staff was very friendly and the clinic was spotless. Highly recommend!", reply_text: "Thank you so much for your kind words! We're thrilled you had a great experience.", replied_at: "2026-04-20T10:00:00Z", created_at: "2026-04-19T14:30:00Z", appointment_id: "a1", patient: { name: "Priya Mehta", phone: "+919876543210" } },
  { id: "r2", clinic_id: "", patient_id: "p2", rating: 5, comment: "Got my reports same day, consultation was detailed. Will definitely come back.", reply_text: null, replied_at: null, created_at: "2026-04-18T11:00:00Z", appointment_id: "a2", patient: { name: "Rahul Singh", phone: "+919876543211" } },
  { id: "r3", clinic_id: "", patient_id: "p3", rating: 4, comment: "Good experience overall. Slight wait time but the doctor was very attentive.", reply_text: "Thank you for the feedback, Arjun! We're working on reducing wait times.", replied_at: "2026-04-17T09:00:00Z", created_at: "2026-04-16T16:45:00Z", appointment_id: "a3", patient: { name: "Arjun Kapoor", phone: "+919876543212" } },
  { id: "r4", clinic_id: "", patient_id: "p4", rating: 5, comment: "Best clinic in the area. The WhatsApp booking system is so convenient!", reply_text: null, replied_at: null, created_at: "2026-04-15T13:20:00Z", appointment_id: "a4", patient: { name: "Sneha Patel", phone: "+919876543213" } },
  { id: "r5", clinic_id: "", patient_id: "p5", rating: 3, comment: "Average experience. Doctor was okay but the clinic could be cleaner.", reply_text: null, replied_at: null, created_at: "2026-04-14T10:10:00Z", appointment_id: "a5", patient: { name: "Vikram Joshi", phone: "+919876543214" } },
  { id: "r6", clinic_id: "", patient_id: "p6", rating: 5, comment: "Amazing experience! Dr. Kumar spent 40 minutes understanding my condition. Truly patient-first approach.", reply_text: "We're so glad Dr. Kumar could help! Your health is our priority.", replied_at: "2026-04-13T14:00:00Z", created_at: "2026-04-12T09:30:00Z", appointment_id: "a6", patient: { name: "Ananya Krishnan", phone: "+919876543215" } },
  { id: "r7", clinic_id: "", patient_id: "p7", rating: 4, comment: "Very professional staff. The online reports system is a great touch.", reply_text: null, replied_at: null, created_at: "2026-04-11T15:40:00Z", appointment_id: "a7", patient: { name: "Kiran Reddy", phone: "+919876543216" } },
  { id: "r8", clinic_id: "", patient_id: "p8", rating: 2, comment: "Had to wait 1.5 hours past my appointment time. Not acceptable.", reply_text: "We sincerely apologize for the wait, Deepak. We had an emergency case that day. Please DM us and we'll make it right.", replied_at: "2026-04-10T11:00:00Z", created_at: "2026-04-09T17:00:00Z", appointment_id: "a8", patient: { name: "Deepak Nair", phone: "+919876543217" } },
  { id: "r9", clinic_id: "", patient_id: "p9", rating: 5, comment: "Excellent diagnosis. The follow-up WhatsApp message was a nice personal touch.", reply_text: null, replied_at: null, created_at: "2026-04-08T12:15:00Z", appointment_id: "a9", patient: { name: "Meera Agarwal", phone: "+919876543218" } },
  { id: "r10", clinic_id: "", patient_id: "p10", rating: 5, comment: "State of the art equipment and a very calm atmosphere. Felt reassured throughout.", reply_text: "Thank you, Rohan! Creating a calming environment is something we really care about.", replied_at: "2026-04-07T10:30:00Z", created_at: "2026-04-06T14:00:00Z", appointment_id: "a10", patient: { name: "Rohan Verma", phone: "+919876543219" } },
  { id: "r11", clinic_id: "", patient_id: "p11", rating: 4, comment: "Good clinic. Parking could be better but services are top notch.", reply_text: null, replied_at: null, created_at: "2026-04-05T11:20:00Z", appointment_id: "a11", patient: { name: "Pooja Sharma", phone: "+919876543220" } },
  { id: "r12", clinic_id: "", patient_id: "p12", rating: 5, comment: "My whole family comes here now. The trust is built over years of excellent care.", reply_text: null, replied_at: null, created_at: "2026-04-04T16:10:00Z", appointment_id: "a12", patient: { name: "Suresh Kumar", phone: "+919876543221" } },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${sizes[size]} ${s <= rating ? "text-amber-400" : "text-white/10"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function useInViewAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function ReviewsView({ clinicId }: ReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "5" | "4" | "3" | "2" | "1" | "unreplied">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const statsRef = useInViewAnimation();
  const distRef = useInViewAnimation();

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("reva_reviews")
          .select("*, patient:reva_patients(name, phone)")
          .eq("clinic_id", clinicId)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) setReviews(data as Review[]);
      } catch {
        // use mock data
      } finally {
        setLoading(false);
      }
    }
    load();
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [clinicId]);

  const totalReviews = reviews.length;
  const avgRating = totalReviews ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const positivePct = totalReviews ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const repliedCount = reviews.filter(r => r.replied_at).length;
  const responseRate = totalReviews ? Math.round((repliedCount / totalReviews) * 100) : 0;
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: totalReviews ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0,
  }));

  const filteredReviews = reviews.filter(r => {
    if (activeTab === "all") return true;
    if (activeTab === "unreplied") return !r.replied_at;
    return r.rating === Number(activeTab);
  });

  async function submitReply(reviewId: string) {
    const text = replyTexts[reviewId]?.trim();
    if (!text) return;
    setSubmitting(reviewId);

    // In demo mode, update local state immediately
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply_text: text, replied_at: new Date().toISOString() } : r));
      setReplyingTo(null);
      setReplyTexts(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
      showToast("Reply posted successfully!", "success");
      setSubmitting(null);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("reva_reviews")
        .update({ reply_text: text, replied_at: new Date().toISOString() })
        .eq("id", reviewId);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply_text: text, replied_at: new Date().toISOString() } : r));
      setReplyingTo(null);
      setReplyTexts(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
      showToast("Reply posted successfully!", "success");
    } catch {
      showToast("Failed to post reply. Please try again.", "error");
    } finally {
      setSubmitting(null);
    }
  }

  const TABS = [
    { key: "all", label: "All" },
    { key: "5", label: "5★" },
    { key: "4", label: "4★" },
    { key: "3", label: "3★" },
    { key: "2", label: "2★" },
    { key: "1", label: "1★" },
    { key: "unreplied", label: "Unreplied" },
  ] as const;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
            <div className="h-3 bg-white/[0.06] rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/20 border-red-500/30 text-red-300"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews & Reputation</h1>
          <p className="text-sm text-white/40 mt-1">Manage patient feedback and drive more Google reviews</p>
        </div>
        <motion.a
          href="#"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View on Google
        </motion.a>
      </div>

      {/* Stats row */}
      <div ref={statsRef.ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Star, label: "Average Rating", value: avgRating.toFixed(1), sub: "out of 5.0", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20", text: "text-amber-400" },
          { icon: Users, label: "Total Reviews", value: totalReviews.toString(), sub: "all time", color: "from-purple-500/20 to-violet-500/10", border: "border-purple-500/20", text: "text-purple-400" },
          { icon: ThumbsUp, label: "Positive Rate", value: `${positivePct}%`, sub: "4★ and above", color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
          { icon: MessageSquare, label: "Response Rate", value: `${responseRate}%`, sub: `${repliedCount} replied`, color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", text: "text-blue-400" },
        ].map(({ icon: Icon, label, value, sub, color, border, text }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={statsRef.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" as const }}
            className={`rounded-2xl bg-gradient-to-br ${color} border ${border} p-5`}
          >
            <div className={`w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center mb-3 ${text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className={`text-2xl font-bold ${text}`}>{value}</div>
            <div className="text-white/60 text-xs mt-0.5">{label}</div>
            <div className="text-white/30 text-xs">{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Rating distribution */}
      <motion.div
        ref={distRef.ref}
        initial={{ opacity: 0, y: 20 }}
        animate={distRef.inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white/80">Rating Distribution</h3>
        </div>
        <div className="space-y-3">
          {distribution.map(({ star, count, pct }, i) => (
            <motion.div
              key={star}
              initial={{ opacity: 0, x: -20 }}
              animate={distRef.inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" as const }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-1 w-12 shrink-0">
                <span className="text-xs text-white/50">{star}</span>
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={distRef.inView ? { width: `${pct}%` } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: "easeOut" as const }}
                  className={`h-full rounded-full ${star >= 4 ? "bg-gradient-to-r from-amber-400 to-amber-500" : star === 3 ? "bg-gradient-to-r from-yellow-500 to-amber-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}
                />
              </div>
              <div className="flex items-center gap-2 w-16 text-right shrink-0">
                <span className="text-xs text-white/60 ml-auto">{count}</span>
                <span className="text-xs text-white/30 w-8">{pct}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit overflow-x-auto">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? reviews.length : key === "unreplied" ? reviews.filter(r => !r.replied_at).length : reviews.filter(r => r.rating === Number(key)).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === key ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {activeTab === key && (
                <motion.div layoutId="tab-pill" className="absolute inset-0 bg-purple-500/20 border border-purple-500/30 rounded-lg" />
              )}
              <span className="relative">{label} {count > 0 && <span className="ml-1 opacity-60">{count}</span>}</span>
            </button>
          );
        })}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">No reviews in this category</p>
            </motion.div>
          ) : (
            filteredReviews.map((review, i) => {
              const name = review.patient?.name ?? "Patient";
              const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const dateStr = new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              const isReplying = replyingTo === review.id;

              return (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: "easeOut" as const }}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 text-white text-xs font-bold`}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-sm font-semibold text-white">{name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-white/30">{dateStr}</span>
                          </div>
                        </div>
                        {review.replied_at && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle className="w-3 h-3" /> Replied
                          </span>
                        )}
                      </div>

                      {review.comment && (
                        <p className="text-sm text-white/60 mt-2 leading-relaxed">{review.comment}</p>
                      )}

                      {/* Existing reply */}
                      {review.reply_text && (
                        <div className="mt-3 pl-3 border-l-2 border-purple-500/30">
                          <p className="text-xs text-white/40 mb-1">Your reply · {new Date(review.replied_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                          <p className="text-sm text-white/60">{review.reply_text}</p>
                        </div>
                      )}

                      {/* Reply form */}
                      <AnimatePresence>
                        {isReplying && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" as const }}
                            className="overflow-hidden mt-3"
                          >
                            <textarea
                              value={replyTexts[review.id] ?? ""}
                              onChange={e => setReplyTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                              placeholder="Write a thoughtful reply..."
                              rows={3}
                              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                            <div className="flex gap-2 mt-2">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => submitReply(review.id)}
                                disabled={submitting === review.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/30 disabled:opacity-50 transition-all"
                              >
                                {submitting === review.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Post Reply
                              </motion.button>
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-2 rounded-xl text-white/40 text-xs hover:text-white/60 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      {!isReplying && !review.replied_at && (
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          className="flex items-center gap-1.5 mt-2 text-xs text-white/30 hover:text-purple-400 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Add Reply
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Google Review CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" as const }}
        className="rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-violet-500/10 border border-purple-500/20 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-purple-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Boost Your Google Rating</h3>
            <p className="text-sm text-white/50 mb-4">Automatically send Google review requests via WhatsApp after appointments. Clinics using this see 3× more reviews in 30 days.</p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Google Business
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <Send className="w-4 h-4" />
                Send Test Request
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
