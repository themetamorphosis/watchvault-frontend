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
import { usePathname } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import CountUp from "react-countup";
import {
  Film,
  Tv,
  Sparkles,
  ChevronDown,
  ArrowRight,
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
} from "lucide-react";

const HeroBackground = dynamic(() => import("@/components/HeroBackground"), {
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

/* ─── Navigation ─── */
const NAV = [
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
];

/* ─── Feature cards data ─── */
const FEATURES = [
  {
    icon: Film,
    title: "Movies",
    desc: "From blockbusters to indie gems. Track every film you watch, want to watch, or love.",
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
    href: "/movies",
    accentColor: "rgba(255, 56, 100, 0.15)",
  },
  {
    icon: Tv,
    title: "TV Shows",
    desc: "Episode by episode, season by season. Never lose track of where you left off.",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
    href: "/tv",
    accentColor: "rgba(168, 85, 247, 0.15)",
  },
  {
    icon: Sparkles,
    title: "Anime",
    desc: "Sub or dub, your call. Organize your anime journey from start to finish.",
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-400",
    href: "/anime",
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
  const pathname = usePathname();
  const active = NAV.find((n) => pathname?.startsWith(n.href))?.href ?? "";
  const { data: session } = useSession();

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
      {/* ━━━ HERO (fullscreen) ━━━ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative flex min-h-screen flex-col"
      >
        {/* Animated WebGL background + overlays */}
        <HeroBackground />
        <div className="aurora-vignette" />
        <div className="noise-overlay" />
        <FloatingOrbs variant="hero" />

        {/* Nav */}
        <header className="relative z-20 w-full px-6 sm:px-10 py-5">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="grid grid-cols-2 md:grid-cols-3 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="justify-self-start"
              >
                <Link
                  href="/"
                  className="text-base sm:text-lg font-semibold tracking-tight text-white/90 hover:text-white transition-colors duration-300"
                >
                  WatchVault
                  <span className="ml-2 text-white/30 font-normal text-sm">
                    Personal
                  </span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:flex justify-self-center"
              >
                <div className="liquid-glass liquid-glass-pill liquid-glass-hover liquid-glass-press px-1.5 py-1.5">
                  <div className="relative flex items-center gap-1">
                    {active && (
                      <motion.div
                        layoutId="wv-nav-pill"
                        className="absolute top-0 bottom-0 my-1 rounded-full bg-white/[0.14]"
                        style={{
                          left:
                            active === "/movies"
                              ? 0
                              : active === "/tv"
                                ? "33.3333%"
                                : "66.6666%",
                          width: "33.3333%",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 32,
                        }}
                      />
                    )}

                    {NAV.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="relative z-10 rounded-full px-5 py-2 text-sm font-medium tracking-tight text-white/75 hover:text-white hover:bg-white/[0.08] transition-all duration-300 select-none"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="justify-self-end"
              >
                {session ? (
                  <Link
                    href="/dashboard"
                    className="liquid-glass liquid-glass-pill liquid-glass-hover liquid-glass-press pl-2 pr-5 py-1.5 text-sm font-medium tracking-tight flex items-center gap-2.5"
                  >
                    <span className="relative inline-flex items-center justify-center h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-500/30 to-violet-500/30 text-xs font-semibold">
                          {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </span>
                    <span className="relative">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="liquid-glass liquid-glass-pill liquid-glass-hover liquid-glass-press px-5 py-2.5 text-sm font-medium tracking-tight"
                  >
                    <span className="relative">Sign In</span>
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Mobile nav */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 md:hidden"
            >
              <div className="liquid-glass liquid-glass-pill px-1.5 py-1.5">
                <div className="flex items-center justify-between gap-1">
                  {NAV.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="flex-1 text-center rounded-full px-3 py-2 text-sm font-medium tracking-tight text-white/75 hover:text-white hover:bg-white/[0.08] transition-all duration-300"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Hero content — centered */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 sm:px-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full liquid-glass liquid-glass-pill text-xs sm:text-sm text-white/55 mb-10">
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

            {/* CTA buttons — liquid glass */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 sm:mt-12 flex flex-wrap justify-center gap-4"
            >
              <Link href={session ? "/dashboard" : "/login"} className="glass-btn-primary">
                <span>{session ? "Go to Dashboard" : "Get Started"}</span>
              </Link>
              <Link href="/tv" className="glass-btn-secondary">
                <span>Browse TV Shows</span>
              </Link>
            </motion.div>

            {/* Quick highlights row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-14 flex flex-wrap justify-center gap-6 sm:gap-8"
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
      <section className="relative py-24 sm:py-32 px-6 sm:px-10 overflow-hidden">
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
      <section className="relative py-24 sm:py-32 px-6 sm:px-10">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-xs font-semibold text-white/35 tracking-[0.2em] uppercase mb-4">
              Categories
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-16">
              Everything in one place.
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <BentoCard key={f.title} delay={i * 0.12}>
                <Link href={f.href} className="block group p-7 sm:p-8 h-full">
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

                  {/* Animated arrow */}
                  <div className="mt-7 flex items-center gap-2 text-sm font-medium text-white/25 group-hover:text-white/60 transition-all duration-300">
                    Explore
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: f.accentColor }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </Link>
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
      <section className="relative py-24 sm:py-32 px-6 sm:px-10 overflow-hidden">
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
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-white/55 transition-colors duration-300"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
