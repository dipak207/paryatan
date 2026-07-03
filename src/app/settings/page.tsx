"use client";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center text-on-surface-variant">Unauthorized</div>;
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="mx-auto max-w-4xl px-6 space-y-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-surface-container-high p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Account settings</p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">Manage your account</h1>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-surface p-6">
                <p className="text-sm text-on-surface-variant">Name</p>
                <p className="mt-2 text-base font-medium text-foreground">{user.name}</p>
              </div>
              <div className="rounded-3xl border border-border bg-surface p-6">
                <p className="text-sm text-on-surface-variant">Email</p>
                <p className="mt-2 text-base font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6">
              <p className="text-sm text-on-surface-variant">Password</p>
              <p className="mt-2 text-base font-medium text-foreground">••••••••</p>
              <p className="mt-3 text-sm text-on-surface-variant">Change password support will be available soon.</p>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6">
              <p className="text-sm text-on-surface-variant">Account actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline">Update profile</Button>
                <Button variant="secondary">Delete account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
