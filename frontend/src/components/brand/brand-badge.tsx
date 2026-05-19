import { cn } from "../../lib/utils";

type BrandBadgeProps = {
  className?: string;
  compact?: boolean;
};

export function BrandBadge({ className, compact = false }: BrandBadgeProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        alt="Magitecx logo"
        className={compact ? "h-8 w-auto object-contain" : "h-10 w-auto object-contain"}
        src="/logo.png"
      />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Powered by
        </p>
        <p className={compact ? "text-sm font-semibold text-slate-900" : "text-base font-semibold text-slate-900"}>
          Magitecx
        </p>
      </div>
    </div>
  );
}
