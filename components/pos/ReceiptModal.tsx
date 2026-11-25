"use client";

import { useEffect } from "react";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { OrderDto } from "@/lib/types";
import { CloseIcon, PrinterIcon } from "./icons";

interface ReceiptModalProps {
  order: OrderDto;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      id="receipt-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
    >
      <div
        id="receipt-sheet"
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="no-print flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-stone-900">
              Pembayaran berhasil
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              Struk digital siap dicetak.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup struk"
            autoFocus
            className="rounded-xl p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div id="receipt-print-area" className="px-6 py-6">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-lg font-black text-white shadow-md shadow-amber-500/20">
              D
            </span>
            <div>
              <h2
                id="receipt-title"
                className="text-base font-black tracking-tight text-stone-950"
              >
                DigiDreams Space
              </h2>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Mini-POS & Order Engine
              </p>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-stone-300" />

          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-stone-500">
                    {item.quantity} x {formatRupiah(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs font-semibold text-stone-900">
                  {formatRupiah(item.subtotal)}
                </p>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-dashed border-stone-300" />

          <dl className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd>{formatRupiah(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Diskon</dt>
              <dd>
                {order.discount > 0
                  ? `- ${formatRupiah(order.discount)}`
                  : formatRupiah(0)}
              </dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>PPN 10%</dt>
              <dd>{formatRupiah(order.tax)}</dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center justify-between border-t-2 border-stone-900 pt-3">
            <span className="text-sm font-black text-stone-900">TOTAL</span>
            <span className="text-lg font-black tracking-tight text-stone-950">
              {formatRupiah(order.total)}
            </span>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-semibold text-stone-700">
              Terima kasih telah berkunjung!
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-stone-500">
              Simpan struk ini sebagai bukti pembayaran.
            </p>
          </div>
        </div>

        <div className="no-print flex gap-2 border-t border-stone-100 p-5">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700"
          >
            <PrinterIcon className="h-4 w-4" />
            Cetak Struk
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-600 transition hover:bg-stone-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}