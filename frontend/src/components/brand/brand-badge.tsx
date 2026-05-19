import { BrandLogo } from "./brand-logo";
import { cn } from "../../lib/utils";

type BrandBadgeProps = {
  className?: string;
  compact?: boolean;
  forceVariant?: "light" | "dark";
};

export function BrandBadge({ className, compact = false, forceVariant }: BrandBadgeProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandLogo
        className={compact ? "rounded-[18px] p-1.5" : undefined}
        imageClassName={compact ? "h-8" : "h-10"}
        forceVariant={forceVariant}
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
