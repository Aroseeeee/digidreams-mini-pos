import type { OrderDto } from "./types";
import { isPaymentMethod } from "./types";

interface OrderItemSource {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: { name: string };
}

export interface OrderSource {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  items: OrderItemSource[];
}

export function toOrderDto(order: OrderSource): OrderDto {
  return {
    id: order.id,
    invoiceNumber: order.invoiceNumber,
    subtotal: order.subtotal,
    discount: order.discount,
    tax: order.tax,
    total: order.total,
    paymentMethod: isPaymentMethod(order.paymentMethod)
      ? order.paymentMethod
      : "CASH",
    status: "PAID",
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
  };
}
