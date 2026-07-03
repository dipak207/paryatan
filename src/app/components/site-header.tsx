"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function SiteHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground">
          Paryatan
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-on-surface-variant transition hover:text-foreground">
            Home
          </Link>
          <Link href="/search" className="text-on-surface-variant transition hover:text-foreground">
            Explore
          </Link>
          <Link href="/profile" className="text-on-surface-variant transition hover:text-foreground">
            Profile
          </Link>
          {user ? (
            <button onClick={logout} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-container-high">
              Logout
            </button>
          ) : (
            <Link href="/login" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
