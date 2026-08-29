"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "whatsapp";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:  "bg-forest text-cream border border-forest hover:bg-olive hover:border-olive",
  outline:  "bg-transparent text-forest border border-forest hover:bg-forest hover:text-cream",
  ghost:    "bg-transparent text-bark border border-transparent hover:border-border hover:bg-beige",
  whatsapp: "bg-[#25D366] text-white border border-[#25D366] hover:bg-[#1ebe5d]",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-4   py-1.5",
  md: "text-xs px-5   py-2.5",
  lg: "text-sm px-6   py-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-body font-semibold tracking-wide
        transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-3 h-3 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}