# DigiDreams Mini-POS & Order Engine

Aplikasi kasir satu halaman untuk DigiDreams Space. Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, dan SQLite.

## Fitur

- Menu dengan filter kategori dan pencarian real-time.
- Keranjang, promo, PPN 10%, dan pembayaran `CASH` / `QRIS`.
- Validasi stok dan pengurangan stok yang aman saat checkout.
- Struk digital yang otomatis muncul dan siap dicetak.
- Shortcut: `/` fokus ke pencarian, `Esc` menutup struk.

## Instalasi

```bash
npm install
cp .env.example .env
npm run db:generate
npx prisma7 migrate deploy
npm run db:seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Untuk pengembangan schema, buat migrasi baru dengan `npm run db:migrate`, lalu jalankan ulang `npm run db:seed` bila perlu. Seeder bersifat idempotent.

## Promo Contoh

Gunakan kode `DIGIZEN10` untuk diskon 10% dengan minimal belanja Rp 50.000.

## API

- `GET /api/menu?category=Coffee&search=latte`
- `POST /api/promo/validate`
- `POST /api/checkout`
- `GET /api/orders/[invoiceNumber]`

## Build

```bash
npm run lint
npm run build
```