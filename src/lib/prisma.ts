import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function createPrismaClient() {
  const dbUrl =
    process.env.DATABASE_URL ??
    `file:${path.resolve(process.cwd(), "prisma/dev.db")}`;

  const adapter = new PrismaLibSql({ url: dbUrl });
  return new PrismaClient({ adapter });
}

// Creates a short-lived client for routes that need to see external writes
// (e.g. MCP server updates) without restarting the container.
export function createFreshPrismaClient() {
  return createPrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
