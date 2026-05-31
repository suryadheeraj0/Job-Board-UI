import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell, Legend } from "recharts";
import { Briefcase, Users, FileText, TrendingUp, Building2, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { api, type Job } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin · TalentBridge" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    if (!user) { navigate({ to: "/login" }); return; }
    api.listJobs().then((j) => setJobs(Array.isArray(j) ? j : [])).catch(() => setJobs([]));
  }, [user, navigate]);

  if (!user) return null;

  const stats = [
    { label: "Total jobs", value: jobs?.length ?? 0, icon: Briefcase, trend: "+8%" },
    { label: "Active jobs", value: jobs?.length ?? 0, icon: TrendingUp, trend: "+5" },
    { label: "Applications", value: 1284, icon: FileText, trend: "+12%" },
    { label: "Candidates", value: 932, icon: Users, trend: "+3%" },
  ];

  const chart = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
    day: d, apps: 20 + Math.round(Math.sin(i) * 8 + i * 4), views: 80 + i * 6,
  }));
  const pie = [
    { name: "Applied", value: 60, fill: "oklch(0.65 0.16 230)" },
    { name: "Shortlisted", value: 25, fill: "oklch(0.65 0.17 155)" },
    { name: "Rejected", value: 15, fill: "oklch(0.62 0.22 25)" },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Hiring control center</div>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your applicant tracking system at a glance.</p>
          </div>
          <Button asChild variant="hero"><Link to="/admin/create">Post a new job <ArrowRight className="h-4 w-4" /></Link></Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary"><s.icon className="h-4 w-4" /></div>
                <span className="text-xs font-medium text-success">{s.trend}</span>
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight">{s.value.toLocaleString()}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 text-sm font-semibold">Pipeline activity</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.5 0.02 260 / 0.15)" />
                  <XAxis dataKey="day" stroke="oklch(0.5 0.02 260)" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="oklch(0.5 0.02 260)" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                  <Bar dataKey="apps" fill="oklch(0.7 0.18 280)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="views" fill="oklch(0.78 0.17 295 / 0.4)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 text-sm font-semibold">Candidate funnel</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {pie.map((p, i) => <Cell key={i} fill={p.fill} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Recent jobs</div>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/jobs">Manage all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          <div className="divide-y divide-border">
            {(jobs?.slice(0, 5) ?? []).map((j) => (
              <div key={j.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {j.company?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{j.title}</div>
                    <div className="text-xs text-muted-foreground"><Building2 className="mr-1 inline h-3 w-3" />{j.company}</div>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/applicants" search={{ jobId: String(j.id) } as any}>View applicants</Link>
                </Button>
              </div>
            ))}
            {jobs && jobs.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No jobs yet — post your first one.</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
