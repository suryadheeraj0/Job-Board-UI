import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, Building2, MapPin, Banknote, FileText } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/create")({
  head: () => ({ meta: [{ title: "Create job · TalentBridge" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    jobId: typeof s.jobId === "string" ? s.jobId : undefined,
  }),
  component: CreateJob,
});

function CreateJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = Route.useSearch();
  const isEdit = Boolean(jobId);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "FULL_TIME",
    description: "",
    requirements: "",
    benefits: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !jobId) return;
    setInitialLoading(true);
    api
      .getJob(jobId)
      .then((job) => {
        setForm({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          salary: job.salary || "",
          jobType: job.jobType || "FULL_TIME",
          description: job.description || "",
          requirements: job.requirements || "",
          benefits: job.benefits || "",
        });
      })
      .catch((err: any) => {
        toast.error(err.message || "Could not load job details");
        navigate({ to: "/admin/jobs" });
      })
      .finally(() => setInitialLoading(false));
  }, [user, jobId, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) {
      toast.error("Title, company, and description are required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit && jobId) {
        await api.updateJob(jobId, form);
        toast.success("Job updated");
      } else {
        await api.createJob(form);
        toast.success("Job posted");
      }
      navigate({ to: "/admin/jobs" });
    } catch (err: any) {
      toast.error(err.message || (isEdit ? "Could not update job" : "Could not create job"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isEdit ? "Edit job" : "Post a new job"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? "Update the role details and keep your posting fresh."
              : "Reach 18,000+ active candidates within minutes."}
          </p>
        </header>
        <form onSubmit={submit} className="space-y-6">
          <Section title="Role basics" icon={Briefcase}>
            <Field label="Job title" required>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Product Designer"
              />
            </Field>
            <Field label="Company" required>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Linear"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location">
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Remote · US"
                />
              </Field>
              <Field label="Salary range">
                <Input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="$140k–$180k"
                />
              </Field>
            </div>
            <Field label="Job type">
              <Select value={form.jobType} onValueChange={(v) => setForm({ ...form, jobType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>
          <Section title="Details" icon={FileText}>
            <Field label="Description" required>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What will this person do? What does success look like?"
              />
            </Field>
            <Field label="Requirements">
              <Textarea
                rows={4}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="Must-have skills, experience, etc."
              />
            </Field>
            <Field label="Benefits">
              <Textarea
                rows={3}
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                placeholder="Equity, healthcare, learning budget…"
              />
            </Field>
          </Section>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/admin/jobs" })}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? isEdit
                  ? "Updating…"
                  : "Publishing…"
                : isEdit
                  ? "Update job"
                  : "Publish job"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
