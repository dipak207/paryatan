"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Authentication failed. No token returned.");
      window.location.assign("/login");
      return;
    }

    localStorage.setItem("token", token);
    toast.success("Signed in successfully.");
    window.location.assign("/");
  }, [searchParams]);

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-16">
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="text-lg font-medium text-foreground">Finishing authentication...</p>
        <p className="mt-4 text-sm text-on-surface-variant">Please wait while we sign you in and redirect to the homepage.</p>
      </div>
    </main>
  );
}
