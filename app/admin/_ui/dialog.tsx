"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "./utils";

export const Dialog        = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal  = RadixDialog.Portal;
export const DialogClose   = RadixDialog.Close;

export function DialogOverlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      className={cn(
        "fixed inset-0 z-50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      style={{ background: "rgba(28,58,26,0.45)" }}
      {...props}
    />
  );
}

export function DialogContent({ className, children, dir, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & { dir?: string }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        dir={dir}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-3xl shadow-2xl overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        style={{ background: "#fff" }}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full border transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center px-6 py-5", className)}
      style={{ borderBottom: "1px solid var(--border)" }}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 px-6 py-4", className)}
      style={{ borderTop: "1px solid var(--border)" }}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn("font-display text-xl font-semibold", className)}
      style={{ color: "var(--forest)" }}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn("text-sm", className)}
      style={{ color: "var(--text-muted)" }}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}
