"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import { useSession } from "@/components/SessionProvider";
import CountUp from "react-countup";
import {
  Film,
  Tv,
  Sparkles,
  ChevronDown,
  Heart,
  Clock,
  Star,
  List,
  Layers,
  Zap,
  Eye,
  Play,
  Bookmark,
  TrendingUp,
  Search,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const Beams = dynamic(() => import("@/components/Beams"), {
  ssr: false,
});

const DemoCard = dynamic(() => import("@/components/DemoCard"), {
  ssr: false,
});

/* ─── Scroll-triggered reveal with stagger support ─── */
function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const dirs = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter that starts on scroll ─── */
function AnimatedStat({
  value,
  label,
  icon: Icon,
  suffix = "",
  delay = 0,
}: {
  value: number | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-3"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white/[0.04] border border-white/[0.06]"
      >
        <Icon className="h-5 w-5 text-white/40" />
      </motion.div>
      <div className="stat-value text-5xl sm:text-6xl font-bold tracking-tight tabular-nums">
        {typeof value === "number" && inView ? (
          <CountUp end={value} duration={2.5} delay={delay} suffix={suffix} />
        ) : (
          <span>{value}{suffix}</span>
        )}
      </div>
      <div className="text-sm text-white/40 font-medium tracking-wide">{label}</div>
    </motion.div>
  );
}

/* ─── Bento card with mouse-tracking glow ─── */
function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty("--card-mx", `${x}px`);
    ref.current.style.setProperty("--card-my", `${y}px`);
  }, []);

  return (
    <Reveal delay={delay}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={`bento-card ${className}`}
      >
        {children}
      </div>
    </Reveal>
  );
}

/* ─── Floating orbs component ─── */
function FloatingOrbs({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  if (variant === "hero") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-1" style={{ top: "10%", left: "5%" }} />
        <div className="orb orb-2" style={{ top: "30%", right: "10%" }} />
        <div className="orb orb-3" style={{ bottom: "20%", left: "30%" }} />
        <div className="orb orb-2" style={{ bottom: "10%", right: "25%", opacity: 0.5 }} />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="orb orb-1" style={{ top: "20%", left: "15%", opacity: 0.5 }} />
      <div className="orb orb-3" style={{ bottom: "15%", right: "20%", opacity: 0.4 }} />
    </div>
  );
}

/* ─── Word-by-word stagger reveal ─── */
function StaggerHeadline({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");

  return (
    <div ref={ref} className={className} style={{ wordSpacing: "0.08em" }}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <motion.span
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Navigation (in-page anchors) ─── */
const NAV = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#organize", label: "Organize" },
];

/* ─── Feature cards data — capabilities, not categories ─── */
const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Smart Tracking",
    desc: "Track watched, pending, wishlist & favorites across movies, TV shows and anime — all in one place.",
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    accentColor: "rgba(255, 56, 100, 0.15)",
  },
  {
    icon: BarChart3,
    title: "Rich Insights",
    desc: "Dashboard with real-time charts, viewing stats, and analytics to understand your media journey.",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
    accentColor: "rgba(168, 85, 247, 0.15)",
  },
  {
    icon: Search,
    title: "TMDB Integration",
    desc: "Search millions of titles instantly. Posters, metadata and ratings are auto-filled from TMDB.",
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-400",
    accentColor: "rgba(56, 189, 248, 0.15)",
  },
];

/* ─── Showcase cards ─── */
const SHOWCASE = [
  {
    title: "Watched",
    desc: "Everything you've finished. Your personal hall of fame.",
    icon: Eye,
    color: "rgba(255, 56, 100, 0.15)",
    accent: "#FF3864",
  },
  {
    title: "Pending",
    desc: "Currently watching. Pick up right where you left off.",
    icon: Clock,
    color: "rgba(168, 85, 247, 0.15)",
    accent: "#A855F7",
  },
  {
    title: "Wishlist",
    desc: "Saved for later. Your curated queue of must-watches.",
    icon: Star,
    color: "rgba(56, 189, 248, 0.15)",
    accent: "#38BDF8",
  },
  {
    title: "Favorites",
    desc: "The ones you love most. Your all-time greats.",
    icon: Heart,
    color: "rgba(250, 204, 21, 0.15)",
    accent: "#FACC15",
  },
];

/* ─── Quick highlights ─── */
const HIGHLIGHTS = [
  { icon: Play, text: "Instant browse" },
  { icon: Bookmark, text: "Save in one click" },
  { icon: TrendingUp, text: "Track progress" },
  { icon: Zap, text: "Lightning fast" },
];

export default function HomePage() {
  const { data: session } = useSession();
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const [activeCat, setActiveCat] = useState(0);

  /* Auto-cycle showcase categories */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCat((prev) => (prev + 1) % SHOWCASE.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      {/* ─── Raycast-style floating capsule nav (OUTSIDE hero for correct fixed positioning) ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-5 sm:px-6 pt-3 sm:pt-4"
      >
        <nav className="wv-capsule-nav">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 flex-shrink-0 mr-2 sm:mr-6"
          >
            <span className="text-[17px] font-bold tracking-tight text-white/90">
              WatchVault
            </span>
            <span className="text-[15px] font-normal tracking-tight text-white/40">
              Personal
            </span>
          </Link>

          {/* Center nav links — desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollToSection(l.href.replace("#", ""))}
                className="px-4 lg:px-5 py-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors duration-200 select-none rounded-lg hover:bg-white/[0.06]"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right side: auth */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-auto md:ml-0">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white/50 hover:text-white/90 transition-colors duration-200 hidden sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/dashboard"
                  className="wv-capsule-cta"
                  style={{ background: 'rgba(255,255,255,0.92)', color: '#0a0a0a', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <span className="relative inline-flex items-center justify-center h-5.5 w-5.5 rounded-full overflow-hidden border border-white/15 flex-shrink-0 mr-2">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-500/40 to-violet-500/40 text-[10px] font-bold">
                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </span>
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/50 hover:text-white/90 transition-colors duration-200 hidden sm:block"
                >
                  Log in
                </Link>
                <Link href="/register" className="wv-capsule-cta" style={{ background: 'rgba(255,255,255,0.92)', color: '#0a0a0a', border: '1px solid rgba(255,255,255,0.25)' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </motion.header>

      {/* ━━━ HERO (fullscreen) ━━━ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative flex min-h-screen flex-col"
      >
        {/* Animated WebGL background + overlays */}
        <div className="absolute inset-0 z-0">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>
        <div className="aurora-vignette" />
        <div className="noise-overlay" />

        {/* Hero content — pushed lower to balance visual weight */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 sm:px-10 pb-12 sm:pb-16 pt-24 sm:pt-40">
          <div className="text-center max-w-4xl mx-auto mt-4 sm:mt-8">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full liquid-glass liquid-glass-pill text-xs sm:text-sm text-white/55 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="relative">Personal Watchlist Tracker</span>
              </div>
            </motion.div>

            {/* Headline with word stagger */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
            >
              <span className="block">
                {["Track", "everything"].map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.2 + i * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="text-gradient"
                    style={{ display: "inline-block" }}
                  >
                    {word}{i === 0 ? "\u00A0" : ""}
                  </motion.span>
                ))}
              </span>
              <span className="block">
                {["you", "watch."].map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.45 + i * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="text-gradient-animated"
                    style={{ display: "inline-block" }}
                  >
                    {word}{i === 0 ? "\u00A0" : ""}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 sm:mt-9 text-base sm:text-lg md:text-xl text-white/45 max-w-2xl mx-auto leading-relaxed"
            >
              Movies, TV series and anime — organized by watched, pending,
              wishlist and favorites.{" "}
              <span className="text-white/65 font-medium">Clean. Fast. Yours.</span>
            </motion.p>

            {/* CTA buttons — single strong CTA + scroll secondary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link href={session ? "/dashboard" : "/login"} className="glass-btn-primary">
                <span>{session ? "Go to Dashboard" : "Get Started Free"}</span>
              </Link>
              <button onClick={() => scrollToSection("features")} className="glass-btn-secondary">
                <span>See how it works</span>
                <ChevronDown className="h-4 w-4 ml-1.5 opacity-60" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Quick highlights row - moved here to stay anchored at bottom */}
        <div className="relative z-10 w-full pb-10 sm:pb-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8"
          >
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-2 text-xs sm:text-sm text-white/30"
              >
                <h.icon className="h-3.5 w-3.5 text-white/25" />
                {h.text}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="scroll-indicator"
          >
            <ChevronDown className="h-6 w-6 text-white/25" />
          </motion.div>
        </div>
      </motion.section>

      {/* ━━━ TAGLINE ━━━ */}
      <section className="relative py-32 sm:py-44 px-6 sm:px-10">
        <div className="section-divider mb-32 sm:mb-44" />
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-4xl">
            <StaggerHeadline
              text="It's not about remembering."
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            />
            <Reveal delay={0.3}>
              <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white/35 mt-2">
                It&apos;s about never missing a thing.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━ DEMO CARD ━━━ */}
      <section id="demo" className="relative py-24 sm:py-32 px-6 sm:px-10 overflow-hidden scroll-mt-8">
        <div className="section-divider mb-24 sm:mb-32" />
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Left: text content — sticky on desktop */}
            <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-32">
              <Reveal>
                <p className="text-xs font-semibold text-white/35 tracking-[0.2em] uppercase mb-4">
                  See it in action
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
                  A glimpse inside WatchVault.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-base sm:text-lg text-white/35 mb-8 leading-relaxed">
                  Explore the library, dashboard stats, and tracking workflow — all without signing up.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="flex flex-col gap-3 text-sm text-white/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                      <Film className="h-4 w-4 text-rose-400" />
                    </div>
                    <span>Browse your poster library</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-4 w-4 text-violet-400" />
                    </div>
                    <span>Real-time dashboard insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-cyan-400" />
                    </div>
                    <span>Track status, favorites &amp; ratings</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: demo card — fills remaining space */}
            <div className="flex-1 min-w-0 w-full">
              <Reveal delay={0.2}>
                <DemoCard />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ BENTO FEATURE GRID ━━━ */}
      <section id="features" ref={featuresRef} className="relative py-24 sm:py-32 px-6 sm:px-10 scroll-mt-8">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-xs font-semibold text-white/35 tracking-[0.2em] uppercase mb-4">
              Why WatchVault
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-16">
              Everything you need, nothing you don&apos;t.
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <BentoCard key={f.title} delay={i * 0.12}>
                <div className="group p-7 sm:p-8 h-full">
                  {/* Floating icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-6 icon-float`}
                    style={{ animationDelay: `${i * 0.6}s` }}
                  >
                    <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                  </motion.div>

                  <h3 className="text-xl font-semibold tracking-tight mb-2.5 group-hover:text-white transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/55 transition-colors duration-500">
                    {f.desc}
                  </p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ STATS ROW ━━━ */}
      <section className="relative py-24 sm:py-32 px-6 sm:px-10">
        <div className="section-divider mb-24 sm:mb-32" />
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-4 text-center">
            <AnimatedStat value={3} label="Categories" icon={Layers} delay={0} />
            <AnimatedStat value={4} label="List Types" icon={List} delay={0.15} />
            <AnimatedStat value="∞" label="Tracking Modes" icon={Zap} delay={0.3} />
          </div>
        </div>
      </section>

      {/* ━━━ SHOWCASE: List Types ━━━ */}
      <section id="organize" className="relative py-24 sm:py-32 px-6 sm:px-10 overflow-hidden scroll-mt-8">
        <div className="section-divider mb-24 sm:mb-32" />

        {/* Subtle bg orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb orb-3" style={{ top: "10%", right: "5%", opacity: 0.3 }} />
          <div className="orb orb-1" style={{ bottom: "10%", left: "10%", opacity: 0.2 }} />
        </div>

        <div className="relative mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-xs font-semibold text-white/35 tracking-[0.2em] uppercase mb-4">
              Organize your way
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Don&apos;t repeat yourself.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-8 text-white/35">
              Four lists. Infinite flexibility.
            </p>
          </Reveal>

          {/* Category pills */}
          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-2 mb-12">
              {SHOWCASE.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setActiveCat(i)}
                  className={`cat-pill ${activeCat === i ? "active" : ""}`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.title}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Showcase cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE.map((s, i) => (
              <BentoCard key={s.title} delay={0.2 + i * 0.08}>
                <motion.div
                  animate={{
                    scale: activeCat === i ? 1.04 : 1,
                    borderColor:
                      activeCat === i
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(255,255,255,0.06)",
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  className="p-6 sm:p-7 cursor-pointer h-full"
                  onClick={() => setActiveCat(i)}
                >
                  {/* Icon with glow when active */}
                  <motion.div
                    animate={{
                      boxShadow:
                        activeCat === i
                          ? `0 0 24px ${s.color}`
                          : "0 0 0px transparent",
                    }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center justify-center h-11 w-11 rounded-xl mb-5 transition-colors duration-300"
                    style={{ background: s.color }}
                  >
                    <s.icon className="h-5 w-5 text-white/80" />
                  </motion.div>

                  <h3 className="text-lg font-semibold tracking-tight mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed">
                    {s.desc}
                  </p>

                  {/* Active indicator line */}
                  <AnimatePresence>
                    {activeCat === i && (
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-5 h-[2px] rounded-full origin-left"
                        style={{ backgroundColor: s.accent }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ BOTTOM CTA ━━━ */}
      <section className="relative py-32 sm:py-48 px-6 sm:px-10 overflow-hidden">
        <div className="section-divider mb-32 sm:mb-48" />

        {/* Aurora-like glow behind CTA */}
        <FloatingOrbs variant="cta" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="h-[500px] w-[700px] rounded-full bg-gradient-to-r from-rose-500/10 via-violet-500/8 to-cyan-500/10 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-[1400px] text-center">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-7">
              <span className="text-gradient">Start tracking.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-base sm:text-lg text-white/40 max-w-lg mx-auto mb-12 leading-relaxed">
              Your personal watchlist awaits. Create an account and start
              tracking your media journey.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={session ? "/dashboard" : "/register"} className="glass-btn-primary text-base">
                <span>{session ? "Open WatchVault" : "Create Free Account"}</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="relative border-t border-white/[0.05] py-8 px-6 sm:px-10">
        <div className="mx-auto max-w-[1400px] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/25">
          <span>© 2026 WatchVault</span>
          <div className="flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-white/55 transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/library/movies"
                  className="hover:text-white/55 transition-colors duration-300"
                >
                  Library
                </Link>
                <Link
                  href="/profile"
                  className="hover:text-white/55 transition-colors duration-300"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-white/55 transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hover:text-white/55 transition-colors duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
