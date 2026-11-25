import type { FormEvent } from "react";
import { formatRupiah } from "@/lib/format";
import {
  PAYMENT_METHODS,
  type AppliedPromo,
  type CartItem,
  type PaymentMethod,
} from "@/lib/types";
import { getCategoryEmoji } from "./category-display";
import { CartIcon, TrashIcon } from "./icons";

export interface PromoFeedback {
  tone: "success" | "error";
  message: string;
}

interface CartPanelProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  appliedPromo: AppliedPromo | null;
  promoInput: string;
  promoFeedback: PromoFeedback | null;
  isApplyingPromo: boolean;
  promoBelowMinimum: boolean;
  paymentMethod: PaymentMethod;
  isCheckingOut: boolean;
  checkoutError: string | null;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: (event: FormEvent<HTMLFormElement>) => void;
  onClearPromo: () => void;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCheckout: () => void;
}

export function CartPanel({
  items,
  subtotal,
  discount,
  tax,
  total,
  appliedPromo,
  promoInput,
  promoFeedback,
  isApplyingPromo,
  promoBelowMinimum,
  paymentMethod,
  isCheckingOut,
  checkoutError,
  onPromoInputChange,
  onApplyPromo,
  onClearPromo,
  onIncrease,
  onDecrease,
  onRemove,
  onPaymentMethodChange,
  onCheckout,
}: CartPanelProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  return (
    <aside className="flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xl lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
      <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">Keranjang</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {totalQuantity} item dipilih
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <CartIcon className="h-5 w-5" />
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-5">
        {!hasItems ? (
          <div className="flex h-52 flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <CartIcon className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-stone-700">
              Keranjang masih kosong
            </p>
            <p className="mt-1 max-w-48 text-xs leading-relaxed text-stone-500">
              Pilih menu di sebelah kiri untuk memulai pesanan.
            </p>
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={item.product.id}
                className="flex gap-3 border-b border-stone-100 py-4 last:border-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                  {getCategoryEmoji(item.product.categoryName)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.product.id)}
                      aria-label={`Hapus ${item.product.name}`}
                      className="rounded-lg p-1 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.product.id)}
                        disabled={item.quantity <= 1}
                        aria-label={`Kurangi ${item.product.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-l-lg text-sm font-bold text-stone-600 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:text-stone-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrease(item.product.id)}
                        disabled={item.quantity >= item.product.stock}
                        aria-label={`Tambah ${item.product.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-r-lg text-sm font-bold text-stone-600 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:text-stone-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-stone-900">
                      {formatRupiah(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-stone-100 px-5 py-4">
        <form onSubmit={onApplyPromo}>
          <label
            htmlFor="promo-code"
            className="text-xs font-semibold text-stone-700"
          >
            Kode Promo
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="promo-code"
              type="text"
              value={promoInput}
              onChange={(event) => onPromoInputChange(event.target.value)}
              placeholder="DIGIZEN10"
              autoComplete="off"
              disabled={!hasItems || isApplyingPromo}
              className="h-10 min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-medium uppercase tracking-wide text-stone-800 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-stone-400 focus:border-amber-500 focus:bg-white disabled:cursor-not-allowed disabled:text-stone-400"
            />
            <button
              type="submit"
              disabled={
                !hasItems || isApplyingPromo || promoInput.trim().length === 0
              }
              className="rounded-xl bg-stone-800 px-4 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
            >
              {isApplyingPromo ? "Cek..." : "Apply"}
            </button>
          </div>

          {appliedPromo ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2">
              <span className="text-xs font-semibold text-emerald-700">
                Promo {appliedPromo.code} aktif
              </span>
              <button
                type="button"
                onClick={onClearPromo}
                className="text-[11px] font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
              >
                Hapus
              </button>
            </div>
          ) : null}

          {promoBelowMinimum && appliedPromo ? (
            <p className="mt-2 text-xs font-medium text-amber-700">
              Minimal belanja {formatRupiah(appliedPromo.minOrder)} untuk promo
              ini.
            </p>
          ) : null}

          {promoFeedback ? (
            <p
              role="status"
              className={`mt-2 text-xs font-medium ${
                promoFeedback.tone === "error"
                  ? "text-rose-600"
                  : "text-emerald-700"
              }`}
            >
              {promoFeedback.message}
            </p>
          ) : null}
        </form>

        <dl className="mt-4 space-y-2 border-t border-dashed border-stone-200 pt-4 text-sm">
          <div className="flex items-center justify-between text-stone-600">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-stone-800">
              {formatRupiah(subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <dt>Diskon</dt>
            <dd
              className={`font-semibold ${
                discount > 0 ? "text-emerald-600" : "text-stone-800"
              }`}
            >
              {discount > 0 ? `- ${formatRupiah(discount)}` : formatRupiah(0)}
            </dd>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <dt>PPN 10%</dt>
            <dd className="font-semibold text-stone-800">
              {formatRupiah(tax)}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
          <span className="text-sm font-semibold text-stone-700">
            Total Akhir
          </span>
          <span className="text-xl font-black tracking-tight text-stone-950">
            {formatRupiah(total)}
          </span>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-stone-700">
            Metode Pembayaran
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => onPaymentMethodChange(method)}
                aria-pressed={paymentMethod === method}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  paymentMethod === method
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </fieldset>

        {checkoutError ? (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
          >
            {checkoutError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onCheckout}
          disabled={!hasItems || isCheckingOut || promoBelowMinimum}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition hover:from-amber-700 hover:to-orange-700 disabled:cursor-not-allowed disabled:from-stone-200 disabled:to-stone-200 disabled:text-stone-500 disabled:shadow-none"
        >
          {isCheckingOut ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    </aside>
  );
}