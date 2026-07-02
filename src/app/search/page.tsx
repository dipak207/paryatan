"use client";
import React, { useState } from "react";
import * as api from "../../services/api";
import DestinationCard from "../components/DestinationCard";

interface SearchResult {
  xid?: string;
  name?: string;
  country?: string;
  address?: { country?: string };
  kinds?: string;
  wikipedia_extracts?: { text?: string };
  preview?: { source?: string };
}

export default function SearchPage() {
  const [q, setQ] = useState("Mountains");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const r = await api.searchDestinations(q);
      setResults(Array.isArray(r) ? r : [r]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <form onSubmit={doSearch} className="mb-6">
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 px-4 py-3 rounded" />
          <button className="bg-primary text-on-primary px-4 py-2 rounded">Search</button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((r) => {
            const title = r.name ?? "Unknown destination";
            const country = r.country ?? r.address?.country ?? "Unknown";
            const xid = r.xid ?? title;
            return (
              <div key={xid}>
                <DestinationCard title={title} country={country} description={r.kinds || r.wikipedia_extracts?.text} image={r.preview?.source || ""} xid={xid} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
