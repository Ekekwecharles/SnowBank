import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountNumber = req.nextUrl.searchParams.get("accountNumber");
  if (!accountNumber) return NextResponse.json({ error: "Account number required" }, { status: 400 });

  const account = await prisma.acceptableAccount.findFirst({
    where: { accountNumber, isActive: true },
  });

  if (!account) {
    const user = await prisma.user.findFirst({
      where: { accountNumber },
      select: { name: true, accountNumber: true },
    });
    if (user) return NextResponse.json({ ownerName: user.name, accountNumber: user.accountNumber });
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({ ownerName: account.ownerName, accountNumber: account.accountNumber });
}
