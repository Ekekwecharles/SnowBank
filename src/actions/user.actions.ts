"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema, changePasswordSchema, setPinSchema } from "@/lib/validations";

export async function updateProfileAction(data: {
  name: string;
  phone?: string;
  address?: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await prisma.user.update({ where: { id: userId }, data: parsed.data });
  await prisma.activityLog.create({
    data: { userId, action: "profile_update" },
  });

  return { success: true };
}

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return { error: "Current password is incorrect" };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  await prisma.activityLog.create({ data: { userId, action: "password_change" } });

  return { success: true };
}

export async function setPinAction(data: {
  pin: string;
  confirmPin: string;
  password: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  const parsed = setPinSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) return { error: "Password is incorrect" };

  const hashedPin = await bcrypt.hash(parsed.data.pin, 10);
  await prisma.user.update({ where: { id: userId }, data: { pin: hashedPin } });
  await prisma.activityLog.create({ data: { userId, action: "pin_change" } });

  return { success: true };
}

export async function deleteBeneficiaryAction(beneficiaryId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  const ben = await prisma.beneficiary.findFirst({
    where: { id: beneficiaryId, userId },
  });
  if (!ben) return { error: "Not found" };

  await prisma.beneficiary.delete({ where: { id: beneficiaryId } });
  return { success: true };
}

export async function getActivityLogsAction() {
  const session = await auth();
  if (!session?.user) return { data: [] };
  const userId = (session.user as any).id;

  const logs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return { data: logs };
}
