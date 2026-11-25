export const PAYMENT_METHODS = ["CASH", "QRIS"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PROMO_TYPES = ["PERCENT", "FIXED"] as const;
export type PromoType = (typeof PROMO_TYPES)[number];

export interface CategoryDto {
  id: number;
  name: string;
}

export interface ProductDto {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export interface MenuResponse {
  categories: CategoryDto[];
  products: ProductDto[];
}

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

export interface AppliedPromo {
  code: string;
  type: PromoType;
  value: number;
  minOrder: number;
}

export interface PromoValidationResponse {
  promo: AppliedPromo;
  discount: number;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDto {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: "PAID";
  createdAt: string;
  items: OrderItemDto[];
}

export interface CheckoutItemInput {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemInput[];
  promoCode: string | null;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResponse {
  order: OrderDto;
}

export interface OrderDetailResponse {
  order: OrderDto;
}

export interface PromoValidationRequest {
  code: string;
  subtotal: number;
}

export interface ApiErrorResponse {
  error: string;
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    PAYMENT_METHODS.some((method) => method === value)
  );
}

export function isPromoType(value: unknown): value is PromoType {
  return (
    typeof value === "string" && PROMO_TYPES.some((type) => type === value)
  );
}
