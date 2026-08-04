import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config.js";
import { PrismaClient } from "../generated/prisma/client.js";


const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL })
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;