import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma instances during hot-reloads in development
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
