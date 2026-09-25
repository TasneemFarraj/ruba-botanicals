import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:     "rounded-xl bg-[#1c3a1a] text-white hover:opacity-90",
        outline:     "rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:opacity-70",
        ghost:       "rounded-xl hover:opacity-60 text-[var(--text-muted)]",
        destructive: "rounded-xl border border-red-200 text-red-400 hover:border-red-400 hover:text-red-500 transition-colors",
        danger:      "rounded-xl bg-red-500 text-white hover:opacity-90",
        wa:          "rounded-xl bg-[#25d366] text-white hover:bg-[#1ebe5d] transition-colors",
      },
      size: {
        default: "px-5 py-2.5 text-sm",
        sm:      "px-3 py-1.5 text-xs",
        xs:      "px-2.5 py-1 text-[11px]",
        icon:    "w-7 h-7",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
