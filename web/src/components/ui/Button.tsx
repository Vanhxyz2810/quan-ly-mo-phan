import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-button,6px)] transition-opacity disabled:opacity-50 cursor-pointer";

  const variants = {
    primary: "bg-(--color-secondary) text-white hover:opacity-90",
    outline:
      "border border-(--color-secondary) text-(--color-secondary) bg-transparent hover:bg-(--color-secondary)/10",
    ghost: "text-(--color-muted) hover:bg-black/5",
    danger: "bg-(--color-map-occupied) text-white hover:opacity-90",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
