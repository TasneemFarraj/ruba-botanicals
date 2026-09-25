"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "./utils";

export const Select        = RadixSelect.Root;
export const SelectGroup   = RadixSelect.Group;
export const SelectValue   = RadixSelect.Value;

export function SelectTrigger({ className, style, children, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>) {
  return (
    <RadixSelect.Trigger
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl px-3 text-sm outline-none transition-colors",
        "focus:ring-1 focus:ring-[rgba(28,58,26,0.35)] disabled:opacity-50",
        "h-9",
        className
      )}
      style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--text-dark)", ...style }}
      {...props}
    >
      {children}
      <RadixSelect.Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectContent({ className, children, position = "popper", ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Content>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position={position}
        sideOffset={6}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-xl shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        style={{ background: "#fff", border: "1px solid var(--border)" }}
        {...props}
      >
        <RadixSelect.Viewport className="p-1">
          {children}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Item>) {
  return (
    <RadixSelect.Item
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer select-none",
        "data-[highlighted]:bg-[var(--forest-pale)] data-[highlighted]:text-[var(--forest)]",
        "data-[state=checked]:font-semibold",
        className
      )}
      style={{ color: "var(--text-dark)" }}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

export function SelectLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Label>) {
  return (
    <RadixSelect.Label
      className={cn("px-3 py-1.5 text-[11px] font-semibold", className)}
      style={{ color: "var(--text-light)" }}
      {...props}
    />
  );
}

export function SelectSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>) {
  return (
    <RadixSelect.Separator
      className={cn("mx-1 my-1 h-px", className)}
      style={{ background: "var(--border)" }}
      {...props}
    />
  );
}
