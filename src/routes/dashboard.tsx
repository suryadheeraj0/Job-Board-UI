import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowRight, FileText, Sparkles, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { api, type Application, type Job } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/Skeletons";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · TalentBridge" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    if (!user) { navigate({ to: "/login" }); return; }
    api.appsByUser(user.id).then((a) => setApps(Array.isArray(a) ? a : [])).catch(() => setApps([]));
    api.listJobs().then((j) => setJobs(Array.isArray(j) ? j : [])).catch(() => setJobs([]));
  }, [user, navigate]);

  if (!user) return null;

  const total = apps?.length ?? 0;
  const active = apps?.filter((a) => a.status === "APPLIED").length ?? 0;
  const shortlisted = apps?.filter((a) => a.status === "SHORTLISTED").length ?? 0;
  const rejected = apps?.filter((a) => a.status === "REJECTED").length ?? 0;

  const stats = [
    { label: "Applications submitted", value: total, trend: "+12%", icon: FileText, color: "text-info" },
    { label: "Active applications", value: active, trend: "+4", icon: Clock, color: "text-primary" },
    { label: "Shortlisted", value: shortlisted, trend: "+2", icon: CheckCircle2, color: "text-success" },
    { label: "Rejected", value: rejected, trend: "—", icon: XCircle, color: "text-destructive" },
  ];

  const chartData = Array.from({ length: 8 }).map((_, i) => ({
    day: ["M", "T", "W", "T", "F", "S", "S", "M"][i],
    value: Math.max(0, Math.round(total / 2 + Math.sin(i) * 3 + i * 0.5)),
  }));

  return (
    <DashboardLayout role="USER">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Welcome back</div>
            <h1 className="text-3xl font-semibold tracking-tight">Hi {user.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your job search.</p>
          </div>
          <Button asChild variant="hero"><Link to="/jobs">Find new roles <ArrowRight className="h-4 w-4" /></Link></Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-xl bg-accent ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <TrendingUp className="h-3 w-3" /> {s.trend}
                </div>
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Application activity</div>
                <div className="text-xs text-muted-foreground">Last 8 days</div>
              </div>
              <div className="text-2xl font-semibold tracking-tight">{total}</div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.18 280)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.7 0.18 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.5 0.02 260 / 0.15)" />
                  <XAxis dataKey="day" stroke="oklch(0.5 0.02 260)" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="oklch(0.5 0.02 260)" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                  <Area type="monotone" dataKey="value" stroke="oklch(0.7 0.18 280)" strokeWidth={2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Profile strength</div>
            <div className="mt-4">
              <div className="flex items-end justify-between">
                <div className="text-4xl font-semibold tracking-tight">68%</div>
                <div className="text-xs text-muted-foreground">7 of 10 complete</div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-gradient-primary" />
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { d: "Add a profile photo", done: false },
                { d: "Upload an updated resume", done: true },
                { d: "Add 3 work experiences", done: true },
              ].map((it) => (
                <li key={it.d} className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${it.done ? "text-success" : "text-muted-foreground/40"}`} />
                  <span className={it.done ? "text-muted-foreground line-through" : ""}>{it.d}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-5 w-full"><Link to="/profile">Complete profile</Link></Button>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended for you</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/jobs">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs === null
              ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
              : jobs.slice(0, 3).map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
