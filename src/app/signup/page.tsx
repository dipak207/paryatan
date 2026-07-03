"use client";
import Link from "next/link";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/google-signin-button";

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState } = useForm<SignupFormValues>();
  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Account created");
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
              <h1 className="text-3xl font-semibold text-foreground">Create your account</h1>
              <p className="text-sm text-on-surface-variant">Sign up now to save favorites, track visited places, and explore smarter.</p>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <label className="block text-sm font-medium text-foreground">
                Name
                <input {...register("name", { required: "Name required" })} className="mt-2 w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message?.toString()}</span>}
              </label>
              <label className="block text-sm font-medium text-foreground">
                Email
                <input type="email" {...register("email", { required: "Email required" })} className="mt-2 w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message?.toString()}</span>}
              </label>
              <label className="block text-sm font-medium text-foreground">
                Password
                <input type="password" {...register("password", { required: "Password required", minLength: { value: 6, message: "Min length 6" } })} className="mt-2 w-full rounded-3xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
                {errors.password && <span className="text-red-500 text-sm">{errors.password.message?.toString()}</span>}
              </label>
              <Button type="submit" className="w-full">{isSubmitting ? "Creating account..." : "Sign up"}</Button>
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
              Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
