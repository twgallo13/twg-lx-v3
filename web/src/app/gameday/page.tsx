"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeToGames } from "@/lib/firestore/readers";
import type { GameDoc } from "@/lib/types";

export default function GamedayPage() {
  const [games, setGames] = useState<GameDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToGames(
      (result) => {
        if (result.error) {
          setError(result.error.message);
          setGames([]);
        } else {
          setGames(result.data);
          setError(null);
        }
      },
      (err) => setError(err?.message ?? "Failed to load games")
    );
    return () => unsub();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-xl font-semibold mb-4">Game Day</h1>
        <p className="text-amber-700" role="alert">
          Error: {error}
        </p>
      </main>
    );
  }

  if (games === null) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-xl font-semibold mb-4">Game Day</h1>
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-xl font-semibold mb-4">Game Day</h1>
      {games.length === 0 ? (
        <p className="text-stone-500">No games yet.</p>
      ) : (
        <ul className="space-y-2">
          {games.map((g) => (
            <li key={g.id}>
              <Link
                href={`/boards/${g.id}`}
                className="text-blue-600 hover:underline"
              >
                {g.name ?? g.id}
              </Link>
              {g.status != null && (
                <span className="ml-2 text-stone-500 text-sm">{g.status}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
