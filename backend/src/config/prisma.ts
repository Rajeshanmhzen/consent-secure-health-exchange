import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function ConnectDB() {
    try {
        await prisma.$connect();
        console.log("✅ DB connected");

    } catch (error) {
        console.error("❌ DB connection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

ConnectDB();

export default prisma;