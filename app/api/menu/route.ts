import { connection, NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MenuResponse, ProductDto } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  await connection();

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category")?.trim() ?? "";
    const search = searchParams.get("search")?.trim().slice(0, 100) ?? "";
    const activeCategory = category && category !== "All" ? category : null;

    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        orderBy: { id: "asc" },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: {
          ...(search ? { name: { contains: search } } : {}),
          ...(activeCategory
            ? { category: { is: { name: activeCategory } } }
            : {}),
        },
        include: { category: { select: { name: true } } },
        orderBy: [{ categoryId: "asc" }, { name: "asc" }],
      }),
    ]);

    const response: MenuResponse = {
      categories,
      products: products.map((product): ProductDto => ({
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
      })),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Gagal memuat menu:", error);
    return NextResponse.json(
      { error: "Menu gagal dimuat. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
