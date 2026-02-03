# TWG-LX (The Winning Game LX)

Local rebuild of TWG-LX using Next.js and Firebase.

## Getting Started

### Requirements
- Node.js 20+
- npm

### Setup
```bash
npm create next-app@latest web
cd web
npm run dev
```

### Rules
- Do not introduce Turbopack
- Follow BLUEPRINT.md strictly

### Status
MVP rebuild in progress.

---

## Step 3 — Tell Cursor how to behave (IMPORTANT)

In Cursor Chat, paste this **once** before generating code:

> You are assisting with TWG-LX.  
> Treat `BLUEPRINT.md` as authoritative.  
> Do not add features or assumptions not explicitly listed.  
> Prefer minimal diffs and explain file changes after each step.

This prevents Cursor from "helpfully" going off-script.

---

## Step 4 — Scaffold the app (now you code)

From `C:\TWG-LX` terminal:

```bash
npm create next-app@latest web -- --ts --eslint --tailwind --app --src-dir --import-alias "@/*"
```

Choose:
- TypeScript → Yes
- ESLint → Yes
- Tailwind → Yes
- App Router → Yes
- src → Yes
- React Compiler → No

Then:

```bash
cd web
npm run dev
```
