import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
};

const variants = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] shadow-[0_16px_30px_rgba(180,83,9,0.18)]",
  secondary:
    "bg-[var(--color-surface)] text-slate-700 ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-soft)]",
  ghost:
    "bg-transparent text-slate-600 hover:bg-white/80 ring-1 ring-[var(--color-border)]",
  danger:
    "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100",
};

export function Button({ className, variant = "primary", icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
