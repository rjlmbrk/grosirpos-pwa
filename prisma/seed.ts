import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

function createConfig(urlString: string) {
  const url = new URL(urlString);
  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || undefined,
    ssl: url.searchParams.has("ssl-mode") ? true : undefined,
    prepareCacheLength: 0,
    connectionLimit: 1,
  };
}

const adapter = new PrismaMariaDb(createConfig(process.env.DATABASE_URL!));
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nama: "Administrator",
      username: "admin",
      password,
      role: "admin",
    },
  });

  console.log("Admin user created:", admin.username);

  const kasir = await prisma.user.upsert({
    where: { username: "kasir" },
    update: {},
    create: {
      nama: "Kasir",
      username: "kasir",
      password: await bcrypt.hash("kasir123", 12),
      role: "kasir",
    },
  });

  console.log("Kasir user created:", kasir.username);

  const product1 = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      kodeBarang: "899000001",
      namaBarang: "Mie Sedaap Goreng",
      kategori: "Makanan",
      units: {
        create: [
          { namaSatuan: "pcs", hargaJual: 3000 },
          { namaSatuan: "renceng", hargaJual: 28000 },
          { namaSatuan: "dus", hargaJual: 1050000 },
        ],
      },
    },
  });

  console.log("Sample product 1 created:", product1.namaBarang);

  const product2 = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      kodeBarang: "899000002",
      namaBarang: "Gula Pasir",
      kategori: "Sembako",
      units: {
        create: [
          { namaSatuan: "1/4 kg", hargaJual: 4500 },
          { namaSatuan: "1/2 kg", hargaJual: 9000 },
          { namaSatuan: "1 kg", hargaJual: 18000 },
        ],
      },
    },
  });

  console.log("Sample product 2 created:", product2.namaBarang);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
