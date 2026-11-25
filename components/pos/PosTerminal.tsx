"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { calculateDiscount, calculateTotals } from "@/lib/pricing";
import type {
  AppliedPromo,
  ApiErrorResponse,
  CartItem,
  CheckoutRequest,
  CheckoutResponse,
  MenuResponse,
  OrderDto,
  PaymentMethod,
  ProductDto,
  PromoValidationResponse,
} from "@/lib/types";
import { CartPanel, type PromoFeedback } from "./CartPanel";
import { CloseIcon, SearchIcon } from "./icons";
import { ProductCard } from "./ProductCard";
import { ReceiptModal } from "./ReceiptModal";

export function PosTerminal() {
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuVersion, setMenuVersion] = useState(0);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoFeedback, setPromoFeedback] = useState<PromoFeedback | null>(
    null,
  );
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OrderDto | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const timer = window.setTimeout(async () => {
      setIsMenuLoading(true);
      setMenuError(null);

      const params = new URLSearchParams();

      if (selectedCategory !== "All") {
        params.set("category", selectedCategory);
      }

      if (search.trim() !== "") {
        params.set("search", search.trim());
      }

      try {
        const response = await fetch(`/api/menu?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as MenuResponse | ApiErrorResponse;

        if (!isActive) {
          return;
        }

        if (!response.ok || "error" in data) {
          setMenuError(
            "error" in data ? data.error : "Menu gagal dimuat. Coba lagi.",
          );
          return;
        }

        setCategories(data.categories.map((category) => category.name));
        setProducts(data.products);
      } catch (error: unknown) {
        if (!isActive || controller.signal.aborted) {
          return;
        }

        console.error("Gagal memuat menu:", error);
        setMenuError("Menu gagal dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        if (isActive) {
          setIsMenuLoading(false);
        }
      }
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selectedCategory, search, menuVersion]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        receipt
      ) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [receipt]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const promoBelowMinimum =
    appliedPromo !== null && subtotal > 0 && subtotal < appliedPromo.minOrder;
  const discount = promoBelowMinimum
    ? 0
    : calculateDiscount(subtotal, appliedPromo);
  const totals = useMemo(
    () => calculateTotals(subtotal, discount),
    [subtotal, discount],
  );
  const cartQuantities = useMemo(() => {
    const quantities = new Map<number, number>();

    for (const item of cart) {
      quantities.set(item.product.id, item.quantity);
    }

    return quantities;
  }, [cart]);

  const closeReceipt = useCallback(() => setReceipt(null), []);
  const tabs = ["All", ...categories];

  function handleAddToCart(product: ProductDto): void {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);

      if (!existing) {
        return product.stock < 1
          ? current
          : [...current, { product, quantity: 1 }];
      }

      if (existing.quantity >= product.stock) {
        return current;
      }

      return current.map((item) =>
        item.product.id === product.id
          ? { product, quantity: item.quantity + 1 }
          : item,
      );
    });
    setCheckoutError(null);
  }

  function handleIncrease(productId: number): void {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId && item.quantity < item.product.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
    setCheckoutError(null);
  }

  function handleDecrease(productId: number): void {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
    setCheckoutError(null);
  }

  function handleRemove(productId: number): void {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId),
    );
    setCheckoutError(null);
  }

  async function handleApplyPromo(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const code = promoInput.trim().toUpperCase();

    if (code === "") {
      setPromoFeedback({ tone: "error", message: "Masukkan kode promo." });
      return;
    }

    if (subtotal <= 0) {
      setPromoFeedback({
        tone: "error",
        message: "Tambahkan produk sebelum memakai promo.",
      });
      return;
    }

    setIsApplyingPromo(true);
    setPromoFeedback(null);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = (await response.json()) as
        PromoValidationResponse | ApiErrorResponse;

      if (!response.ok || "error" in data) {
        setPromoFeedback({
          tone: "error",
          message:
            "error" in data
              ? data.error
              : "Promo gagal divalidasi. Silakan coba lagi.",
        });
        return;
      }

      setAppliedPromo(data.promo);
      setPromoInput(data.promo.code);
      setPromoFeedback({
        tone: "success",
        message: `Promo ${data.promo.code} berhasil diterapkan.`,
      });
    } catch (error: unknown) {
      console.error("Gagal memvalidasi promo:", error);
      setPromoFeedback({
        tone: "error",
        message: "Promo gagal divalidasi. Periksa koneksi lalu coba lagi.",
      });
    } finally {
      setIsApplyingPromo(false);
    }
  }

  function handleClearPromo(): void {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoFeedback(null);
  }

  async function handleCheckout(): Promise<void> {
    if (cart.length === 0 || isCheckingOut) {
      return;
    }

    if (promoBelowMinimum) {
      setCheckoutError(
        "Total belanja belum memenuhi minimal untuk promo yang dipakai.",
      );
      return;
    }

    const payload: CheckoutRequest = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      promoCode: appliedPromo?.code ?? null,
      paymentMethod,
    };

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as
        CheckoutResponse | ApiErrorResponse;

      if (!response.ok || "error" in data) {
        setCheckoutError(
          "error" in data
            ? data.error
            : "Pesanan gagal diproses. Silakan coba lagi.",
        );

        if (response.status === 409) {
          setMenuVersion((version) => version + 1);
        }

        return;
      }

      setReceipt(data.order);
      setCart([]);
      setAppliedPromo(null);
      setPromoInput("");
      setPromoFeedback(null);
      setMenuVersion((version) => version + 1);
    } catch (error: unknown) {
      console.error("Checkout gagal:", error);
      setCheckoutError(
        "Pesanan gagal diproses. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <div id="pos-app" className="min-h-screen">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-stone-950">DigiDreams Space</p>
              <p className="text-sm text-stone-500">Mini-POS & Order Engine</p>
            </div>
            <p className="text-xs text-stone-500">
              Shortcut: <kbd className="rounded border border-stone-300 px-1 font-mono text-[11px]">/</kbd> cari,{" "}
              <kbd className="rounded border border-stone-300 px-1 font-mono text-[11px]">Esc</kbd> tutup struk
            </p>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-start lg:py-8">
          <section aria-labelledby="menu-heading">
            <div className="flex items-end justify-between gap-3">
              <h1 id="menu-heading" className="text-xl font-semibold text-stone-950">
                Menu
              </h1>
              <p className="text-xs text-stone-500">
                {isMenuLoading ? "Memuat..." : `${products.length} item`}
              </p>
            </div>

            <div className="relative mt-4">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari menu..."
                aria-label="Cari menu"
                className="h-10 w-full rounded-md border border-stone-300 bg-white pl-9 pr-9 text-sm text-stone-900 outline-none focus:border-stone-500"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div
              className="mt-4 flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Filter kategori"
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === tab}
                  onClick={() => setSelectedCategory(tab)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium ${
                    selectedCategory === tab
                      ? "bg-stone-900 text-white"
                      : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {menuError ? (
              <div
                role="alert"
                className="mt-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2"
              >
                <p className="text-xs text-red-700">{menuError}</p>
                <button
                  type="button"
                  onClick={() => setMenuVersion((version) => version + 1)}
                  className="shrink-0 text-xs font-medium text-red-700 underline underline-offset-2"
                >
                  Coba lagi
                </button>
              </div>
            ) : null}

            {isMenuLoading && products.length === 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 animate-pulse rounded-lg border border-stone-200 bg-stone-100"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-500">
                Menu tidak ditemukan.
              </div>
            ) : (
              <div
                className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-busy={isMenuLoading}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={cartQuantities.get(product.id) ?? 0}
                    onAdd={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>

          <CartPanel
            items={cart}
            subtotal={totals.subtotal}
            discount={totals.discount}
            tax={totals.tax}
            total={totals.total}
            appliedPromo={appliedPromo}
            promoInput={promoInput}
            promoFeedback={promoFeedback}
            isApplyingPromo={isApplyingPromo}
            promoBelowMinimum={promoBelowMinimum}
            paymentMethod={paymentMethod}
            isCheckingOut={isCheckingOut}
            checkoutError={checkoutError}
            onPromoInputChange={setPromoInput}
            onApplyPromo={handleApplyPromo}
            onClearPromo={handleClearPromo}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            onPaymentMethodChange={setPaymentMethod}
            onCheckout={handleCheckout}
          />
        </main>
      </div>

      {receipt ? <ReceiptModal order={receipt} onClose={closeReceipt} /> : null}
    </>
  );
}