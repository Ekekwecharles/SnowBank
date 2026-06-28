import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (status === "restricted") where.isRestricted = true;
  else if (status === "suspended") where.isSuspended = true;
  else if (status === "active") { where.isRestricted = false; where.isSuspended = false; }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, accountNumber: true,
        balance: true, role: true, isRestricted: true, isSuspended: true,
        emailVerified: true, createdAt: true, transactionLimit: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}
