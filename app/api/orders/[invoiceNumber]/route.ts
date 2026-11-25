import { connection, NextResponse } from "next/server";
import { toOrderDto } from "@/lib/order-mapper";
import { prisma } from "@/lib/prisma";
import type { OrderDetailResponse } from "@/lib/types";

interface RouteContext {
  params: Promise<{ invoiceNumber: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  await connection();

  try {
    const { invoiceNumber } = await context.params;
    const normalizedInvoice = invoiceNumber.trim().toUpperCase();

    if (!normalizedInvoice) {
      return NextResponse.json(
        { error: "Nomor invoice wajib diisi." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { invoiceNumber: normalizedInvoice },
      include: {
        items: {
          include: { product: { select: { name: true } } },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    const response: OrderDetailResponse = { order: toOrderDto(order) };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Gagal memuat detail pesanan:", error);
    return NextResponse.json(
      { error: "Detail pesanan gagal dimuat." },
      { status: 500 },
    );
  }
}
