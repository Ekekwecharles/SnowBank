import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SnowBank — Modern Digital Banking",
    template: "%s | SnowBank",
  },
  description: "Experience next-generation digital banking with SnowBank. Instant transfers, smart insights, and bank-grade security.",
  keywords: ["banking", "fintech", "digital bank", "Nigeria", "transfers"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
            <Toaster
              position="top-right"
              richColors
              expand={false}
              duration={4000}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
