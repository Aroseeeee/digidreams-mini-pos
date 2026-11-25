import type { AppliedPromo } from "./types";

export const TAX_RATE = 0.1;

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function calculateDiscount(
  subtotal: number,
  promo: Pick<AppliedPromo, "type" | "value"> | null,
): number {
  if (!promo || subtotal <= 0) {
    return 0;
  }

  const rawDiscount =
    promo.type === "PERCENT"
      ? Math.round((subtotal * promo.value) / 100)
      : promo.value;

  return Math.min(subtotal, Math.max(0, rawDiscount));
}

export function calculateTotals(
  subtotal: number,
  discount: number,
): OrderTotals {
  const normalizedSubtotal = Math.max(0, Math.round(subtotal));
  const normalizedDiscount = Math.min(
    normalizedSubtotal,
    Math.max(0, Math.round(discount)),
  );
  const afterDiscount = normalizedSubtotal - normalizedDiscount;
  const tax = Math.round(afterDiscount * TAX_RATE);

  return {
    subtotal: normalizedSubtotal,
    discount: normalizedDiscount,
    tax,
    total: afterDiscount + tax,
  };
}
