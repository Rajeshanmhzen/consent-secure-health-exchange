import prisma from "@prisma/client";

const { PrismaClient } = prisma;

process.on("beforeExit", async () => {
    await prisma.$disconnect()
})