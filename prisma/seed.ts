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
  imageUrl: string | null;
}

const categories = ["Coffee", "Non-Coffee", "Food"];

const products: SeedProduct[] = [
  {
    name: "Espresso",
    categoryName: "Coffee",
    price: 18000,
    stock: 40,
    imageUrl: "/menu/espresso.png",
  },
  {
    name: "Americano",
    categoryName: "Coffee",
    price: 22000,
    stock: 40,
    imageUrl: "/menu/americano.png",
  },
  {
    name: "Cappuccino",
    categoryName: "Coffee",
    price: 28000,
    stock: 35,
    imageUrl: "/menu/cappuccino.png",
  },
  {
    name: "Cafe Latte",
    categoryName: "Coffee",
    price: 30000,
    stock: 35,
    imageUrl: "/menu/cafe-latte.png",
  },
  {
    name: "Kopi Susu Gula Aren",
    categoryName: "Coffee",
    price: 25000,
    stock: 50,
    imageUrl: "/menu/kopi-susu-gula-aren.png",
  },
  {
    name: "Matcha Latte",
    categoryName: "Non-Coffee",
    price: 32000,
    stock: 30,
    imageUrl: "/menu/matcha-latte.png",
  },
  {
    name: "Chocolate",
    categoryName: "Non-Coffee",
    price: 28000,
    stock: 30,
    imageUrl: "/menu/chocolate.png",
  },
  {
    name: "Teh Tarik",
    categoryName: "Non-Coffee",
    price: 20000,
    stock: 30,
    imageUrl: "/menu/teh-tarik.png",
  },
  {
    name: "Chicken Rice Bowl",
    categoryName: "Food",
    price: 38000,
    stock: 25,
    imageUrl: "/menu/chicken-rice-bowl.png",
  },
  {
    name: "Croissant Butter",
    categoryName: "Food",
    price: 25000,
    stock: 20,
    imageUrl: "/menu/croissant-butter.png",
  },
  {
    name: "French Fries",
    categoryName: "Food",
    price: 22000,
    stock: 30,
    imageUrl: "/menu/french-fries.png",
  },
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
      update: { categoryId, price: product.price, imageUrl: product.imageUrl },
      create: {
        name: product.name,
        categoryId,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
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
