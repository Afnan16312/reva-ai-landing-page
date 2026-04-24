import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Reva AI — The Receptionist That Never Sleeps",
  description:
    "AI-powered WhatsApp receptionist for clinics and doctors. Auto-book appointments, send reminders, never miss a patient again.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} scroll-smooth`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
