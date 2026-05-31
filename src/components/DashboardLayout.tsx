import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Search,
  FileText,
  User as UserIcon,
  Briefcase,
  PlusSquare,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

const USER_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Browse Jobs", icon: Search },
  { to: "/applications", label: "My Applications", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/create", label: "Create Job", icon: PlusSquare },
  { to: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
  { to: "/admin/applicants", label: "Applicants", icon: Users },
];

export function DashboardLayout({
  children,
  role,
}: {
  children: ReactNode;
  role: "USER" | "ADMIN";
}) {
  const items = role === "ADMIN" ? ADMIN_NAV : USER_NAV;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar p-4">
      <div className="mb-4 px-1">
        <Logo />
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active =
            path === it.to ||
            (it.to !== "/admin" && it.to !== "/dashboard" && path.startsWith(it.to));
          const isActive = path === it.to || active;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <div className="hidden md:flex">{sidebar}</div>
      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative h-full">
              {sidebar}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="absolute right-2 top-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
