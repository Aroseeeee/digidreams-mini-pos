import { formatRupiah } from "@/lib/format";
import type { ProductDto } from "@/lib/types";
import { getCategoryEmoji, getCategoryTheme } from "./category-display";

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
    <article className="flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`relative flex h-28 items-center justify-between overflow-hidden bg-gradient-to-br p-4 ${getCategoryTheme(
          product.categoryName,
        )}`}
      >
        {product.imageUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
        ) : null}

        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/65 text-2xl shadow-sm backdrop-blur-sm">
          {getCategoryEmoji(product.categoryName)}
        </span>

        {quantityInCart > 0 ? (
          <span className="relative rounded-full bg-stone-900/85 px-2.5 py-1 text-[10px] font-semibold text-white">
            {quantityInCart} di keranjang
          </span>
        ) : (
          <span className="relative rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600 backdrop-blur-sm">
            {product.categoryName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug text-stone-900">
          {product.name}
        </h3>
        <p className="mt-1 text-base font-bold text-stone-950">
          {formatRupiah(product.price)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              isOutOfStock
                ? "bg-rose-50 text-rose-600"
                : product.stock <= 5
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isOutOfStock ? "Stok habis" : `Stok ${product.stock}`}
          </span>

          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={!canAdd}
            className="rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
          >
            + Tambah
          </button>
        </div>
      </div>
    </article>
  );
}