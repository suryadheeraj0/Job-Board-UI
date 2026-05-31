import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Code2,
  LineChart,
  Megaphone,
  Palette,
  Rocket,
  Search,
  Sparkles,
  Star,
  Zap,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/Counter";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/Skeletons";
import { api, type Job } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentBridge — Find your dream career faster" },
      {
        name: "description",
        content:
          "Discover roles from leading companies. Apply in minutes with a premium candidate experience.",
      },
    ],
  }),
  component: Landing,
});

const CATEGORIES = [
  { label: "Software Engineering", icon: Code2 },
  { label: "Data Science", icon: LineChart },
  { label: "Product Management", icon: Rocket },
  { label: "Design", icon: Palette },
  { label: "Marketing", icon: Megaphone },
  { label: "Operations", icon: Briefcase },
];

const WHY = [
  {
    icon: Zap,
    title: "Apply in 60 seconds",
    body: "Reusable profile, drag-and-drop resume, zero friction.",
  },
  {
    icon: ShieldCheck,
    title: "Verified employers",
    body: "Every company on TalentBridge is vetted by our team.",
  },
  {
    icon: Sparkles,
    title: "Personalised matches",
    body: "We surface roles based on your skills, not your keywords.",
  },
  {
    icon: Clock,
    title: "Real-time updates",
    body: "Get notified the moment your application status changes.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Senior PM at Linear",
    quote:
      "TalentBridge was the only platform where I felt like a candidate, not a row in a database.",
  },
  {
    name: "Marcus Reyes",
    role: "Staff Engineer at Vercel",
    quote: "Landed three onsites in a week. The product is what hiring should feel like in 2026.",
  },
  {
    name: "Priya Patel",
    role: "Design Lead at Notion",
    quote: "The polish here is genuinely best-in-class — both for candidates and recruiters.",
  },
];

function Landing() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    api
      .listJobs()
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]));
  }, []);

  const featured = (jobs ?? []).slice(0, 9);
  const perPage = 3;
  const pages = Math.max(1, Math.ceil(featured.length / perPage));
  const visible = featured.slice(slide * perPage, slide * perPage + perPage);

  return (
    <div className="min-h-dvh bg-background">
      <div className="bg-gradient-hero">
        <PublicNav />
        <Hero />
      </div>

      {/* Stats */}
      <section className="mx-auto -mt-12 max-w-7xl px-6">
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-elevated sm:grid-cols-3">
          {[
            { v: jobs?.length ?? 1240, label: "Open roles", suffix: "+" },
            { v: 520, label: "Companies hiring", suffix: "+" },
            { v: 18400, label: "Applications submitted", suffix: "+" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                <Counter to={s.v} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <SectionHeader
          eyebrow="Featured roles"
          title="Hand-picked opportunities this week"
          subtitle="A curated slice of the best companies hiring right now."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSlide((s) => (s - 1 + pages) % pages)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSlide((s) => (s + 1) % pages)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/jobs">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          }
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs === null ? (
            Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : visible.length > 0 ? (
            visible.map((j, i) => <JobCard key={j.id} job={j} index={i} />)
          ) : (
            <SampleCards />
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <SectionHeader eyebrow="Explore" title="Browse by category" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/jobs"
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">{c.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <SectionHeader
          eyebrow="Why TalentBridge"
          title="Built for how modern teams actually hire"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{w.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{w.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <SectionHeader eyebrow="Loved by candidates" title="What our community is saying" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft"
            >
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-primary p-10 text-primary-foreground shadow-glow md:p-16">
          <div className="absolute inset-0 opacity-30 grid-bg" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Your next chapter starts here.
              </h2>
              <p className="mt-2 max-w-xl text-primary-foreground/90">
                Create a free profile and let the right opportunities find you.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" variant="glass">
                <Link to="/jobs">Browse jobs</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link to="/register">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <div className="absolute inset-0 -z-0 opacity-50 grid-bg" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Now matching 18,000+ candidates with
          category-defining teams
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
          Find your <span className="text-gradient">dream career</span>
          <br className="hidden md:block" /> faster.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Discover opportunities from leading companies and apply in minutes with a candidate
          experience that respects your time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="xl" variant="hero">
            <Link to="/jobs">
              <Search className="h-4 w-4" /> Browse Jobs
            </Link>
          </Button>
          <Button asChild size="xl" variant="glass">
            <Link to="/register">Sign up free</Link>
          </Button>
        </div>
      </motion.div>

      {/* Floating UI */}
      <div className="pointer-events-none relative mx-auto mt-14 hidden max-w-4xl md:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass rounded-2xl p-3 shadow-elevated"
        >
          <div className="flex items-center gap-3 rounded-xl bg-background px-4 py-3 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Senior Product Designer · Remote · $140k–$180k
            </span>
            <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              Match 96%
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -30, rotate: -6 }}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="absolute -left-6 top-12 w-60 rounded-2xl border border-border bg-card p-4 shadow-elevated"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Linear</span>
          </div>
          <div className="mt-2 text-sm font-semibold">Staff Engineer</div>
          <div className="mt-1 text-xs text-muted-foreground">San Francisco · Hybrid</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 6 }}
          animate={{ opacity: 1, x: 0, rotate: 6 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="absolute -right-6 top-12 w-60 rounded-2xl border border-border bg-card p-4 shadow-elevated"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Application sent</span>
          </div>
          <div className="mt-2 text-sm font-semibold">Notion · Product Designer</div>
          <div className="mt-1 text-xs text-success">Shortlisted in 4 hours</div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function SampleCards() {
  const samples: Job[] = [
    {
      id: "s1",
      title: "Senior Frontend Engineer",
      company: "Linear",
      location: "Remote · US",
      salary: "$160k–$210k",
      jobType: "FULL_TIME",
      description: "Build the most beautiful issue tracking experience on the planet.",
      isRemote: true,
    },
    {
      id: "s2",
      title: "Product Designer",
      company: "Notion",
      location: "San Francisco",
      salary: "$140k–$180k",
      jobType: "FULL_TIME",
      description: "Shape the future of connected workspaces. Strong systems thinking required.",
      isUrgent: true,
    },
    {
      id: "s3",
      title: "Staff PM",
      company: "Vercel",
      location: "Hybrid · NYC",
      salary: "$200k–$260k",
      jobType: "FULL_TIME",
      description: "Lead platform strategy for the world's frontend cloud.",
      isRemote: true,
    },
  ];
  return (
    <>
      {samples.map((j, i) => (
        <JobCard key={j.id} job={j} index={i} />
      ))}
    </>
  );
}
