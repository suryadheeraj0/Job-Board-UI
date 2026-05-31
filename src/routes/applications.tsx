import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Building2, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { api, type Application } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "My applications · TalentBridge" }] }),
  component: MyApplications,
});

function statusStyle(s: Application["status"]) {
  if (s === "SHORTLISTED") return "bg-success/15 text-success border-success/30";
  if (s === "REJECTED") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-info/15 text-info border-info/30";
}

function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[] | null>(null);

  useEffect(() => {
    if (!user) { navigate({ to: "/login" }); return; }
    api.appsByUser(user.id).then((a) => setApps(Array.isArray(a) ? a : [])).catch(() => setApps([]));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <DashboardLayout role="USER">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">My applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every role you've applied to in one place.</p>
        </header>

        {apps === null ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Browse open roles and submit your first application — we'll track everything here."
            action={<Button asChild variant="hero"><Link to="/jobs"><Search className="h-4 w-4" /> Browse jobs</Link></Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-soft md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Job</th>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id} className="border-t border-border transition hover:bg-accent/30">
                      <td className="px-5 py-3 font-medium">{a.jobTitle || `Job #${a.jobId}`}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.company || "—"}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className={statusStyle(a.status)}>{a.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {a.appliedAt || a.createdAt ? new Date(a.appliedAt || a.createdAt!).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {apps.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="font-medium">{a.jobTitle || `Job #${a.jobId}`}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />{a.company || "—"}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className={statusStyle(a.status)}>{a.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {a.appliedAt || a.createdAt ? new Date(a.appliedAt || a.createdAt!).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
