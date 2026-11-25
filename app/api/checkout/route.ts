import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { formatRupiah } from "@/lib/format";
import { toOrderDto } from "@/lib/order-mapper";
import { calculateDiscount, calculateTotals } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import {
  isPaymentMethod,
  isPromoType,
  type AppliedPromo,
  type CheckoutResponse,
  type PaymentMethod,
} from "@/lib/types";
import {
  isPositiveInteger,
  isRecord,
  normalizePromoCode,
} from "@/lib/validation";

interface ParsedItem {
  productId: number;
  quantity: number;
}

interface CheckoutPayload {
  items: ParsedItem[];
  promoCode: string | null;
  paymentMethod: PaymentMethod;
}

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

function parseCheckoutPayload(body: unknown): CheckoutPayload {
  if (!isRecord(body)) {
    throw new CheckoutError("Body request tidak valid.", 400);
  }

  const rawItems = body.items;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new CheckoutError("Keranjang tidak boleh kosong.", 400);
  }

  if (rawItems.length > 50) {
    throw new CheckoutError("Jumlah item dalam keranjang terlalu banyak.", 400);
  }

  const seenProductIds = new Set<number>();
  const items: ParsedItem[] = rawItems.map((rawItem: unknown) => {
    if (!isRecord(rawItem)) {
      throw new CheckoutError("Item pesanan tidak valid.", 400);
    }

    const { productId, quantity } = rawItem;

    if (!isPositiveInteger(productId) || !isPositiveInteger(quantity)) {
      throw new CheckoutError(
        "ID produk dan jumlah harus berupa bilangan bulat positif.",
        400,
      );
    }

    if (seenProductIds.has(productId)) {
      throw new CheckoutError(
        "Produk yang sama tidak boleh dikirim dua kali.",
        400,
      );
    }

    seenProductIds.add(productId);
    return { productId, quantity };
  });

  if (!isPaymentMethod(body.paymentMethod)) {
    throw new CheckoutError("Metode pembayaran harus CASH atau QRIS.", 400);
  }

  const rawPromoCode = body.promoCode;

  if (
    rawPromoCode !== undefined &&
    rawPromoCode !== null &&
    typeof rawPromoCode !== "string"
  ) {
    throw new CheckoutError("Kode promo tidak valid.", 400);
  }

  return {
    items,
    promoCode:
      typeof rawPromoCode === "string" && rawPromoCode.trim() !== ""
        ? normalizePromoCode(rawPromoCode)
        : null,
    paymentMethod: body.paymentMethod,
  };
}

function createInvoiceNumber(): string {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");

  const randomPart = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();

  return `INV-${datePart}-${randomPart}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new CheckoutError(
        "Body request harus berupa JSON yang valid.",
        400,
      );
    }

    const payload = parseCheckoutPayload(body);
    const requestedIds = payload.items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: requestedIds } },
    });

    if (products.length !== requestedIds.length) {
      throw new CheckoutError("Ada produk yang tidak ditemukan.", 400);
    }

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const items = payload.items.map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        throw new CheckoutError("Ada produk yang tidak ditemukan.", 400);
      }

      if (product.stock < item.quantity) {
        throw new CheckoutError(
          `Stok ${product.name} tidak mencukupi. Tersisa ${product.stock}.`,
          409,
        );
      }

      return {
        product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    let appliedPromo: AppliedPromo | null = null;

    if (payload.promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: payload.promoCode },
      });

      if (!promo || !promo.isActive) {
        throw new CheckoutError(
          "Kode promo tidak valid atau tidak aktif.",
          400,
        );
      }

      if (!isPromoType(promo.type)) {
        console.error(`Tipe promo tidak dikenal: ${promo.type}`);
        throw new CheckoutError("Konfigurasi promo tidak valid.", 500);
      }

      if (subtotal < promo.minOrder) {
        throw new CheckoutError(
          `Minimal belanja untuk promo ini adalah ${formatRupiah(
            promo.minOrder,
          )}.`,
          400,
        );
      }

      appliedPromo = {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        minOrder: promo.minOrder,
      };
    }

    const discount = calculateDiscount(subtotal, appliedPromo);
    const totals = calculateTotals(subtotal, discount);
    const invoiceNumber = createInvoiceNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.product.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new CheckoutError(
            `Stok ${item.product.name} baru saja berubah. Silakan coba lagi.`,
            409,
          );
        }
      }

      return tx.order.create({
        data: {
          invoiceNumber,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
          paymentMethod: payload.paymentMethod,
          status: "PAID",
          items: {
            create: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.product.price,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: {
            include: { product: { select: { name: true } } },
            orderBy: { id: "asc" },
          },
        },
      });
    });

    const response: CheckoutResponse = { order: toOrderDto(order) };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Checkout gagal:", error);
    return NextResponse.json(
      { error: "Pesanan gagal diproses. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
