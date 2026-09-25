import { cn } from "./utils";

export function Input({ className, style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors",
        "focus:ring-1 focus:ring-[rgba(28,58,26,0.35)]",
        className
      )}
      style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-dark)", ...style }}
      {...props}
    />
  );
}

export function Textarea({ className, style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none",
        "focus:ring-1 focus:ring-[rgba(28,58,26,0.35)]",
        className
      )}
      style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-dark)", ...style }}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium mb-1.5", className)}
      style={{ color: "var(--text-muted)" }}
      {...props}
    />
  );
}
