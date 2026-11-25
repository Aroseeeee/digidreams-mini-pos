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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        id="receipt-sheet"
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-lg bg-white border border-stone-200"
      >
        <div className="no-print flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-stone-900">Pembayaran berhasil</p>
            <p className="text-xs text-stone-500">{formatDateTime(order.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup struk"
            autoFocus
            className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div id="receipt-print-area" className="px-5 py-5">
          <div className="text-center">
            <h2 id="receipt-title" className="text-base font-semibold text-stone-950">
              DigiDreams Space
            </h2>
            <p className="text-xs text-stone-500">Mini-POS & Order Engine</p>
          </div>

          <div className="mt-4 space-y-1 border-y border-dashed border-stone-300 py-3 text-xs text-stone-600">
            <div className="flex justify-between gap-3">
              <span>Invoice</span>
              <span className="font-medium text-stone-900">{order.invoiceNumber}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Pembayaran</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          <ul className="mt-4 space-y-3">
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

          <div className="mt-3 flex items-center justify-between border-t border-stone-300 pt-3">
            <span className="text-sm font-semibold text-stone-900">Total</span>
            <span className="text-sm font-semibold text-stone-900">
              {formatRupiah(order.total)}
            </span>
          </div>
        </div>

        <div className="no-print flex gap-2 border-t border-stone-200 p-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            <PrinterIcon className="h-4 w-4" />
            Cetak Struk
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}