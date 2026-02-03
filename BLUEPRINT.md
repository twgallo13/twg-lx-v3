# The Winning Game LX (TWG-LX) — Build Blueprint

## Objective
Rebuild TWG-LX as a fast, reliable, web-based squares game platform for a live event.
Speed and correctness matter more than polish.

## Tech Stack (Locked)
- Next.js 15.x (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Firebase:
  - Auth
  - Firestore (authoritative state)
  - Hosting
- Local development using Cursor (no Codespaces)

## Core Rules (Non-Negotiable)
- Backend (Firestore / Functions later) is the source of truth.
- Frontend is display + user actions only.
- No deleting records.
- No square trading.
- No DMs.
- No refunds logic.
- No AI-generated data is persisted.

## Core Pages (MVP)
- `/` → redirect to `/gameday`
- `/gameday` → current active games
- `/boards` → list of boards
- `/boards/[gameId]` → 10x10 grid view
- `/profile`
- `/host-tools` (admin shell only)

## Grid Rules
- Always 10x10 (100 squares)
- Neutral colors only
- Gold ring for winning squares
- Read-only until backend wiring is complete

## Development Principles
- Small commits
- No Turbopack
- No package-lock.json
- Build must run locally at all times
