"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "../../services/api";
import DestinationCard from "../components/DestinationCard";

export default function SearchPage() {
  const [q, setQ] = useState("Mountains");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const doSearch = async (e?: React.FormEvent) => {
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
          {results.map((r) => (
            <div key={r.xid || r.name}> 
              <DestinationCard title={r.name} country={r.country || r.address?.country} description={r.kinds || r.wikipedia_extracts?.text} image={r.preview?.source || ""} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
