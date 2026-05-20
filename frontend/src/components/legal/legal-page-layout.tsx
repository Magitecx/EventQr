import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandBadge } from "../brand/brand-badge";
import { BrandLogo } from "../brand/brand-logo";
import { Seo } from "../seo/seo";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ThemeToggle } from "../ui/theme-toggle";

type TocItem = {
  id: string;
  label: string;
};

interface LegalPageLayoutProps {
  title: string;
  description: string;
  pathname: string;
  eyebrow: string;
  updatedAt: string;
  toc: TocItem[];
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  description,
  pathname,
  eyebrow,
  updatedAt,
  toc,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen px-4 py-5 text-[var(--color-text)] lg:px-6">
      <Seo description={description} pathname={pathname} title={title} />
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-[var(--color-panel)] px-5 py-4 shadow-[var(--shadow-panel)] backdrop-blur">
          <div className="flex items-center gap-3">
            <BrandLogo imageClassName="h-11" />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-700">EventQR</p>
              <p className="font-display text-xl font-semibold text-slate-900">{eyebrow}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/docs">
              <Button variant="ghost">Docs</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Home</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="h-fit p-5 lg:sticky lg:top-5">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Updated {updatedAt}</p>
            <div className="mt-5 space-y-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  className="block rounded-[8px] px-3 py-2 text-sm text-slate-600 transition hover:bg-[var(--color-surface-soft)] hover:text-slate-900"
                  href={`#${item.id}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </Card>

          <div className="space-y-6">{children}</div>
        </section>

        <footer className="py-6">
          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Questions?</p>
              <p className="text-sm text-slate-500">
                Contact{" "}
                <a className="font-medium text-amber-700 hover:text-amber-800" href="mailto:support@magitecx.com">
                  support@magitecx.com
                </a>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <Link className="hover:text-slate-900" to="/privacy">
                Privacy Policy
              </Link>
              <Link className="hover:text-slate-900" to="/terms">
                Terms of Service
              </Link>
              <BrandBadge compact />
            </div>
          </Card>
        </footer>
      </div>
    </div>
  );
}
