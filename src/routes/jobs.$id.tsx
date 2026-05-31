import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, MapPin, Banknote, Clock, Upload, FileText, CheckCircle2, Loader2, X, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api, type Job } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({ meta: [{ title: "Job · TalentBridge" }] }),
  component: JobDetails,
});

function JobDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // recently viewed
    try {
      const raw = localStorage.getItem("tb_recent") ?? "[]";
      const list: string[] = JSON.parse(raw);
      const next = [id, ...list.filter((x) => x !== id)].slice(0, 5);
      localStorage.setItem("tb_recent", JSON.stringify(next));
    } catch {}
    api.getJob(id).then(setJob).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-dvh bg-background">
        <PublicNav />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">Couldn't load this job</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button asChild className="mt-6" variant="hero"><Link to="/jobs">Back to jobs</Link></Button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-dvh bg-background">
        <PublicNav />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />)}
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="bg-gradient-hero pb-10">
        <PublicNav />
        <div className="mx-auto mt-8 max-w-7xl px-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/jobs"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
          </Button>
          <div className="mt-4 flex flex-wrap items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-lg font-semibold text-primary-foreground shadow-glow">
              {job.company?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground"><Building2 className="mr-1 inline h-3.5 w-3.5" />{job.company}</div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{job.title}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                {job.salary && <span className="inline-flex items-center gap-1"><Banknote className="h-3.5 w-3.5" />{job.salary}</span>}
                {job.jobType && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.jobType}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <article className="space-y-8">
          <Section title="About the role">
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{job.description}</p>
          </Section>
          {job.requirements && (
            <Section title="Requirements"><p className="whitespace-pre-line leading-relaxed text-foreground/90">{job.requirements}</p></Section>
          )}
          {job.benefits && (
            <Section title="Benefits"><p className="whitespace-pre-line leading-relaxed text-foreground/90">{job.benefits}</p></Section>
          )}
          <Section title="About the company">
            <p className="leading-relaxed text-foreground/90">
              {job.company} is hiring on TalentBridge. Verified employer.
            </p>
          </Section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {applied ? (
            <SuccessCard onView={() => navigate({ to: "/applications" })} />
          ) : (
            <ApplyCard
              job={job}
              user={user}
              onApplied={() => setApplied(true)}
              onLoginNeeded={() => navigate({ to: "/login" })}
            />
          )}
        </aside>
      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ApplyCard({ job, user, onApplied, onLoginNeeded }:
  { job: Job; user: any; onApplied: () => void; onLoginNeeded: () => void }) {
  const [cover, setCover] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Please upload a PDF resume"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setFile(f);
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 8 + Math.random() * 14;
      if (p >= 100) { p = 100; clearInterval(t); }
      setProgress(p);
    }, 80);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to apply"); onLoginNeeded(); return; }
    if (!cover.trim()) { toast.error("Add a short cover letter"); return; }
    if (!file) { toast.error("Upload your resume"); return; }
    setLoading(true);
    try {
      await api.apply({
        jobId: job.id,
        userId: user.id,
        coverLetter: cover,
        resume: file,
      });
      toast.success("Application submitted");
      onApplied();
    } catch (err: any) {
      toast.error(err.message || "Couldn't submit application");
    } finally { setLoading(false); }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-elevated"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Apply now</div>
        <div className="mt-1 text-lg font-semibold">{job.salary || "Competitive compensation"}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {job.jobType && <Badge variant="outline">{job.jobType}</Badge>}
          {job.location && <Badge variant="secondary">{job.location}</Badge>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Cover letter</label>
        <Textarea value={cover} onChange={(e) => setCover(e.target.value)} rows={4}
          placeholder={`Hi ${job.company} team — I'm excited about this role because…`} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Resume (PDF)</label>
        {file ? (
          <div className="space-y-2 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground"><FileText className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => { setFile(null); setProgress(0); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-1.5" />
            {progress === 100 && <div className="flex items-center gap-1.5 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Upload complete</div>}
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm transition ${
              drag ? "border-primary bg-accent/40" : "border-border bg-background hover:bg-accent/30"
            }`}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div><span className="font-medium text-primary">Click to upload</span> or drag & drop</div>
            <div className="text-xs text-muted-foreground">PDF up to 5MB</div>
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Submitting…" : "Submit application"}
      </Button>
      <Button type="button" variant="ghost" size="sm" className="w-full"><Bookmark className="h-4 w-4" /> Save for later</Button>
    </motion.form>
  );
}

function SuccessCard({ onView }: { onView: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border bg-card p-6 text-center shadow-elevated"
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
        className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
      >
        <CheckCircle2 className="h-6 w-6" />
      </motion.div>
      <h3 className="mt-4 text-lg font-semibold">Application sent!</h3>
      <p className="mt-1 text-sm text-muted-foreground">You'll get a notification the moment your status changes.</p>
      <div className="mt-5 flex flex-col gap-2">
        <Button variant="hero" onClick={onView}>View my applications</Button>
        <Button asChild variant="ghost"><Link to="/jobs">Discover more roles</Link></Button>
      </div>
    </motion.div>
  );
}
