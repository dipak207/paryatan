"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import * as api from "@/services/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FavoriteItem {
  xid: string;
  destinationName: string;
  image?: string;
  country?: string;
}

interface VisitedItem extends FavoriteItem {
  visitedDate: string;
}

export default function ProfilePage() {
  const { user, loading, logout, refreshProfile, token } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [visited, setVisited] = useState<VisitedItem[]>([]);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        await refreshProfile();
        const favs = await api.getFavorites(token);
        const vis = await api.getVisited(token);
        setFavorites(favs || []);
        setVisited(vis || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [token, refreshProfile]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-on-surface-variant">Please log in to view your profile.</div>;
  }

  const removeFav = async (xid: string) => {
    if (!token) return;
    try {
      await api.removeFavorite(token, xid);
      setFavorites((current) => current.filter((item) => item.xid !== xid));
      toast.success("Removed from favorites");
    } catch (e) {
      console.error(e);
      toast.error("Unable to remove favorite");
    }
  };

  const removeVisited = async (xid: string) => {
    if (!token) return;
    try {
      await api.removeVisited(token, xid);
      setVisited((current) => current.filter((item) => item.xid !== xid));
      toast.success("Removed from visited");
    } catch (e) {
      console.error(e);
      toast.error("Unable to remove visited record");
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="mx-auto max-w-6xl px-6 space-y-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-surface-container-high p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Profile</p>
                <h1 className="text-3xl font-semibold text-foreground">Hello, {user.name}</h1>
                <p className="text-sm text-on-surface-variant">Manage your favorites, visited landmarks, and account details.</p>
              </div>
              <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4 rounded-3xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-foreground">Account details</h2>
              <p className="text-sm text-on-surface-variant">Name</p>
              <p className="text-base font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-on-surface-variant">Email</p>
              <p className="text-base font-medium text-foreground">{user.email}</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
              <p className="text-sm text-on-surface-variant">Use the search page to save new favorites and mark destinations as visited.</p>
              <div className="grid gap-3">
                <Link href="/search" className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground transition hover:bg-surface-container-high">
                  Search destinations
                </Link>
                <Link href="/settings" className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground transition hover:bg-surface-container-high">
                  Account settings
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-surface-container-high p-6">
              <h2 className="text-lg font-semibold text-foreground">Favorites</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {favorites.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No favorites yet. Save destinations from the Explore page.</p>
                ) : (
                  favorites.map((fav) => (
                    <div key={fav.xid} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4">
                      <Image src={fav.image || "/placeholder.jpg"} alt={fav.destinationName} width={96} height={72} className="rounded-2xl object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{fav.destinationName}</p>
                        <p className="text-sm text-on-surface-variant">{fav.country || "Unknown region"}</p>
                      </div>
                      <button onClick={() => removeFav(fav.xid)} className="text-sm font-semibold text-rose-600 transition hover:text-rose-700">
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-surface-container-high p-6">
              <h2 className="text-lg font-semibold text-foreground">Visited</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {visited.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No visited destinations yet. Mark a destination visited to keep track.</p>
                ) : (
                  visited.map((visit) => (
                    <div key={visit.xid} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4">
                      <Image src={visit.image || "/placeholder.jpg"} alt={visit.destinationName} width={96} height={72} className="rounded-2xl object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{visit.destinationName}</p>
                        <p className="text-sm text-on-surface-variant">{visit.country || "Unknown region"}</p>
                        <p className="text-sm text-on-surface-variant">Visited {new Date(visit.visitedDate).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => removeVisited(visit.xid)} className="text-sm font-semibold text-rose-600 transition hover:text-rose-700">
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
