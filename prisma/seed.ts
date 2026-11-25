import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

interface SeedProduct {
  name: string;
  categoryName: string;
  price: number;
  stock: number;
}

const categories = ["Coffee", "Non-Coffee", "Food"];

const products: SeedProduct[] = [
  { name: "Espresso", categoryName: "Coffee", price: 18000, stock: 40 },
  { name: "Americano", categoryName: "Coffee", price: 22000, stock: 40 },
  { name: "Cappuccino", categoryName: "Coffee", price: 28000, stock: 35 },
  { name: "Cafe Latte", categoryName: "Coffee", price: 30000, stock: 35 },
  {
    name: "Kopi Susu Gula Aren",
    categoryName: "Coffee",
    price: 25000,
    stock: 50,
  },
  { name: "Matcha Latte", categoryName: "Non-Coffee", price: 32000, stock: 30 },
  { name: "Chocolate", categoryName: "Non-Coffee", price: 28000, stock: 30 },
  { name: "Teh Tarik", categoryName: "Non-Coffee", price: 20000, stock: 30 },
  { name: "Chicken Rice Bowl", categoryName: "Food", price: 38000, stock: 25 },
  { name: "Croissant Butter", categoryName: "Food", price: 25000, stock: 20 },
  { name: "French Fries", categoryName: "Food", price: 22000, stock: 30 },
];

async function main(): Promise<void> {
  const savedCategories = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const categoryIdByName = new Map(
    savedCategories.map((category) => [category.name, category.id]),
  );

  for (const product of products) {
    const categoryId = categoryIdByName.get(product.categoryName);

    if (!categoryId) {
      throw new Error(`Kategori "${product.categoryName}" tidak ditemukan.`);
    }

    await prisma.product.upsert({
      where: { name: product.name },
      update: { categoryId, price: product.price },
      create: {
        name: product.name,
        categoryId,
        price: product.price,
        stock: product.stock,
      },
    });
  }

  await prisma.promo.upsert({
    where: { code: "DIGIZEN10" },
    update: {
      type: "PERCENT",
      value: 10,
      minOrder: 50000,
      isActive: true,
    },
    create: {
      code: "DIGIZEN10",
      type: "PERCENT",
      value: 10,
      minOrder: 50000,
      isActive: true,
    },
  });

  console.log(
    `Seed selesai: ${savedCategories.length} kategori, ${products.length} produk, 1 promo.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
