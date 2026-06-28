import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
        <p className="text-muted-foreground mb-6">
          Use the verification link sent to your email. If the link has expired, request a new one.
        </p>
        <Link href="/login" className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 inline-block">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
