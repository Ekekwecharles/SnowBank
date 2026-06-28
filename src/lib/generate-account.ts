import { prisma } from "./prisma";

export async function generateUniqueAccountNumber(): Promise<string> {
  while (true) {
    const num = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const existing = await prisma.user.findUnique({
      where: { accountNumber: num },
      select: { id: true },
    });
    if (!existing) return num;
  }
}
