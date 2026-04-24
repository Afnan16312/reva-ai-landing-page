import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <main className="bg-[#050714] min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
    </main>
  );
}
