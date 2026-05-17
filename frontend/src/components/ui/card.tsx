import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.84))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
