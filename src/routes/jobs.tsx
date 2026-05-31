import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, X, SlidersHorizontal, Briefcase } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { api, type Job } from "@/lib/api";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Browse jobs · TalentBridge" }] }),
  component: JobsPage,
});

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

function JobsPage() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    api
      .listJobs()
      .then((j) => setJobs(Array.isArray(j) ? j : []))
      .catch(() => setJobs([]));
  }, []);

  const filtered = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((j) => {
      const haystack = `${j.title} ${j.company} ${j.description}`.toLowerCase();
      if (q && !haystack.includes(q.toLowerCase())) return false;
      if (loc && !(j.location ?? "").toLowerCase().includes(loc.toLowerCase())) return false;
      if (types.length && j.jobType && !types.includes(j.jobType)) return false;
      return true;
    });
  }, [jobs, q, loc, types]);

  const toggleType = (t: string) =>
    setTypes((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  const activeFilters = [
    q && { label: `"${q}"`, clear: () => setQ("") },
    loc && { label: loc, clear: () => setLoc("") },
    ...types.map((t) => ({ label: t, clear: () => toggleType(t) })),
  ].filter(Boolean) as { label: string; clear: () => void }[];

  if (path !== "/jobs" && path.startsWith("/jobs/")) {
    return (
      <div className="min-h-dvh bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="bg-gradient-hero pb-12">
        <PublicNav />
        <div className="mx-auto mt-10 max-w-7xl px-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Browse open roles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search and filter across {jobs?.length ?? "—"} live opportunities.
          </p>
          <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft md:grid-cols-[1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job title, company, keyword…"
                className="pl-9 h-11 border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="Location or Remote"
                className="pl-9 h-11 border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <Button variant="hero" size="lg">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-6 grid max-w-7xl gap-6 px-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Job type
                </Label>
                <div className="mt-2 space-y-1.5">
                  {JOB_TYPES.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-accent/40"
                    >
                      <Checkbox checked={types.includes(t)} onCheckedChange={() => toggleType(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setQ("");
                  setLoc("");
                  setTypes([]);
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {jobs === null ? (
                "Loading…"
              ) : (
                <>
                  <span className="font-medium text-foreground">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "role" : "roles"} found
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f, i) => (
                <Badge key={i} variant="secondary" className="gap-1.5">
                  {f.label}
                  <button onClick={f.clear} aria-label="Remove filter">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {jobs === null ? (
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No matching roles"
              description="Try widening your filters or clearing your search to discover more opportunities."
              action={
                <Button
                  variant="hero"
                  onClick={() => {
                    setQ("");
                    setLoc("");
                    setTypes([]);
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((j, i) => (
                <JobCard key={j.id} job={j} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Outlet />
      <Footer />
    </div>
  );
}
