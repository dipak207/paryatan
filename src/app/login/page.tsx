"use client";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm();
  const { errors, isSubmitting } = formState;

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      toast.success("Logged in");
    } catch (err: any) {
      toast.error(err.message || JSON.stringify(err));
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input placeholder="Email" {...register("email", { required: "Email required" })} className="px-3 py-2 rounded" />
        {errors.email && <div className="text-red-500 text-sm">{(errors.email as any).message}</div>}
        <input placeholder="Password" type="password" {...register("password", { required: "Password required" })} className="px-3 py-2 rounded" />
        {errors.password && <div className="text-red-500 text-sm">{(errors.password as any).message}</div>}
        <button className="bg-primary text-on-primary px-4 py-2 rounded">{isSubmitting ? "Logging..." : "Login"}</button>
      </form>
    </div>
  );
}
