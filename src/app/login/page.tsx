"use client";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

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
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input placeholder="Email" {...register("email", { required: "Email required" })} className="px-3 py-2 rounded" />
        {errors.email && <div className="text-red-500 text-sm">{errors.email.message?.toString()}</div>}
        <input placeholder="Password" type="password" {...register("password", { required: "Password required" })} className="px-3 py-2 rounded" />
        {errors.password && <div className="text-red-500 text-sm">{errors.password.message?.toString()}</div>}
        <button className="bg-primary text-on-primary px-4 py-2 rounded">{isSubmitting ? "Logging..." : "Login"}</button>
      </form>
    </div>
  );
}
