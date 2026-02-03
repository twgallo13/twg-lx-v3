#!/bin/bash
set -e

cd /workspaces/twg-lx-v3

echo "=== Building functions ==="
cd functions && npm run build
cd ..

echo "=== Git status ==="
git status --short

echo "=== Staging files ==="
git add functions/src/reserveSquare.ts functions/src/index.ts functions/test/reserveSquare.test.ts

echo "=== Committing ==="
git commit -m "Implement reserveSquare Cloud Function with transactional safety and validation" || echo "Already committed"

echo "=== Pushing to remote ==="
git push origin main

echo "=== Deploying functions ==="
firebase deploy --only functions

echo "=== Listing functions ==="
firebase functions:list | grep -E "Function|reserveSquare"

echo "=== Done ==="
