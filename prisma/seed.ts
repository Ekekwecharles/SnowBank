import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function genRef() {
  const ts = Date.now();
  const r = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `SB${ts}${r}`;
}

const NAMES = [
  "Adebayo Okonkwo","Chisom Nwosu","Emeka Eze","Fatima Al-Hassan","Grace Obi",
  "Hassan Ibrahim","Ifeoma Chukwu","James Adeyemi","Kelechi Okafor","Layla Ahmed",
  "Michael Chen","Ngozi Uzoma","Olumide Balogun","Patricia Mensah","Quirino Santos",
  "Ravi Sharma","Sade Adeleke","Tunde Fashola","Uche Okonjo","Vera Nwachukwu",
  "William Park","Yusuf Musa","Zainab Aliyu","Benjamin Osei","Caroline Dike",
  "David Kim","Eleanor Afolabi","Felix Nnamdi","Gloria Asante","Henry Ogundimu",
];

const CATEGORIES = ["food","transport","utilities","shopping","transfers","salary","airtime","bills","others"];

const BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Zenith Bank", code: "057" },
  { name: "GTBank", code: "058" },
  { name: "First Bank", code: "011" },
  { name: "UBA", code: "033" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Fidelity Bank", code: "070" },
  { name: "FCMB", code: "214" },
  { name: "Polaris Bank", code: "076" },
  { name: "Wema Bank", code: "035" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank", code: "032" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Providus Bank", code: "101" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Opay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Moniepoint", code: "50515" },
  { name: "VFD Microfinance Bank", code: "566" },
];

const ACCOUNTS = [
  { accountNumber: "1111111111", ownerName: "Adebayo Okonkwo", bankName: "GTBank", bankCode: "058" },
  { accountNumber: "2222222222", ownerName: "Chisom Nwosu", bankName: "Zenith Bank", bankCode: "057" },
  { accountNumber: "3333333333", ownerName: "Emeka Eze", bankName: "First Bank", bankCode: "011" },
  { accountNumber: "4444444444", ownerName: "Fatima Al-Hassan", bankName: "UBA", bankCode: "033" },
  { accountNumber: "5555555555", ownerName: "Grace Obi", bankName: "Access Bank", bankCode: "044" },
  { accountNumber: "6666666666", ownerName: "Hassan Ibrahim", bankName: "Kuda Bank", bankCode: "090267" },
  { accountNumber: "7777777777", ownerName: "Ifeoma Chukwu", bankName: "Moniepoint", bankCode: "50515" },
  { accountNumber: "8888888888", ownerName: "James Adeyemi", bankName: "Opay", bankCode: "999992" },
  { accountNumber: "9999999999", ownerName: "Kelechi Okafor", bankName: "Stanbic IBTC", bankCode: "221" },
  { accountNumber: "1010101010", ownerName: "Layla Ahmed", bankName: "Fidelity Bank", bankCode: "070" },
];

async function main() {
  console.log("Seeding SnowBank...");

  // Admin
  const adminPw = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@snowbank.io" },
    create: {
      name: "SnowBank Admin",
      email: "admin@snowbank.io",
      password: adminPw,
      role: "admin",
      accountNumber: "0000000001",
      balance: 1000000,
      emailVerified: true,
    },
    update: { password: adminPw, role: "admin" },
  });
  console.log("Admin created");

  // Demo user
  const demoPw = await bcrypt.hash("Demo@123", 12);
  const demoPin = await bcrypt.hash("1234", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@snowbank.io" },
    create: {
      name: "Demo User",
      email: "demo@snowbank.io",
      password: demoPw,
      pin: demoPin,
      role: "user",
      accountNumber: "1234567890",
      balance: 250000,
      emailVerified: true,
    },
    update: { password: demoPw, pin: demoPin, balance: 250000 },
  });
  console.log("Demo user created");

  // Banks
  for (const bank of BANKS) {
    await prisma.acceptableBank.upsert({
      where: { code: bank.code },
      create: { ...bank, isActive: true },
      update: { name: bank.name },
    });
  }
  console.log("Banks seeded");

  // Accounts
  for (const acc of ACCOUNTS) {
    await prisma.acceptableAccount.upsert({
      where: { accountNumber: acc.accountNumber },
      create: { ...acc, isActive: true },
      update: acc,
    });
  }
  console.log("Accounts seeded");

  // App settings
  const existingSettings = await prisma.appSettings.findFirst();
  if (!existingSettings) {
    await prisma.appSettings.create({
      data: { defaultTransactionLimit: 500000, maintenanceMode: false, transferFeePercent: 0 },
    });
  }
  console.log("App settings seeded");

  // Generate 50 demo transactions
  await prisma.transaction.deleteMany({ where: { userId: demoUser.id, isGenerated: true } });

  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const bankNames = BANKS.map(b => b.name);
  let balance = 250000;

  const txs = Array.from({ length: 50 }, (_, i) => {
    const createdAt = new Date(now - Math.random() * ninetyDays);
    const direction = i < 10 ? "credit" : Math.random() > 0.4 ? "debit" : "credit";
    const type = direction === "credit" ? (Math.random() > 0.5 ? "deposit" : "transfer") : ["transfer","airtime","bill","withdrawal"][Math.floor(Math.random() * 4)];
    const amount = parseFloat((Math.random() * 49900 + 100).toFixed(2));
    const bank = bankNames[Math.floor(Math.random() * bankNames.length)];
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    if (direction === "debit") balance = Math.max(balance - amount, 0);
    else balance += amount;

    return {
      userId: demoUser.id,
      type,
      amount,
      balanceAfterTx: parseFloat(balance.toFixed(2)),
      description: direction === "credit" ? `Transfer from ${name}` : `Transfer to ${name}`,
      reference: genRef(),
      receiverName: direction === "debit" ? name : undefined,
      receiverAccount: direction === "debit" ? `${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined,
      receiverBank: direction === "debit" ? bank : undefined,
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
  console.log("Demo transactions seeded (50)");

  // Demo notifications (delete existing first to avoid dupes)
  await prisma.notification.deleteMany({ where: { userId: demoUser.id } });
  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, title: "Welcome to SnowBank!", message: "Your account is ready. Explore our features.", type: "system" },
      { userId: demoUser.id, title: "Debit Alert", message: "₦15,000 deducted for DSTV subscription", type: "transaction" },
      { userId: demoUser.id, title: "Credit Alert", message: "₦250,000 salary credit received", type: "transaction" },
    ],
  });
  console.log("Notifications seeded");

  // Demo beneficiaries
  await prisma.beneficiary.deleteMany({ where: { userId: demoUser.id } });
  await prisma.beneficiary.createMany({
    data: [
      { userId: demoUser.id, name: "Adebayo Okonkwo", accountNumber: "1111111111", bankName: "GTBank", bankCode: "058" },
      { userId: demoUser.id, name: "Chisom Nwosu", accountNumber: "2222222222", bankName: "Zenith Bank", bankCode: "057" },
    ],
  });
  console.log("Beneficiaries seeded");

  console.log("\n✅ Seeding complete!");
  console.log("Admin: admin@snowbank.io / Admin@123");
  console.log("Demo:  demo@snowbank.io / Demo@123 / PIN: 1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
