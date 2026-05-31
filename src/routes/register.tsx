import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · TalentBridge" }] }),
  component: Register,
});

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const s = strength(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please complete all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await api.register({ name, email, password });
      const u = {
        id: data.id ?? data.userId ?? data.user?.id ?? email,
        name: data.name ?? data.user?.name ?? name,
        email: data.email ?? data.user?.email ?? email,
        role: (data.role ?? data.user?.role ?? "USER") as "ADMIN" | "USER",
        token: data.token ?? data.accessToken ?? data.jwt,
      };
      setUser(u);
      toast.success("Welcome to TalentBridge!");
      navigate({ to: u.role === "ADMIN" ? "/admin" : "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh bg-gradient-hero md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between p-12 md:flex">
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-semibold leading-tight">
            Join 18,000+ candidates discovering
            <br />
            <span className="text-gradient">their next chapter</span>.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            {[
              "Apply in 60 seconds with a reusable profile",
              "Real-time status updates",
              "Personalised matches, not keyword spam",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" /> {b}
              </li>
            ))}
          </ul>
        </motion.div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TalentBridge
        </div>
      </aside>
      <div className="flex items-center justify-center p-6">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-card p-8 shadow-elevated"
        >
          <div className="md:hidden">
            <Logo />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start applying to top companies in minutes.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                placeholder="Jane Doe"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-9"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition ${
                    s > i
                      ? s >= 3
                        ? "bg-success"
                        : s === 2
                          ? "bg-warning"
                          : "bg-destructive"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Use 8+ characters with a mix of letters, numbers, and symbols.
            </p>
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
