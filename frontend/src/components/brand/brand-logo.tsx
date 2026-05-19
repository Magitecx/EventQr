import { useTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  imageClassName?: string;
  forceVariant?: "light" | "dark";
};

export function BrandLogo({
  alt = "Magitecx logo",
  className,
  imageClassName,
  forceVariant,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const variant = forceVariant ?? theme;
  const src = variant === "dark" ? "/logo-dark.png" : "/logo.png";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_10px_24px_rgba(148,163,184,0.08)]",
        className,
      )}
    >
      <img alt={alt} className={cn("h-10 w-auto object-contain", imageClassName)} src={src} />
    </div>
  );
}
