"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { sendTransferConfirmationEmail } from "@/lib/email";

interface TransferPayload {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  receiverName: string;
  amount: number;
  narration: string;
  pin: string;
  saveAsBeneficiary?: boolean;
}

export async function transferAction(payload: TransferPayload) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const userId = (session.user as any).id;
  const sender = await prisma.user.findUnique({ where: { id: userId } });
  if (!sender) return { error: "User not found" };

  if (sender.isRestricted) return { error: "Your account is restricted. Contact support." };
  if (sender.isSuspended) return { error: "Your account is suspended. Contact support." };

  if (!sender.pin) return { error: "Please set a transaction PIN first." };
  const pinValid = await bcrypt.compare(payload.pin, sender.pin);
  if (!pinValid) return { error: "Invalid PIN. Please try again." };

  if (payload.amount <= 0) return { error: "Invalid transfer amount." };
  if (sender.balance < payload.amount) return { error: "Insufficient balance." };

  const settings = await prisma.appSettings.findFirst();
  const limit = sender.transactionLimit ?? settings?.defaultTransactionLimit ?? 500000;
  if (payload.amount > limit) return { error: `Transfer amount exceeds your limit of ₦${limit.toLocaleString()}.` };

  const reference = generateReference();
  const fee = settings ? (payload.amount * settings.transferFeePercent) / 100 : 0;
  const totalDeducted = payload.amount + fee;

  if (sender.balance < totalDeducted) return { error: "Insufficient balance including fees." };

  const newSenderBalance = sender.balance - totalDeducted;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { balance: newSenderBalance } });

    await tx.transaction.create({
      data: {
        userId,
        type: "transfer",
        amount: payload.amount,
        balanceAfterTx: newSenderBalance,
        description: payload.narration || `Transfer to ${payload.receiverName}`,
        reference,
        receiverName: payload.receiverName,
        receiverAccount: payload.accountNumber,
        receiverBank: payload.bankName,
        direction: "debit",
        category: "transfers",
        status: "success",
      },
    });

    const receiver = await tx.user.findFirst({ where: { accountNumber: payload.accountNumber } });
    if (receiver) {
      const newReceiverBalance = receiver.balance + payload.amount;
      await tx.user.update({ where: { id: receiver.id }, data: { balance: newReceiverBalance } });
      await tx.transaction.create({
        data: {
          userId: receiver.id,
          type: "transfer",
          amount: payload.amount,
          balanceAfterTx: newReceiverBalance,
          description: `Transfer from ${sender.name}`,
          reference: generateReference(),
          senderName: sender.name,
          senderAccount: sender.accountNumber,
          direction: "credit",
          category: "transfers",
          status: "success",
        },
      });
      await tx.notification.create({
        data: {
          userId: receiver.id,
          title: "Credit Alert",
          message: `You received ₦${payload.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} from ${sender.name}`,
          type: "transaction",
        },
      });
    }

    await tx.notification.create({
      data: {
        userId,
        title: "Debit Alert",
        message: `₦${payload.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} sent to ${payload.receiverName}. Ref: ${reference}`,
        type: "transaction",
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "transfer",
        metadata: { amount: payload.amount, receiver: payload.receiverName, reference },
      },
    });

    if (payload.saveAsBeneficiary) {
      const existing = await tx.beneficiary.findFirst({
        where: { userId, accountNumber: payload.accountNumber },
      });
      if (!existing) {
        await tx.beneficiary.create({
          data: {
            userId,
            name: payload.receiverName,
            accountNumber: payload.accountNumber,
            bankName: payload.bankName,
            bankCode: payload.bankCode,
          },
        });
      }
    }
  });

  await sendTransferConfirmationEmail(
    sender.email,
    sender.name,
    payload.amount,
    payload.receiverName,
    reference,
    newSenderBalance
  );

  return { success: true, reference, newBalance: newSenderBalance };
}

export async function airtimeAction(payload: {
  network: string;
  phone: string;
  amount: number;
  pin: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };
  if (user.isRestricted) return { error: "Account restricted." };
  if (!user.pin) return { error: "Set a PIN first." };

  const pinValid = await bcrypt.compare(payload.pin, user.pin);
  if (!pinValid) return { error: "Invalid PIN." };
  if (user.balance < payload.amount) return { error: "Insufficient balance." };

  const newBalance = user.balance - payload.amount;
  const reference = generateReference();

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { balance: newBalance } }),
    prisma.transaction.create({
      data: {
        userId,
        type: "airtime",
        amount: payload.amount,
        balanceAfterTx: newBalance,
        description: `${payload.network} Airtime — ${payload.phone}`,
        reference,
        direction: "debit",
        category: "airtime",
        status: "success",
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: "Airtime Purchase",
        message: `₦${payload.amount} ${payload.network} airtime sent to ${payload.phone}`,
        type: "transaction",
      },
    }),
  ]);

  return { success: true, reference, newBalance };
}

export async function billAction(payload: {
  category: string;
  provider: string;
  meterNumber: string;
  amount: number;
  pin: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };
  if (user.isRestricted) return { error: "Account restricted." };
  if (!user.pin) return { error: "Set a PIN first." };

  const pinValid = await bcrypt.compare(payload.pin, user.pin);
  if (!pinValid) return { error: "Invalid PIN." };
  if (user.balance < payload.amount) return { error: "Insufficient balance." };

  const newBalance = user.balance - payload.amount;
  const reference = generateReference();

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { balance: newBalance } }),
    prisma.transaction.create({
      data: {
        userId,
        type: "bill",
        amount: payload.amount,
        balanceAfterTx: newBalance,
        description: `${payload.provider} — ${payload.meterNumber}`,
        reference,
        direction: "debit",
        category: "bills",
        status: "success",
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: "Bill Payment",
        message: `₦${payload.amount} paid to ${payload.provider}`,
        type: "transaction",
      },
    }),
  ]);

  return { success: true, reference, newBalance };
}
