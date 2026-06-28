export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  accountNumber: string;
  isRestricted: boolean;
  isSuspended: boolean;
}

export interface TransactionData {
  id: string;
  type: string;
  amount: number;
  balanceAfterTx: number;
  description: string;
  reference: string;
  receiverName?: string | null;
  receiverAccount?: string | null;
  receiverBank?: string | null;
  senderName?: string | null;
  senderAccount?: string | null;
  location?: string | null;
  currency: string;
  status: string;
  direction: string;
  category?: string | null;
  isGenerated: boolean;
  createdAt: Date;
}

export interface BeneficiaryData {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string | null;
  createdAt: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface BankData {
  id: string;
  name: string;
  code: string;
  logo?: string | null;
  isActive: boolean;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  accountNumber: string;
  balance: number;
  phone?: string | null;
  address?: string | null;
  profileImage?: string | null;
  emailVerified: boolean;
  isRestricted: boolean;
  isSuspended: boolean;
  restrictedAt?: Date | null;
  transactionLimit?: number | null;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type TransactionType = "transfer" | "deposit" | "withdrawal" | "airtime" | "bill";
export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "success" | "pending" | "failed";
export type TransactionCategory =
  | "food"
  | "transport"
  | "utilities"
  | "shopping"
  | "salary"
  | "transfers"
  | "airtime"
  | "bills"
  | "others";
