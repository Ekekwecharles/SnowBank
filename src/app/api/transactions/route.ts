import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = req.nextUrl;

  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const direction = searchParams.get("direction") ?? "";
  const status = searchParams.get("status") ?? "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const sortBy = searchParams.get("sortBy") ?? "date-desc";

  const where: any = { userId };

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
      { receiverName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (direction) where.direction = direction;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const orderBy: any =
    sortBy === "amount-asc" ? { amount: "asc" }
    : sortBy === "amount-desc" ? { amount: "desc" }
    : sortBy === "date-asc" ? { createdAt: "asc" }
    : { createdAt: "desc" };

  const [data, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
