import { useState, useEffect } from "react";

/**
 * Shared animated number count-up hook using requestAnimationFrame
 */
export function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration]);

  return val;
}

/**
 * Shared gradient color palette for user and patient avatars
 */
export const AVATAR_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-fuchsia-500 to-pink-600",
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-emerald-600",
];

export function getAvatarGradient(identifier: string | number): string {
  const num = typeof identifier === "number"
    ? identifier
    : identifier.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[Math.abs(num) % AVATAR_GRADIENTS.length];
}

/**
 * Extracts 2-letter uppercase initials from a full name
 */
export function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Standard Indian Locale Date Formatting
 */
export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? String(date)
    : d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Standard Indian Locale Time Formatting (12-hour)
 */
export function formatTime(date: string | Date | number): string {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? String(date)
    : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
