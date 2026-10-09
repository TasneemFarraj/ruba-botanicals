"use client";

import { useAdmin } from "../_components/AdminApp";
import FeedbackManager from "../_components/FeedbackManager";

export default function FeedbackPage() {
  const { products } = useAdmin();
  return <FeedbackManager products={products} />;
}
