import type { FormEvent } from "react";
import { formatRupiah } from "@/lib/format";
import {
  PAYMENT_METHODS,
  type AppliedPromo,
  type CartItem,
  type PaymentMethod,
} from "@/lib/types";
import { TrashIcon } from "./icons";

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
    <aside className="flex flex-col rounded-lg border border-stone-200 bg-white lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
      <header className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">Keranjang</h2>
        <p className="mt-0.5 text-xs text-stone-500">{totalQuantity} item</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4">
        {!hasItems ? (
          <div className="py-10 text-center text-sm text-stone-500">
            Belum ada item.
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={item.product.id}
                className="border-b border-stone-100 py-3 last:border-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
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
                    className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded border border-stone-200">
                    <button
                      type="button"
                      onClick={() => onDecrease(item.product.id)}
                      disabled={item.quantity <= 1}
                      aria-label={`Kurangi ${item.product.name}`}
                      className="h-7 w-7 text-sm text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrease(item.product.id)}
                      disabled={item.quantity >= item.product.stock}
                      aria-label={`Tambah ${item.product.name}`}
                      className="h-7 w-7 text-sm text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-medium text-stone-900">
                    {formatRupiah(item.product.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-stone-200 px-4 py-4">
        <form onSubmit={onApplyPromo}>
          <label
            htmlFor="promo-code"
            className="text-xs font-medium text-stone-700"
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
              className="h-9 min-w-0 flex-1 rounded-md border border-stone-300 px-3 text-sm uppercase text-stone-800 placeholder:normal-case placeholder:text-stone-400 focus:border-stone-500 focus:outline-none disabled:bg-stone-50 disabled:text-stone-400"
            />
            <button
              type="submit"
              disabled={
                !hasItems || isApplyingPromo || promoInput.trim().length === 0
              }
              className="rounded-md border border-stone-300 px-3 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400"
            >
              {isApplyingPromo ? "Cek..." : "Apply"}
            </button>
          </div>

          {appliedPromo ? (
            <div className="mt-2 flex items-center justify-between gap-2 text-xs">
              <span className="text-emerald-700">
                Promo {appliedPromo.code} aktif
              </span>
              <button
                type="button"
                onClick={onClearPromo}
                className="text-stone-600 underline underline-offset-2 hover:text-stone-900"
              >
                Hapus
              </button>
            </div>
          ) : null}

          {promoBelowMinimum && appliedPromo ? (
            <p className="mt-2 text-xs text-amber-700">
              Minimal belanja {formatRupiah(appliedPromo.minOrder)}.
            </p>
          ) : null}

          {promoFeedback ? (
            <p
              role="status"
              className={`mt-2 text-xs ${
                promoFeedback.tone === "error"
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              {promoFeedback.message}
            </p>
          ) : null}
        </form>

        <dl className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
          <div className="flex items-center justify-between text-stone-600">
            <dt>Subtotal</dt>
            <dd>{formatRupiah(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <dt>Diskon</dt>
            <dd>
              {discount > 0 ? `- ${formatRupiah(discount)}` : formatRupiah(0)}
            </dd>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <dt>PPN 10%</dt>
            <dd>{formatRupiah(tax)}</dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
          <span className="text-sm font-medium text-stone-800">Total Akhir</span>
          <span className="text-lg font-semibold text-stone-950">
            {formatRupiah(total)}
          </span>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium text-stone-700">
            Metode Pembayaran
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => onPaymentMethodChange(method)}
                aria-pressed={paymentMethod === method}
                className={`rounded-md border px-3 py-2 text-xs font-medium ${
                  paymentMethod === method
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-300 text-stone-700 hover:bg-stone-50"
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
            className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {checkoutError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onCheckout}
          disabled={!hasItems || isCheckingOut || promoBelowMinimum}
          className="mt-4 w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
        >
          {isCheckingOut ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    </aside>
  );
}
