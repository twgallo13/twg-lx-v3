"use client";

import { useMemo } from "react";
import type { SquareDoc, SquareState } from "@/lib/types";

const MAX_USER_LABEL = 7; // 6–8 chars per spec

/** Internal render model: distinguish real squares from missing placeholders */
type RenderCell =
  | { kind: "real"; square: SquareDoc }
  | { kind: "missing" };

function truncateLabel(value: string | undefined | null): string {
  if (value == null || value === "") return "—";
  const s = String(value);
  if (s.length <= MAX_USER_LABEL) return s;
  return s.slice(0, MAX_USER_LABEL) + "…";
}

/**
 * Phase 1 grid contract: neutral palette; gold only for winning; no red/green. Display-only.
 * Always renders 100 cells (10x10). Missing squares are explicitly "unknown", not "available".
 * Does not assume backend completeness or infer state.
 */
export function GameGrid({
  squares,
  winningSquareIds,
  usernameByUserId,
}: {
  squares: SquareDoc[];
  winningSquareIds: Set<string>;
  usernameByUserId?: Record<string, string>;
}) {
  const grid = useMemo(() => {
    // Build index of real squares by position (defensive: ignore invalid row/col)
    const squareIndex = new Map<string, SquareDoc>();
    for (const sq of squares) {
      const r = sq.row ?? -1;
      const c = sq.col ?? -1;
      if (r >= 0 && r < 10 && c >= 0 && c < 10) {
        squareIndex.set(`${r}-${c}`, sq);
      }
    }

    // Build 100-cell grid with RenderCell model
    const cells: RenderCell[][] = [];
    for (let r = 0; r < 10; r++) {
      const row: RenderCell[] = [];
      for (let c = 0; c < 10; c++) {
        const sq = squareIndex.get(`${r}-${c}`);
        if (sq) {
          row.push({ kind: "real", square: sq });
        } else {
          row.push({ kind: "missing" });
        }
      }
      cells.push(row);
    }

    return cells;
  }, [squares]);

  return (
    <div
      className="inline-grid gap-px grid-cols-10 bg-stone-300 p-px rounded border border-stone-400"
      role="group"
      aria-label="Game grid"
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const key =
            cell.kind === "real" ? cell.square.id : `missing-${r}-${c}`;
          const isWinning =
            cell.kind === "real" && winningSquareIds.has(cell.square.id);
          const displayLabel =
            cell.kind === "real" && cell.square.userId
              ? truncateLabel(
                  usernameByUserId?.[cell.square.userId] ?? cell.square.userId
                )
              : null;

          return (
            <GridCell
              key={key}
              cell={cell}
              isWinning={isWinning}
              displayLabel={displayLabel}
            />
          );
        })
      )}
    </div>
  );
}

function GridCell({
  cell,
  isWinning,
  displayLabel,
}: {
  cell: RenderCell;
  isWinning: boolean;
  displayLabel: string | null;
}) {
  const base =
    "aspect-square min-w-0 flex items-center justify-center text-xs font-medium border border-stone-300 rounded-sm";

  const stateStyles: Record<SquareState | "unknown", string> = {
    available: "bg-stone-100 text-stone-500 border-stone-300",
    reserved: "bg-stone-200 text-stone-700 border-stone-400",
    pending_payment: "bg-stone-200 text-stone-700 border-stone-400",
    confirmed: "bg-stone-300 text-stone-800 border-stone-500",
    void: "bg-stone-100 text-stone-400 border-stone-300",
    unknown: "bg-stone-50 text-stone-400 border-stone-200 cursor-not-allowed",
  };

  const winningRing = isWinning
    ? "ring-2 ring-amber-500 ring-offset-1 ring-offset-stone-100 shadow-[0_0_8px_rgba(202,138,4,0.5)]"
    : "";

  // Missing cells: explicitly unknown, no implied availability
  if (cell.kind === "missing") {
    return (
      <div
        className={`${base} ${stateStyles.unknown}`}
        aria-label="Unknown square"
      >
        —
      </div>
    );
  }

  // Real cells: use actual state, or "unknown" if state is missing/invalid
  const { square } = cell;
  const state: SquareState | "unknown" = square.state ?? "unknown";
  const validState: SquareState | "unknown" =
    state === "available" ||
    state === "reserved" ||
    state === "pending_payment" ||
    state === "confirmed" ||
    state === "void"
      ? state
      : "unknown";

  return (
    <div
      className={`${base} ${stateStyles[validState]} ${winningRing}`}
      aria-label={`Square ${square.row}-${square.col}, ${validState}`}
    >
      {validState === "unknown" ? "—" : displayLabel ?? ""}
    </div>
  );
}
