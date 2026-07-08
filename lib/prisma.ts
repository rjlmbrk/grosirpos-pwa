import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

function createTiDBConfig(urlString: string) {
  const url = new URL(urlString);
  const params = Object.fromEntries(url.searchParams.entries());

  // Remove unsupported mariadb URL params (like ssl-mode)
  const { "ssl-mode": _, ...rest } = params;

  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || undefined,
    ssl: url.searchParams.has("ssl-mode") ? true : undefined,
    ...rest,
    prepareCacheLength: 0,
  };
}

const adapter = new PrismaMariaDb(createTiDBConfig(process.env.DATABASE_URL!));

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
