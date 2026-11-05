#!/bin/bash
# Vercel Ignored Build Step. Exit 0 skips the build, exit 1 builds.
# Skips only when every file changed since the last successful deployment on
# this branch is a Markdown file, because each deployment uses Vercel storage.
# The app does not read any .md file at build time or at runtime.
# Anything uncertain builds, so a real change can never be skipped by accident.

previous="$VERCEL_GIT_PREVIOUS_SHA"

# First deployment of a branch, or the variable is not exposed.
if [ -z "$previous" ]; then
  echo "No previous deployment to compare with. Building."
  exit 1
fi

# Vercel clones only recent history, so the commit may not be available.
if ! git cat-file -e "$previous^{commit}" 2>/dev/null; then
  echo "Previous deployment commit is not in this clone. Building."
  exit 1
fi

# --no-renames lists both sides of a rename, so app/x.tsx renamed to x.md builds.
if ! changed="$(git diff --no-renames --name-only "$previous" HEAD)"; then
  echo "Could not compare commits. Building."
  exit 1
fi

# No changes means someone pressed Redeploy on purpose.
if [ -z "$changed" ]; then
  echo "No file changes, treating this as a manual redeploy. Building."
  exit 1
fi

if echo "$changed" | grep -qvE '\.md$'; then
  echo "App files changed. Building."
  exit 1
fi

echo "Only Markdown files changed. Skipping this deployment."
exit 0
