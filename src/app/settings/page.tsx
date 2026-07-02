"use client";
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  if (!user) return <div className="p-6">Unauthorized</div>;
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <p className="mt-4">Change name, password, or delete account (not implemented yet).</p>
    </div>
  );
}
