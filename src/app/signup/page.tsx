"use client";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

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
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input placeholder="Name" {...register("name", { required: "Name required" })} className="px-3 py-2 rounded" />
        {errors.name && <div className="text-red-500 text-sm">{errors.name.message?.toString()}</div>}
        <input placeholder="Email" {...register("email", { required: "Email required" })} className="px-3 py-2 rounded" />
        {errors.email && <div className="text-red-500 text-sm">{errors.email.message?.toString()}</div>}
        <input placeholder="Password" type="password" {...register("password", { required: "Password required", minLength: { value: 6, message: "Min length 6" } })} className="px-3 py-2 rounded" />
        {errors.password && <div className="text-red-500 text-sm">{errors.password.message?.toString()}</div>}
        <button className="bg-primary text-on-primary px-4 py-2 rounded">{isSubmitting ? "Signing..." : "Sign Up"}</button>
      </form>
    </div>
  );
}
