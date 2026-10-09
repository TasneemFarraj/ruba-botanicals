import type { Metadata } from "next";
import { ForceLight } from "./_ui/force-light";
import AdminApp from "./_components/AdminApp";

export const metadata: Metadata = {
  title: "لوحة التحكم | ربى فرّاج",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="light" style={{ color: "var(--text-1)" }}>
      <ForceLight />
      <AdminApp>{children}</AdminApp>
    </div>
  );
}
