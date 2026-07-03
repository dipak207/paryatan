"use client";
import Link from "next/link";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/google-signin-button";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm<LoginFormValues>();
  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success("Logged in");
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      toast.error(message);
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-16">
      <div className="mx-auto max-w-md px-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-surface-container-high p-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
              <p className="text-sm text-on-surface-variant">Log in to access saved trips, favorites, and destination details.</p>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <label className="block text-sm font-medium text-foreground">
                Email
                <input type="email" {...register("email", { required: "Email required" })} className="mt-2 w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message?.toString()}</span>}
              </label>
              <label className="block text-sm font-medium text-foreground">
                Password
                <input type="password" {...register("password", { required: "Password required" })} className="mt-2 w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                {errors.password && <span className="text-red-500 text-sm">{errors.password.message?.toString()}</span>}
              </label>
              <Button type="submit" className="w-full">{isSubmitting ? "Logging in..." : "Login"}</Button>
            </form>
            <div className="mt-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="h-px flex-1 bg-border"></span>
                <span>or continue with</span>
                <span className="h-px flex-1 bg-border"></span>
              </div>
              <GoogleSignInButton />
            </div>
            <p className="mt-6 text-center text-sm text-on-surface-variant">
              New to Paryatan? <Link href="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
