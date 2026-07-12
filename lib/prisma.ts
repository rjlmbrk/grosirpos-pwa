import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

function createTiDBConfig(urlString: string) {
  const url = new URL(urlString);
  const params = Object.fromEntries(url.searchParams.entries());

  const { "ssl-mode": _, ...rest } = params;

  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || undefined,
    ssl: url.searchParams.has("ssl-mode") ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 30000,
    socketTimeout: 60000,
    acquireTimeout: 30000,
    connectionLimit: 5,
    ...rest,
    prepareCacheLength: 0,
  };
}

function createAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return new PrismaMariaDb(createTiDBConfig(url));
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: ReturnType<typeof createAdapter> | undefined;
};

const adapter = globalForPrisma.adapter ?? createAdapter();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.adapter = adapter;
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
