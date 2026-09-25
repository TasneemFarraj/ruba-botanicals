import { cn } from "./utils";

export function Badge({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap", className)}
      style={{ background: "var(--forest-pale)", color: "var(--forest-mid)", ...style }}
      {...props}
    />
  );
}
