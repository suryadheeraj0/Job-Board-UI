import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export function Logo({ to = "/", className = "" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
        <Briefcase className="h-4 w-4 text-primary-foreground" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Talent<span className="text-gradient">Bridge</span>
      </span>
    </Link>
  );
}
