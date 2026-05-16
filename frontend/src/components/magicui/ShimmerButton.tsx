import React from "react";
import { cn } from "../../utils/cn";

export function ShimmerButton({
  className,
  children,
  onClick,
  disabled,
  type = "button"
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gray-900 px-6 py-3.5 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      <span className="relative flex items-center justify-center gap-2 font-semibold tracking-wide">
        {children}
      </span>
    </button>
  );
}
