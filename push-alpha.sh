#!/usr/bin/env bash
set -euo pipefail

# Push the 1.0.0-alpha.1 source to a separate GitHub branch.
# Requires an authenticated Git CLI (or GitHub CLI) with repository write access.
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO="https://github.com/Nadzil123/NQ-Code-Android.git"
BRANCH="release/1.0.0-alpha.1"

for tool in git cp mktemp; do
  command -v "$tool" >/dev/null 2>&1 || { echo "Missing command: $tool" >&2; exit 1; }
done
[ -f "$ROOT/app/build.gradle.kts" ] || { echo "Run this script from an extracted NQ Code alpha source ZIP." >&2; exit 1; }

# The user's GitHub CLI login can provide credentials to the Git client.
if command -v gh >/dev/null 2>&1; then
  gh auth setup-git >/dev/null 2>&1 || true
fi

TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT

echo "Cloning $REPO ..."
git clone --quiet --branch main "$REPO" "$TMP/repo"
cd "$TMP/repo"
git switch -q -c "$BRANCH"

# Preserve the parent branch and its Git history, replacing only working files.
# Remove the obsolete workflow that uses a missing gradlew script.
rm -f .github/workflows/android.yml
cp -a "$ROOT/." ./
git add -A
git diff --cached --check
if git diff --cached --quiet; then
  echo "No changes found; nothing was pushed."
  exit 0
fi

echo "Committing release candidate to $BRANCH ..."
if ! git commit -m 'feat(android): prepare NQ Code 1.0.0-alpha.1'; then
  echo "Git commit failed. Configure git user.name and user.email if they are missing." >&2
  exit 1
fi

echo "Pushing to GitHub (no force-push) ..."
git push -u origin "$BRANCH"
echo "SUCCESS: https://github.com/Nadzil123/NQ-Code-Android/tree/$BRANCH"
echo "Create a PR against main to trigger review and Android CI checks."
