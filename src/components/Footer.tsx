import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            The modern hiring marketplace connecting ambitious talent with category-defining companies.
          </p>
        </div>
        <FooterCol title="Product" items={[["Browse Jobs", "/jobs"], ["Sign In", "/login"], ["Sign Up", "/register"]]} />
        <FooterCol title="Company" items={[["About", "/"], ["Careers", "/"], ["Contact", "/"]]} />
        <FooterCol title="Legal" items={[["Privacy", "/"], ["Terms", "/"], ["Security", "/"]]} />
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TalentBridge. Crafted for hiring teams that obsess over candidate experience.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="hover:text-foreground transition">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
