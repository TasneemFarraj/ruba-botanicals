import type { Product } from "../../_types";
import { getDiscount } from "../../_lib/utils";

/** Selling price, with the pre-discount price crossed out when discounted */
export function PriceTag({ product, size = 15, color = "var(--gold)" }: { product: Product; size?: number; color?: string }) {
  const discount = getDiscount(product);
  return (
    <span className="inline-flex items-baseline flex-wrap gap-x-1.5">
      <span className="font-display tabular-nums" style={{ fontSize: size, color, lineHeight: 1 }}>
        {product.price}
        <span className="font-normal ms-0.5" style={{ fontSize: Math.round(size * 0.72), color: "var(--text-2)" }}>د.أ</span>
      </span>
      {discount && (
        <s className="tabular-nums" style={{ fontSize: Math.round(size * 0.8), color: "var(--text-2)" }}>
          {discount.original}
        </s>
      )}
    </span>
  );
}

/** "خصم 20%" pill — renders nothing when there's no discount */
export function DiscountBadge({ product, className = "", style }: { product: Product; className?: string; style?: React.CSSProperties }) {
  const discount = getDiscount(product);
  if (!discount) return null;
  return (
    <span
      className={className}
      style={{
        background: "#b91c1c",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 999,
        ...style,
      }}
    >
      خصم {discount.percent}%
    </span>
  );
}
