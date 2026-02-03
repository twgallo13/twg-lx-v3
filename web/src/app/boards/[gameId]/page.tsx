"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { subscribeToGames, subscribeToSquares } from "@/lib/firestore/readers";
import { GameGrid } from "@/components/GameGrid";
import type { GameDoc, SquareDoc } from "@/lib/types";

export default function BoardGamePage() {
  const params = useParams();
  const gameId = typeof params.gameId === "string" ? params.gameId : "";

  const [game, setGame] = useState<GameDoc | null>(null);
  const [squares, setSquares] = useState<SquareDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    const unsubGames = subscribeToGames(
      (result) => {
        if (result.error) {
          setError(result.error.message);
          setLoading(false);
        } else {
          const g = result.data.find((x) => x.id === gameId) ?? null;
          setGame(g);
          setError(null);
        }
      },
      (err) => {
        setError(err?.message ?? "Failed to load game");
        setLoading(false);
      }
    );
    return () => unsubGames();
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const unsubSquares = subscribeToSquares(
      gameId,
      (result) => {
        if (result.error) {
          setError(result.error.message);
          setLoading(false);
        } else {
          setSquares(result.data);
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        setError(err?.message ?? "Failed to load squares");
        setLoading(false);
      }
    );
    return () => unsubSquares();
  }, [gameId]);

  const winningSquareIds = useMemo(() => {
    if (!game?.winnerSnapshot) return new Set<string>();
    const ids = new Set<string>();
    for (const entry of Object.values(game.winnerSnapshot)) {
      if (entry?.squareId) ids.add(entry.squareId);
    }
    return ids;
  }, [game?.winnerSnapshot]);

  if (!gameId) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-amber-700">Missing game ID.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6">
        <Link href="/boards" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Boards
        </Link>
        <p className="text-amber-700" role="alert">
          Error: {error}
        </p>
      </main>
    );
  }

  if (loading || squares === null) {
    return (
      <main className="min-h-screen p-6">
        <Link href="/boards" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Boards
        </Link>
        <h1 className="text-xl font-semibold mb-4">{game?.name ?? gameId}</h1>
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <Link href="/boards" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Boards
      </Link>
      <h1 className="text-xl font-semibold mb-4">{game?.name ?? gameId}</h1>
      {squares.length === 0 ? (
        <p className="text-stone-500">No squares yet.</p>
      ) : (
        <GameGrid squares={squares} winningSquareIds={winningSquareIds} />
      )}
    </main>
  );
}
