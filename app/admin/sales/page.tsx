"use client";

import { useAdmin } from "../_components/AdminApp";
import SalesReport from "../_components/SalesReport";
import { Spinner } from "../_components/ui";

export default function SalesPage() {
  const { orders, ordersLoading } = useAdmin();
  return ordersLoading ? <Spinner /> : <SalesReport orders={orders} />;
}
