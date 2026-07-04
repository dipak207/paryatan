"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/services/api";
import DestinationCard from "../components/destination-card";
import { Button } from "@/components/ui/button";

interface SearchResult {
  xid: string;
  name?: string | null;
  country?: string | null;
  description?: string | null;
  image?: string | null;
}

export default function SearchPage() {
  const [q, setQ] = useState("Mountains");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (query: string) => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const r = await api.searchDestinations(cleanQuery);
      const normalizedResults = Array.isArray(r) ? r : [r];

      setResults(
        normalizedResults.filter(
          (item): item is SearchResult =>
            Boolean(item?.xid) && Boolean(item?.name)
        )
      );
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    await runSearch(q);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get("q");

    if (queryFromUrl) {
      setTimeout(() => {
        setQ(queryFromUrl);
        void runSearch(queryFromUrl);
      }, 0);
    }
  }, []);

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                Explore
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">
                Search destinations and save favorites.
              </h1>
            </div>

            <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
              Use a keyword to discover destinations, save them to your profile,
              and keep track of your visited places.
            </p>
          </div>

          <form
            onSubmit={doSearch}
            className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-3xl border border-border bg-surface px-5 py-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Search destinations, cities or landmarks"
            />

            <Button type="submit" className="w-full sm:w-auto">
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="rounded-[2rem] border border-border bg-surface p-12 text-center text-on-surface-variant">
              Loading results...
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-surface p-12 text-center text-on-surface-variant">
              No destinations found yet — try another search.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((result) => (
                <DestinationCard
                  key={result.xid}
                  xid={result.xid}
                  name={result.name}
                  country={result.country}
                  description={result.description}
                  image={result.image}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
