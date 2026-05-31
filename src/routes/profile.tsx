import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Mail, Shield, User as UserIcon } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · TalentBridge" }] }),
  component: Profile,
});

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;

  const completion = 68;

  return (
    <DashboardLayout role={user.role}>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your TalentBridge identity & visibility settings.</p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="h-28 bg-gradient-primary" />
          <div className="-mt-12 px-6 pb-6">
            <div className="flex items-end justify-between">
              <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-gradient-primary text-2xl font-semibold text-primary-foreground shadow-glow">
                {user.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate({ to: "/" }); }}>Sign out</Button>
            </div>
            <div className="mt-4">
              <div className="text-xl font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Profile completion</span><span>{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Info icon={UserIcon} label="Name" value={user.name} />
          <Info icon={Mail} label="Email" value={user.email} />
          <Info icon={Shield} label="Role" value={user.role} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}
