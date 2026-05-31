import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Building2, Banknote, Clock, ArrowRight } from "lucide-react";
import type { Job } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function initials(s: string) {
  return s
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const isNew = (() => {
    const d = job.createdAt || job.postedAt;
    if (!d) return false;
    return (Date.now() - new Date(d).getTime()) / 86400000 < 7;
  })();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <div className="group relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-soft">
            {initials(job.company || "?")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">{job.title}</h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" /> {job.company}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Save job">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {isNew && <Badge className="bg-info text-info-foreground hover:bg-info">New</Badge>}
          {job.isRemote && <Badge variant="secondary">Remote</Badge>}
          {job.isUrgent && (
            <Badge className="bg-warning text-warning-foreground hover:bg-warning">Urgent</Badge>
          )}
          {job.jobType && <Badge variant="outline">{job.jobType}</Badge>}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1">
              <Banknote className="h-3 w-3" />
              {job.salary}
            </span>
          )}
          {(job.createdAt || job.postedAt) && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(job.createdAt || job.postedAt!).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/jobs/$id" params={{ id: String(job.id) }}>
              Details
            </Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/jobs/$id" params={{ id: String(job.id) }}>
              Apply <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
