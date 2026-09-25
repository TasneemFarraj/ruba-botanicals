"use client";

import { useToastState } from "./use-toast";
import { useEffect, useState } from "react";

function ToastItem({
  id, title, description, variant = "default", duration = 4000,
  onRemove,
}: {
  id: string; title: string; description?: string;
  variant?: "default" | "success" | "error"; duration?: number;
  onRemove: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration - 300);
    return () => clearTimeout(t);
  }, [duration]);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(onRemove, 300);
      return () => clearTimeout(t);
    }
  }, [visible, onRemove]);

  const bg = variant === "success" ? "#1c3a1a" : variant === "error" ? "#dc2626" : "#1c3a1a";

  return (
    <div
      className="flex items-start gap-3 px-5 py-3.5 rounded-2xl shadow-lg min-w-[240px] max-w-[360px] transition-all duration-300"
      style={{
        background: bg, color: "#fff",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description && <p className="text-[12px] mt-0.5 opacity-80">{description}</p>}
      </div>
      <button onClick={() => setVisible(false)} className="opacity-60 hover:opacity-100 mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
          <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, remove } = useToastState();
  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
}
