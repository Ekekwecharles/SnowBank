import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminUserUpdateSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 100 },
      beneficiaries: true,
      activityLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { password, pin, verificationToken, resetPasswordToken, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await req.json();
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { newPassword, isRestricted, ...rest } = parsed.data;
  const data: any = { ...rest };

  if (newPassword) {
    data.password = await bcrypt.hash(newPassword, 12);
  }
  if (isRestricted !== undefined) {
    data.isRestricted = isRestricted;
    data.restrictedAt = isRestricted ? new Date() : null;
  }

  const updated = await prisma.user.update({ where: { id }, data });
  const { password, pin: p, verificationToken, resetPasswordToken, ...safe } = updated;
  return NextResponse.json(safe);
}
