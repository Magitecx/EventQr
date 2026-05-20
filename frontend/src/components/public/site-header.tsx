import { Link } from "react-router-dom";
import { BrandLogo } from "../brand/brand-logo";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

interface SiteHeaderProps {
  eyebrow: string;
}

const headerLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/docs", label: "Docs" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/help", label: "Help / FAQ" },
];

export function SiteHeader({ eyebrow }: SiteHeaderProps) {
  return (
    <>
      <ThemeToggle className="fixed right-4 top-4 z-50 lg:right-6 lg:top-6" />
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-[var(--color-panel)] px-5 py-4 shadow-[var(--shadow-panel)] backdrop-blur">
      <div className="flex items-center gap-3">
        <BrandLogo imageClassName="h-11" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-700">EventQR</p>
          <p className="font-display text-xl font-semibold text-slate-900">{eyebrow}</p>
        </div>
      </div>

      <nav className="hidden items-center gap-5 text-sm font-medium text-slate-500 md:flex">
        {headerLinks.map((item) => (
          <Link key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link to="/register">
          <Button>Create account</Button>
        </Link>
      </div>
      </header>
    </>
  );
}
