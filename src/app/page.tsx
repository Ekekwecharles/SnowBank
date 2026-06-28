"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Shield, Zap, BarChart2, CreditCard, Phone, Headphones,
  CheckCircle, Star, ChevronRight,
} from "lucide-react";

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Zap, title: "Instant Transfers", desc: "Send money to any bank in Nigeria instantly, 24/7 with zero downtime." },
  { icon: Shield, title: "Bank-Grade Security", desc: "256-bit encryption, PIN authentication, and real-time fraud monitoring." },
  { icon: BarChart2, title: "Smart Insights", desc: "Track spending patterns with beautiful charts and monthly breakdowns." },
  { icon: CreditCard, title: "Virtual Cards", desc: "Premium virtual Visa debit card with freeze/unfreeze in one tap." },
  { icon: Phone, title: "Bill Payments", desc: "Pay electricity, cable TV, and internet bills seamlessly." },
  { icon: Headphones, title: "24/7 Support", desc: "Human support available around the clock for any issues." },
];

const testimonials = [
  { name: "Adebayo Okonkwo", role: "Software Engineer, Lagos", quote: "SnowBank's interface is cleaner than any Nigerian bank app I've used. Transfers are instant." },
  { name: "Fatima Al-Hassan", role: "Business Owner, Abuja", quote: "The spending insights helped me cut unnecessary expenses by 30%. Incredible product." },
  { name: "James Chen", role: "Freelancer, Remote", quote: "Virtual card and instant transfers make running my remote business effortless." },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up in under 2 minutes with just your email" },
  { num: "02", title: "Fund Your Wallet", desc: "Receive money from any bank account instantly" },
  { num: "03", title: "Start Banking", desc: "Transfer, pay bills, and track your finances" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <span className="font-bold text-lg">SnowBank</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition">Sign In</Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
              Next-Generation Digital Banking
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
              Banking Made<br />
              <span className="text-gradient">Effortlessly Simple</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Experience the future of Nigerian banking. Instant transfers, smart spending insights, and bank-grade security — all in one beautiful app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30">
                Open Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all">
                Sign In <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mt-20">
            <div className="relative mx-auto max-w-3xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-[#111827] p-4">
              <div className="flex items-center gap-2 mb-3 px-2">
                {[0,1,2].map(i => <div key={i} className={`h-3 w-3 rounded-full ${["bg-red-500","bg-yellow-500","bg-green-500"][i]}`} />)}
              </div>
              <div className="rounded-xl bg-[#0a0f1e] p-4 space-y-3">
                <div className="h-20 rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1a2b4a] border border-white/10 p-4 flex items-center justify-between">
                  <div><p className="text-white/40 text-xs">Balance</p><p className="text-white text-xl font-bold">₦1,250,000.00</p></div>
                  <div className="text-right"><p className="text-white/40 text-xs">Account</p><p className="text-white font-mono text-sm">****7890</p></div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["Transfer","Airtime","Bills","Cards"].map(a => (
                    <div key={a} className="rounded-lg bg-[#1a2035] p-2 text-center"><p className="text-primary text-xs">{a}</p></div>
                  ))}
                </div>
                <div className="space-y-1">
                  {[["Credit from Adebayo", "+₦50,000", "green"],["Electricity Bill", "-₦15,000", "red"],["Salary Credit", "+₦250,000", "green"]].map(([d, a, c]) => (
                    <div key={d} className="flex items-center justify-between rounded-lg bg-[#1a2035] px-3 py-2">
                      <span className="text-white/60 text-xs">{d}</span>
                      <span className={`text-xs font-medium ${c === "green" ? "text-green-400" : "text-red-400"}`}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Everything you need to bank smarter</h2>
              <p className="text-white/50">Powerful features designed for modern Nigerian banking</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 0.07}>
                <div className="glass rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">How it works</h2>
              <p className="text-white/50">Get started in minutes, bank for a lifetime</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <FadeIn key={num} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-5xl font-black text-primary/20 mb-3">{num}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-white/50 text-sm">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-primary/5 border-y border-primary/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["10,000+", "Users"], ["₦500M+", "Processed"], ["99.9%", "Uptime"], ["0", "Breaches"]].map(([v, l]) => (
            <FadeIn key={l}>
              <div>
                <p className="text-3xl font-black text-primary mb-1">{v}</p>
                <p className="text-white/50 text-sm">{l}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">What our users say</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, quote }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <div className="glass rounded-2xl p-5">
                  <div className="flex gap-1 mb-3">{[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">"{quote}"</p>
                  <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-white/40 text-xs">{role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <div className="rounded-3xl bg-primary/10 border border-primary/20 p-10">
              <h2 className="text-3xl font-bold mb-3">Ready to experience modern banking?</h2>
              <p className="text-white/50 mb-8">Join thousands of Nigerians managing their money smarter with SnowBank.</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30">
                Open Your Account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">SB</span>
            </div>
            <span className="font-bold">SnowBank</span>
          </div>
          <p className="text-white/30 text-xs text-center">
            This is a portfolio project simulating a digital banking platform. It does not process real financial transactions.
          </p>
          <p className="text-white/30 text-xs">© 2025 SnowBank</p>
        </div>
      </footer>
    </div>
  );
}
