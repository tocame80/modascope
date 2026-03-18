"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  brand: string;
  category: string;
  image: string;
  whyItMatters: string;
}

interface Source {
  name: string;
  category: string;
}

const steps = [
  {
    number: "01",
    title: "Collect",
    description: "We scan 100+ sources daily — brand websites, fashion magazines, retailers, and runway platforms.",
  },
  {
    number: "02",
    title: "Analyze",
    description: "AI identifies what matters, clusters similar stories, and extracts visual trends from images.",
  },
  {
    number: "03",
    title: "Personalize",
    description: "Filter by brands you love, categories you follow, and tones that interest you.",
  },
  {
    number: "04",
    title: "Deliver",
    description: "Wake up to a curated digest via Telegram, app, or email — ready in 2 minutes.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Top 5 daily headlines",
    features: ["Daily digest (5 stories)", "Basic categories", "Email delivery"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "Full access for enthusiasts",
    features: [
      "Unlimited stories",
      "All categories & brands",
      "Trend analysis",
      "Archive access",
      "Telegram + Email + App",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Professional",
    price: "$49",
    period: "per month",
    description: "For industry professionals",
    features: [
      "Everything in Pro",
      "Competitor monitoring",
      "Real-time alerts",
      "API access",
      "Custom reports",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [newsRes, sourcesRes] = await Promise.all([
          fetch("/api/news?limit=3"),
          fetch("/api/sources"),
        ]);
        const newsData = await newsRes.json();
        const sourcesData = await sourcesRes.json();
        setNews(newsData.data);
        setSources(sourcesData.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-[#C9A962] flex items-center justify-center">
              <span className="font-serif text-[#C9A962] text-lg">M</span>
            </div>
            <span className="font-serif text-xl text-[#F5F0E8]">ModaScope</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#F5F0E8]/70">
            <a href="#how-it-works" className="hover:text-[#C9A962] transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-[#C9A962] transition-colors">Preview</a>
            <a href="#sources" className="hover:text-[#C9A962] transition-colors">Sources</a>
            <a href="#pricing" className="hover:text-[#C9A962] transition-colors">Pricing</a>
          </div>
          <a
            href="#early-access"
            className="px-4 py-2 bg-[#C9A962] text-[#0A0A0A] text-sm font-medium hover:bg-[#A88B4A] transition-colors"
          >
            Get Early Access
          </a>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 border border-[#C9A962]/30 rounded-full" />
          <div className="absolute bottom-40 right-20 w-96 h-96 border border-[#C9A962]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#C9A962]/10 rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <div className="opacity-0 animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 border border-[#C9A962]/40 text-[#C9A962] text-xs tracking-[0.3em] uppercase mb-8">
              AI-Powered Fashion Intelligence
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F5F0E8] leading-[0.95] mb-8 opacity-0 animate-fade-in-up delay-100">
            Your Finger on the
            <br />
            <span className="text-gradient">Pulse of Fashion</span>
          </h1>

          <p className="text-lg md:text-xl text-[#F5F0E8]/60 max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in-up delay-200">
            Stop scrolling. Start knowing. ModaScope monitors hundreds of fashion sources 
            and delivers your personalized daily digest in 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up delay-300">
            <a
              href="#early-access"
              className="px-8 py-4 bg-[#C9A962] text-[#0A0A0A] font-medium hover:bg-[#A88B4A] transition-all hover:scale-105"
            >
              Join Early Access
            </a>
            <a
              href="#preview"
              className="px-8 py-4 border border-[#F5F0E8]/20 text-[#F5F0E8] hover:border-[#C9A962]/50 hover:text-[#C9A962] transition-colors"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-xs text-[#F5F0E8]/40 opacity-0 animate-fade-in delay-500">
            <span>Free for early users</span>
            <span className="w-1 h-1 bg-[#C9A962]/40 rounded-full" />
            <span>No credit card required</span>
            <span className="w-1 h-1 bg-[#C9A962]/40 rounded-full" />
            <span>Cancel anytime</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-500">
          <div className="w-6 h-10 border border-[#F5F0E8]/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#C9A962] rounded-full animate-pulse-gold" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#C9A962] text-xs tracking-[0.3em] uppercase">The Process</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] mt-4">
              From Chaos to Clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="mb-6">
                  <span className="font-serif text-6xl text-[#C9A962]/20">{step.number}</span>
                </div>
                <h3 className="font-serif text-2xl text-[#F5F0E8] mb-3">{step.title}</h3>
                <p className="text-[#F5F0E8]/50 text-sm leading-relaxed">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 right-0 w-1/2 h-px bg-gradient-to-r from-[#C9A962]/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="py-32 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#C9A962] text-xs tracking-[0.3em] uppercase">Today&apos;s Digest</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] mt-4">
              What You&apos;ll Wake Up To
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="group bg-[#0A0A0A] border border-[#F5F0E8]/5 hover:border-[#C9A962]/30 transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-[#0A0A0A]/80 text-[#C9A962] text-xs">
                      {item.brand}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-lg text-[#F5F0E8] mb-3 group-hover:text-[#C9A962] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[#F5F0E8]/50 text-sm mb-4 line-clamp-3">
                      {item.summary}
                    </p>
                    <div className="pt-4 border-t border-[#F5F0E8]/5">
                      <span className="text-[#C9A962] text-xs">Why it matters</span>
                      <p className="text-[#F5F0E8]/70 text-sm mt-1">{item.whyItMatters}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-[#F5F0E8]/40 text-sm">Delivered daily at 7:00 AM via Telegram, Email, or App</p>
          </div>
        </div>
      </section>

      <section id="sources" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#C9A962] text-xs tracking-[0.3em] uppercase">Data Sources</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] mt-4">
              We Monitor What Matters
            </h2>
            <p className="text-[#F5F0E8]/50 mt-4 max-w-xl mx-auto">
              Hundreds of sources across brands, publications, retailers, and platforms — 
              constantly updated.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {sources.map((source) => (
              <span
                key={source.name}
                className="px-4 py-2 border border-[#F5F0E8]/10 text-[#F5F0E8]/60 text-sm hover:border-[#C9A962]/50 hover:text-[#C9A962] transition-colors cursor-default"
              >
                {source.name}
              </span>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <span className="font-serif text-5xl text-[#C9A962]">100+</span>
              <p className="text-[#F5F0E8]/50 mt-2">Sources monitored daily</p>
            </div>
            <div className="text-center p-8">
              <span className="font-serif text-5xl text-[#C9A962]">50K+</span>
              <p className="text-[#F5F0E8]/50 mt-2">Articles analyzed monthly</p>
            </div>
            <div className="text-center p-8">
              <span className="font-serif text-5xl text-[#C9A962]">2min</span>
              <p className="text-[#F5F0E8]/50 mt-2">Average digest reading time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#C9A962] text-xs tracking-[0.3em] uppercase">Features</span>
              <h2 className="font-serif text-4xl text-[#F5F0E8] mt-4 mb-6">
                Built for How You Consume
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[#F5F0E8] font-medium mb-2">By Brands You Love</h3>
                  <p className="text-[#F5F0E8]/50 text-sm">Follow specific houses — Prada, Gucci, Miu Miu — and only see their news.</p>
                </div>
                <div>
                  <h3 className="text-[#F5F0E8] font-medium mb-2">By Category</h3>
                  <p className="text-[#F5F0E8]/50 text-sm">Men&apos;s, women&apos;s, streetwear, high jewelry, sustainability — pick yours.</p>
                </div>
                <div>
                  <h3 className="text-[#F5F0E8] font-medium mb-2">By Tone</h3>
                  <p className="text-[#F5F0E8]/50 text-sm">Collections, collaborations, business news, or runway analysis.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A962]/10 to-transparent rounded-lg" />
              <div className="relative bg-[#0A0A0A] border border-[#F5F0E8]/10 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F5F0E8]/5">
                  <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#C9A962]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#F5F0E8] text-sm font-medium">Your Preferences</p>
                    <p className="text-[#F5F0E8]/40 text-xs">Personalized for you</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Brands", value: "Prada, Miu Miu, JW Anderson" },
                    { label: "Categories", value: "Women&apos;s, Runway, Analysis" },
                    { label: "Tone", value: "News, Collections" },
                    { label: "Delivery", value: "Telegram + Email" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#F5F0E8]/5">
                      <span className="text-[#F5F0E8]/40 text-xs">{item.label}</span>
                      <span className="text-[#F5F0E8] text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#C9A962] text-xs tracking-[0.3em] uppercase">Pricing</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] mt-4">
              Invest in Your Edge
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-8 ${
                  tier.featured
                    ? "bg-[#C9A962]/5 border border-[#C9A962]/30"
                    : "bg-[#0A0A0A] border border-[#F5F0E8]/5"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#C9A962] text-[#0A0A0A] text-xs font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="font-serif text-2xl text-[#F5F0E8] mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="font-serif text-4xl text-[#F5F0E8]">{tier.price}</span>
                  <span className="text-[#F5F0E8]/40 text-sm">/{tier.period}</span>
                </div>
                <p className="text-[#F5F0E8]/50 text-sm mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[#F5F0E8]/60 text-sm">
                      <svg className="w-4 h-4 text-[#C9A962]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 text-sm font-medium transition-colors ${
                    tier.featured
                      ? "bg-[#C9A962] text-[#0A0A0A] hover:bg-[#A88B4A]"
                      : "border border-[#F5F0E8]/20 text-[#F5F0E8] hover:border-[#C9A962]/50"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="early-access" className="py-32 bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-[#C9A962] text-xs tracking-[0.3em] uppercase">Join Early Access</span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#F5F0E8] mt-4 mb-6">
            Be First to Know
          </h2>
          <p className="text-[#F5F0E8]/50 mb-12">
            We&apos;re launching soon. Join the waitlist to get early access and a free Pro plan for life.
          </p>

          {submitted ? (
            <div className="p-6 bg-[#C9A962]/10 border border-[#C9A962]/30">
              <p className="text-[#C9A962]">Thank you! You&apos;re on the list. We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#F5F0E8]/10 text-[#F5F0E8] placeholder:text-[#F5F0E8]/30 focus:border-[#C9A962] focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-[#C9A962] text-[#0A0A0A] font-medium hover:bg-[#A88B4A] transition-colors disabled:opacity-50"
              >
                {submitting ? "Subscribing..." : "Join Waitlist"}
              </button>
            </form>
          )}
          
          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}

          <p className="text-[#F5F0E8]/30 text-xs mt-6">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <footer className="py-12 border-t border-[#F5F0E8]/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-[#C9A962] flex items-center justify-center">
              <span className="font-serif text-[#C9A962] text-sm">M</span>
            </div>
            <span className="font-serif text-[#F5F0E8]">ModaScope</span>
          </div>
          <p className="text-[#F5F0E8]/30 text-sm">
            © 2024 ModaScope. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#F5F0E8]/40">
            <a href="#" className="hover:text-[#C9A962] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#C9A962] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#C9A962] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
