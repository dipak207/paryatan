import DestinationCard from "./components/destination-card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getFeaturedDestinations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_URL ?? ""}/api/featured`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load featured destinations");
  }

  const json = await res.json();
  return json.data ?? [];
}

export default async function Home() {
  let featuredDestinations = [];

  try {
    featuredDestinations = await getFeaturedDestinations();
  } catch (error) {
    console.error(error);
    featuredDestinations = [];
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">Smart travel planning</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Plan your next adventure with confidence.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-on-surface-variant">
              Paryatan brings travel discovery, weather insights, favorites, and trip planning together in one modern experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/search">
                <Button>Start exploring</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">Create account</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-surface p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <div className="grid gap-4">
              <div className="rounded-3xl border border-border bg-surface-container-high p-6">
                <p className="text-sm text-on-surface-variant">Popular this week</p>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">Best mountain escapes</h2>
              </div>
              <div className="rounded-3xl border border-border bg-surface-container-high p-6">
                <p className="text-sm text-on-surface-variant">Live updates</p>
                <p className="mt-3 text-base leading-7 text-on-surface">Get destination weather, notes, and recommendations from one place.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Featured stays</p>
              <h2 className="text-3xl font-semibold text-foreground">Curated destination picks</h2>
            </div>
            <p className="text-sm text-on-surface-variant">Browse top destinations and save favorites as you go.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredDestinations.map((destination) => (
              <DestinationCard key={destination.xid} {...destination} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
