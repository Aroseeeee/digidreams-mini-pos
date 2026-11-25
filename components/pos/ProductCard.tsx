import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import type { ProductDto } from "@/lib/types";
import { getCategoryLabel } from "./category-display";

interface ProductCardProps {
  product: ProductDto;
  quantityInCart: number;
  onAdd: (product: ProductDto) => void;
}

export function ProductCard({
  product,
  quantityInCart,
  onAdd,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isAtStockLimit = quantityInCart >= product.stock;
  const canAdd = !isOutOfStock && !isAtStockLimit;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="relative h-36 bg-stone-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">
            Tidak ada gambar
          </div>
        )}
      </div>

      <div className="border-b border-stone-100 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
            {getCategoryLabel(product.categoryName)}
          </p>
          {quantityInCart > 0 ? (
            <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
              {quantityInCart} di keranjang
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 text-sm font-semibold text-stone-900">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-stone-700">
          {formatRupiah(product.price)}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 px-4 py-3">
        <span
          className={`text-xs ${
            isOutOfStock
              ? "text-red-600"
              : product.stock <= 5
                ? "text-amber-700"
                : "text-stone-500"
          }`}
        >
          {isOutOfStock ? "Stok habis" : `Stok ${product.stock}`}
        </span>

        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={!canAdd}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
        >
          + Tambah
        </button>
      </div>
    </article>
  );
}
