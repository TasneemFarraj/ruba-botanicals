"use client";

import { useState, useEffect } from "react";

export type ToastVariant = "default" | "success" | "error";

export interface ToastItem {
  id:          string;
  title:       string;
  description?: string;
  variant?:    ToastVariant;
  duration?:   number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export function toast(item: Omit<ToastItem, "id">) {
  const t: ToastItem = { id: Math.random().toString(36).slice(2), variant: "default", ...item };
  toasts = [t, ...toasts];
  notify();
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" });

toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "error" });

export function useToastState() {
  const [state, setState] = useState<ToastItem[]>([]);

  useEffect(() => {
    setState([...toasts]);
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);

  const remove = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  };

  return { toasts: state, remove };
}
