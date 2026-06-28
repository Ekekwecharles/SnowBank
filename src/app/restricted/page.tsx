import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle, Mail } from "lucide-react";

export default async function RestrictedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as any).isRestricted) redirect("/dashboard");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, accountNumber: true, restrictedAt: true },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-card p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Account Access Restricted</h1>
        <p className="text-muted-foreground mb-6">Dear <span className="text-foreground font-medium">{user?.name}</span>,</p>

        <div className="text-left bg-muted/30 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <p className="text-muted-foreground">Your account has been flagged due to a transaction that exceeded your approved transfer limit.</p>
          <p className="font-medium mt-3">To restore full access:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Contact SnowBank support within 48 hours</li>
            <li>Email: <span className="text-foreground">support@snowbank.io</span></li>
            <li>Reference: <span className="font-mono text-foreground">{user?.accountNumber}</span></li>
            {user?.restrictedAt && (
              <li>Date flagged: <span className="text-foreground">{format(new Date(user.restrictedAt), "MMM d, yyyy 'at' h:mm a")}</span></li>
            )}
          </ul>
        </div>

        <a
          href="mailto:support@snowbank.io"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition"
        >
          <Mail className="h-4 w-4" />
          Email Support
        </a>
      </div>
    </div>
  );
}
