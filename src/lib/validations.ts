import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const transferStep1Schema = z.object({
  accountNumber: z
    .string()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d+$/, "Must be digits only"),
  bankCode: z.string().min(1, "Please select a bank"),
  saveAsBeneficiary: z.boolean().optional(),
});

export const transferStep2Schema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  narration: z.string().max(100, "Max 100 characters").optional(),
});

export const pinSchema = z.object({
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d+$/, "PIN must be digits only"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^(\+?[0-9]{10,15})$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Address too long").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const setPinSchema = z
  .object({
    pin: z
      .string()
      .length(4, "PIN must be 4 digits")
      .regex(/^\d+$/, "Digits only"),
    confirmPin: z.string(),
    password: z.string().min(1, "Password required to confirm"),
  })
  .refine((d) => d.pin === d.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

export const airtimeSchema = z.object({
  network: z.enum(["MTN", "Airtel", "Glo", "9mobile"]),
  phone: z
    .string()
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number"),
  amount: z.number().min(50, "Minimum ₦50").max(50000, "Maximum ₦50,000"),
});

export const billSchema = z.object({
  category: z.enum(["electricity", "internet", "cable"]),
  provider: z.string().min(1, "Provider required"),
  meterNumber: z.string().min(1, "Meter/IUC number required"),
  amount: z.number().min(100, "Minimum ₦100"),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  balance: z.number().optional(),
  transactionLimit: z.number().nullable().optional(),
  isRestricted: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  newPassword: z.string().min(8).optional().or(z.literal("")),
});

export const appSettingsSchema = z.object({
  defaultTransactionLimit: z.number().positive(),
  transferFeePercent: z.number().min(0).max(100),
  maintenanceMode: z.boolean(),
});

export const bankSchema = z.object({
  name: z.string().min(2, "Bank name required"),
  code: z.string().min(2, "Bank code required"),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const acceptableAccountSchema = z.object({
  accountNumber: z
    .string()
    .length(10, "Must be 10 digits")
    .regex(/^\d+$/, "Digits only"),
  ownerName: z.string().min(2, "Name required"),
  bankName: z.string().min(2, "Bank name required"),
  bankCode: z.string().min(2, "Bank code required"),
  isActive: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TransferStep1Input = z.infer<typeof transferStep1Schema>;
export type TransferStep2Input = z.infer<typeof transferStep2Schema>;
export type PinInput = z.infer<typeof pinSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SetPinInput = z.infer<typeof setPinSchema>;
export type AirtimeInput = z.infer<typeof airtimeSchema>;
export type BillInput = z.infer<typeof billSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
export type BankInput = z.infer<typeof bankSchema>;
export type AcceptableAccountInput = z.infer<typeof acceptableAccountSchema>;
