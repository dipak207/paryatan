"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function DestinationDetails() {
  const params = useParams();
  const xid = params.xid;
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const [isFav, setIsFav] = useState(false);

  const markVisited = async () => {
    if (!token) return toast.error("Please login to mark visited");
    try {
      await api.addVisited(token, { xid: xid, destinationName: data.name, image: data.image, country: data.country });
      toast.success("Marked visited");
    } catch (err: any) {
      toast.error(err?.message || JSON.stringify(err));
    }
  };

  const toggleFavorite = async () => {
    if (!token) return toast.error("Please login to favorite");
    try {
      if (!isFav) {
        await api.addFavorite(token, { xid: xid, destinationName: data.name, image: data.image, country: data.country });
        setIsFav(true);
        toast.success("Added to favorites");
      } else {
        await api.removeFavorite(token, xid);
        setIsFav(false);
        toast.success("Removed from favorites");
      }
    } catch (err: any) {
      toast.error(err?.message || JSON.stringify(err));
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await api.getDestination(xid);
        setData(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (xid) load();
  }, [xid]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="h-64 bg-cover bg-center rounded-lg relative" style={{ backgroundImage: `url(${data.image || ''})` }}>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={toggleFavorite} className={`px-3 py-2 rounded bg-white/90 ${isFav ? 'text-red-500' : 'text-gray-700'}`}>{isFav ? '♥' : '♡'}</button>
          <button onClick={markVisited} className="px-3 py-2 rounded bg-white/90">Visited</button>
        </div>
      </div>
      <h1 className="text-3xl font-bold mt-4">{data.name}</h1>
      <p className="text-sm text-gray-600 mt-2">{data.country}</p>
      <div className="mt-4">
        <h3 className="font-semibold">Description</h3>
        <p className="mt-2">{data.description}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Weather</h3>
        <pre className="bg-gray-50 p-3 rounded mt-2">{JSON.stringify(data.weather, null, 2)}</pre>
      </div>
    </div>
  );
}
