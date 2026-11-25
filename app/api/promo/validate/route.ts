import { NextResponse } from "next/server";
import { formatRupiah } from "@/lib/format";
import { calculateDiscount } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import {
  isPromoType,
  type AppliedPromo,
  type PromoValidationResponse,
} from "@/lib/types";
import {
  isNonNegativeInteger,
  isRecord,
  normalizePromoCode,
} from "@/lib/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Body request tidak valid." },
        { status: 400 },
      );
    }

    const { code, subtotal } = body;

    if (typeof code !== "string" || code.trim() === "") {
      return NextResponse.json(
        { error: "Kode promo wajib diisi." },
        { status: 400 },
      );
    }

    if (!isNonNegativeInteger(subtotal)) {
      return NextResponse.json(
        { error: "Subtotal tidak valid." },
        { status: 400 },
      );
    }

    const promo = await prisma.promo.findUnique({
      where: { code: normalizePromoCode(code) },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json(
        { error: "Kode promo tidak valid atau tidak aktif." },
        { status: 400 },
      );
    }

    if (!isPromoType(promo.type)) {
      console.error(`Tipe promo tidak dikenal: ${promo.type}`);
      return NextResponse.json(
        { error: "Konfigurasi promo tidak valid." },
        { status: 500 },
      );
    }

    if (subtotal < promo.minOrder) {
      return NextResponse.json(
        {
          error: `Minimal belanja untuk promo ini adalah ${formatRupiah(
            promo.minOrder,
          )}.`,
        },
        { status: 400 },
      );
    }

    const appliedPromo: AppliedPromo = {
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrder: promo.minOrder,
    };

    const response: PromoValidationResponse = {
      promo: appliedPromo,
      discount: calculateDiscount(subtotal, appliedPromo),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Gagal memvalidasi promo:", error);
    return NextResponse.json(
      { error: "Promo gagal divalidasi. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
