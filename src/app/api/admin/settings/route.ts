import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appSettingsSchema, bankSchema, acceptableAccountSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [settings, banks, accounts] = await prisma.$transaction([
    prisma.appSettings.findFirst(),
    prisma.acceptableBank.findMany({ orderBy: { name: "asc" } }),
    prisma.acceptableAccount.findMany({ orderBy: { ownerName: "asc" } }),
  ]);

  return NextResponse.json({ settings, banks, accounts });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action, data } = body;

  if (action === "settings") {
    const parsed = appSettingsSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const existing = await prisma.appSettings.findFirst();
    const result = existing
      ? await prisma.appSettings.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.appSettings.create({ data: parsed.data });
    return NextResponse.json(result);
  }

  if (action === "bank-create") {
    const parsed = bankSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const bank = await prisma.acceptableBank.create({ data: parsed.data });
    return NextResponse.json(bank);
  }

  if (action === "bank-update") {
    const { id, ...rest } = data;
    const parsed = bankSchema.partial().safeParse(rest);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const bank = await prisma.acceptableBank.update({ where: { id }, data: parsed.data });
    return NextResponse.json(bank);
  }

  if (action === "bank-delete") {
    await prisma.acceptableBank.delete({ where: { id: data.id } });
    return NextResponse.json({ success: true });
  }

  if (action === "account-create") {
    const parsed = acceptableAccountSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const account = await prisma.acceptableAccount.create({ data: parsed.data });
    return NextResponse.json(account);
  }

  if (action === "account-update") {
    const { id, ...rest } = data;
    const parsed = acceptableAccountSchema.partial().safeParse(rest);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const account = await prisma.acceptableAccount.update({ where: { id }, data: parsed.data });
    return NextResponse.json(account);
  }

  if (action === "account-delete") {
    await prisma.acceptableAccount.delete({ where: { id: data.id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
