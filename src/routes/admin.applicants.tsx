import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X, Mail, FileText, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { api, type Application, type Job } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/applicants")({
  head: () => ({ meta: [{ title: "Applicants · TalentBridge" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    jobId: typeof s.jobId === "string" ? s.jobId : undefined,
  }),
  component: Applicants,
});

function statusStyle(s: Application["status"]) {
  if (s === "SHORTLISTED") return "bg-success/15 text-success border-success/30";
  if (s === "REJECTED") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-info/15 text-info border-info/30";
}

function Applicants() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId: initial } = Route.useSearch();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState<string | undefined>(initial);
  const [apps, setApps] = useState<Application[] | null>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    api.listJobs().then((j) => {
      const arr = Array.isArray(j) ? j : [];
      setJobs(arr);
      if (!jobId && arr[0]) setJobId(String(arr[0].id));
    });
  }, [user, navigate]);

  useEffect(() => {
    if (!jobId) return;
    setApps(null);
    api
      .appsByJob(jobId)
      .then((a) => setApps(Array.isArray(a) ? a : []))
      .catch(() => setApps([]));
  }, [jobId]);

  const setStatus = async (a: Application, status: Application["status"]) => {
    try {
      await api.updateAppStatus(a.id, status, a.coverLetter ?? "");
      setApps((arr) => arr?.map((x) => (x.id === a.id ? { ...x, status } : x)) ?? null);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (e: any) {
      toast.error(e.message || "Could not update");
    }
  };

  const openResume = async (a: Application) => {
    try {
      const blob = await api.downloadResume(a.id);
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        URL.revokeObjectURL(url);
        throw new Error("Unable to open resume preview. Please allow popups.");
      }
      setTimeout(() => URL.revokeObjectURL(url), 1000 * 60 * 2);
    } catch (e: any) {
      toast.error(e.message || "Could not open resume");
    }
  };

  const current = jobs.find((j) => String(j.id) === jobId);

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Applicants</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and triage candidates in your pipeline.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.title} — {j.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {current && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {current.company?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold">{current.title}</div>
              <div className="text-xs text-muted-foreground">
                {current.company} · {current.location}
              </div>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              <Users className="mr-1 inline h-3.5 w-3.5" /> {apps?.length ?? 0} applicants
            </div>
          </div>
        )}

        {apps === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="Share the job link or wait for matches to roll in."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {apps.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                    {(a.candidateName || "U")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {a.candidateName || `Candidate ${a.userId}`}
                    </div>
                    <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {a.candidateEmail || "candidate@email.com"}
                    </div>
                  </div>
                  <Badge variant="outline" className={statusStyle(a.status)}>
                    {a.status}
                  </Badge>
                </div>
                {a.coverLetter && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{a.coverLetter}</p>
                )}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openResume(a)}>
                    <FileText className="h-4 w-4" /> Resume
                  </Button>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setStatus(a, "REJECTED")}>
                      <X className="h-4 w-4 text-destructive" /> Reject
                    </Button>
                    <Button size="sm" variant="hero" onClick={() => setStatus(a, "SHORTLISTED")}>
                      <Check className="h-4 w-4" /> Shortlist
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
