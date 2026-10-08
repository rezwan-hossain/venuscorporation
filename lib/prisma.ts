import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Prisma 6 gave up on a connection after 5s; pg's default is to wait forever.
    connectionTimeoutMillis: 5_000,
  });

  return new PrismaClient({
    adapter,
    // log: ['query'], // optional for debugging
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
