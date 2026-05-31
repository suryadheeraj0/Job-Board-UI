import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Users, Search, Briefcase, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { api, type Job } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/jobs")({
  head: () => ({ meta: [{ title: "Manage jobs · TalentBridge" }] }),
  component: ManageJobs,
});

function ManageJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    refresh();
  }, [user, navigate]);

  function refresh() {
    api
      .listJobs()
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]));
  }

  const filtered = useMemo(() => {
    if (!jobs) return [];
    if (!q) return jobs;
    return jobs.filter((j) =>
      `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q.toLowerCase()),
    );
  }, [jobs, q]);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.deleteJob(id);
      toast.success("Job deleted");
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Manage jobs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {jobs?.length ?? 0} roles on TalentBridge.
            </p>
          </div>
          <Button asChild variant="hero">
            <Link to="/admin/create">
              <Plus className="h-4 w-4" /> New job
            </Link>
          </Button>
        </header>

        <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs…"
              className="h-10 border-0 bg-transparent pl-9 focus-visible:ring-0"
            />
          </div>
        </div>

        {jobs === null ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Post your first role and start receiving applications today."
            action={
              <Button asChild variant="hero">
                <Link to="/admin/create">Create job</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Job</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Company</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Location</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Type</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id} className="border-t border-border transition hover:bg-accent/30">
                    <td className="px-5 py-3 font-medium">{j.title}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                      {j.company}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                      {j.location}
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      {j.jobType && <Badge variant="outline">{j.jobType}</Badge>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/admin/applicants" search={{ jobId: String(j.id) } as any}>
                            <Users className="h-3.5 w-3.5" /> Applicants
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" aria-label="Edit">
                          <Link to="/admin/create" search={{ jobId: String(j.id) } as any}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(j.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
