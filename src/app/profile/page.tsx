"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading, logout, refreshProfile, token } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [visited, setVisited] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      await refreshProfile();
      if (token) {
        try {
          const favs = await (await import("../../services/api")).getFavorites(token);
          const vis = await (await import("../../services/api")).getVisited(token);
          setFavorites(favs || []);
          setVisited(vis || []);
        } catch (e) {
          console.error(e);
        }
      }
    }
    load();
  }, [token]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Unauthorized</div>;

  const removeFav = async (xid: string) => {
    if (!token) return;
    try {
      await (await import("../../services/api")).removeFavorite(token, xid);
      setFavorites((f) => f.filter((i) => i.xid !== xid));
      toast.success("Removed from favorites");
    } catch (e) {
      console.error(e);
    }
  };

  const removeVisited = async (xid: string) => {
    if (!token) return;
    try {
      await (await import("../../services/api")).removeVisited(token, xid);
      setVisited((v) => v.filter((i) => i.xid !== xid));
      toast.success("Removed from visited");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2">Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <div className="mt-6">
        <h2 className="font-semibold">Favorites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {favorites.length === 0 && <p className="text-sm text-gray-500">No favorites yet.</p>}
          {favorites.map((f) => (
            <div key={f.xid} className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
              <img src={f.image || '/placeholder.jpg'} alt="" className="w-16 h-12 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{f.destinationName}</div>
                <div className="text-sm text-gray-500">{f.country}</div>
              </div>
              <button onClick={() => removeFav(f.xid)} className="text-red-500">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Visited</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {visited.length === 0 && <p className="text-sm text-gray-500">No visited places yet.</p>}
          {visited.map((v) => (
            <div key={v.xid} className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
              <img src={v.image || '/placeholder.jpg'} alt="" className="w-16 h-12 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{v.destinationName}</div>
                <div className="text-sm text-gray-500">{v.country} • {new Date(v.visitedDate).toLocaleDateString()}</div>
              </div>
              <button onClick={() => removeVisited(v.xid)} className="text-red-500">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <button onClick={() => logout()} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
    </div>
  );
}
