"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We used to miss 8-10 calls a day during busy hours. Since Reva, we've recovered an extra ₹45,000/month in bookings we were losing. It paid for itself in the first week.",
    name: "Dr. Priya Menon",
    role: "Dermatologist",
    city: "Bangalore",
    initials: "PM",
    specialty: "Dermatology",
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    quote:
      "My receptionist used to spend 2 hours/day just calling patients for dental recalls. Reva does it automatically. Our 6-month recall rate went from 30% to 71%.",
    name: "Dr. Arjun Shah",
    role: "Dentist",
    city: "Mumbai",
    initials: "AS",
    specialty: "Dental",
    avatarColor: "from-blue-500 to-cyan-600",
  },
  {
    quote:
      "Patients book at 11 PM when they have pain. Before Reva, they'd call someone else by morning. Now those bookings come to us automatically. Game changer.",
    name: "Dr. Ananya Krishnan",
    role: "GP",
    city: "Chennai",
    initials: "AK",
    specialty: "General Practice",
    avatarColor: "from-violet-500 to-purple-600",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Doctors Love <span className="gradient-text">Reva</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Clinics across India use Reva to save time and grow revenue.
          </p>
        </motion.div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex-shrink-0 w-[85vw] md:w-auto snap-center
                bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6
                backdrop-blur-sm hover:bg-white/[0.05] transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote mark */}
              <div className="gradient-text text-5xl font-serif leading-none mb-2 select-none">
                &ldquo;
              </div>

              {/* Quote text */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6">{t.quote}</p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{t.name}</p>
                  <p className="text-slate-400 text-xs">
                    {t.role} &bull; {t.city}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  {t.specialty}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
