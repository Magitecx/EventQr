import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
};

const variants = {
  primary:
    "bg-[var(--color-accent)] text-slate-950 hover:bg-[var(--color-accent-strong)] shadow-[0_14px_30px_rgba(245,158,11,0.28)]",
  secondary:
    "bg-white/10 text-slate-100 ring-1 ring-white/10 hover:bg-white/14",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/8 ring-1 ring-white/10",
  danger:
    "bg-rose-500/18 text-rose-200 ring-1 ring-rose-400/20 hover:bg-rose-500/24",
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
