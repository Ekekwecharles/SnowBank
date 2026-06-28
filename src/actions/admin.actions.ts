"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}

const NAMES = [
  "Adebayo Okonkwo","Chisom Nwosu","Emeka Eze","Fatima Al-Hassan","Grace Obi",
  "Hassan Ibrahim","Ifeoma Chukwu","James Adeyemi","Kelechi Okafor","Layla Ahmed",
  "Michael Chen","Ngozi Uzoma","Olumide Balogun","Patricia Mensah","Quirino Santos",
  "Ravi Sharma","Sade Adeleke","Tunde Fashola","Uche Okonjo","Vera Nwachukwu",
  "William Park","Xena Mbeki","Yusuf Musa","Zainab Aliyu","Abigail Johnson",
  "Benjamin Osei","Caroline Dike","David Kim","Eleanor Afolabi","Felix Nnamdi",
  "Gloria Asante","Henry Ogundimu","Isabella Nkrumah","Joseph Okoro","Karen Adekunle",
  "Liam Murphy","Maria Rosario","Nathan Obi","Olivia Zhang","Paul Mensah",
  "Queenie Adamu","Robert Yeboah","Sandra Chidi","Thomas Abubakar","Uma Patel",
  "Victor Oti","Winifred Eze","Xavier Boateng","Yetunde Adebowale","Zara Hassan",
];

const CATEGORIES = ["food", "transport", "utilities", "shopping", "transfers", "salary", "airtime", "bills", "others"];
const TYPES = ["transfer", "deposit", "withdrawal", "airtime", "bill"];

export async function generateTransactionsAction(userId: string, count: number) {
  if (!(await requireAdmin())) return { error: "Forbidden" };
  if (count < 10 || count > 500) return { error: "Count must be between 10 and 500" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const banks = await prisma.acceptableBank.findMany({ where: { isActive: true } });
  if (!banks.length) return { error: "No banks configured. Add banks first." };

  await prisma.transaction.deleteMany({ where: { userId, isGenerated: true } });

  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  let balance = user.balance;

  const txs = Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(now - Math.random() * ninetyDays);
    const direction = Math.random() > 0.45 ? "debit" : "credit";
    const type = direction === "credit" ? (Math.random() > 0.5 ? "deposit" : "transfer") : TYPES[Math.floor(Math.random() * TYPES.length)];
    const amount = parseFloat((Math.random() * 49900 + 100).toFixed(2));
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    if (direction === "debit") balance = Math.max(balance - amount, 0);
    else balance += amount;

    return {
      userId,
      type,
      amount,
      balanceAfterTx: parseFloat(balance.toFixed(2)),
      description: direction === "credit" ? `Transfer from ${name}` : `Transfer to ${name}`,
      reference: generateReference(),
      receiverName: direction === "debit" ? name : undefined,
      receiverAccount: direction === "debit" ? `${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined,
      receiverBank: direction === "debit" ? bank.name : undefined,
      senderName: direction === "credit" ? name : undefined,
      direction,
      category,
      status: "success",
      isGenerated: true,
      createdAt,
    };
  });

  txs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  await prisma.transaction.createMany({ data: txs });
  return { success: true, count };
}

export async function getAdminStatsAction() {
  if (!(await requireAdmin())) return { error: "Forbidden" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalTxToday, restricted, suspended, recentUsers] = await prisma.$transaction([
    prisma.user.count({ where: { role: "user" } }),
    prisma.transaction.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { isRestricted: true } }),
    prisma.user.count({ where: { isSuspended: true } }),
    prisma.user.findMany({
      where: { role: "user" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, accountNumber: true, balance: true, createdAt: true },
    }),
  ]);

  const volumeResult = await prisma.transaction.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { amount: true },
  });

  return {
    totalUsers,
    totalTxToday,
    restricted,
    suspended,
    totalVolumeToday: volumeResult._sum.amount ?? 0,
    recentUsers,
  };
}
