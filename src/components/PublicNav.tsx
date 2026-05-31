import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Browse Jobs" },
];

export function PublicNav() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "text-foreground bg-accent/60" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <Button asChild variant="hero" size="sm">
              <Link to={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
