#!/usr/bin/env bash
set -euo pipefail

PATCH_NAME="001-user-group-allowlist.patch"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
PATCH_PATH="$SCRIPT_DIR/$PATCH_NAME"
CHECK_ONLY=0

if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=1
fi

if [[ ! -f "$PATCH_PATH" ]]; then
  echo "Patch file not found: $PATCH_PATH" >&2
  exit 1
fi

cd "$REPO_ROOT"

if [[ ! -d backend || ! -d frontend ]]; then
  echo "Run this script from inside the jiufeng-sub2api workspace. Missing backend or frontend folder." >&2
  exit 1
fi

if git apply --check --whitespace=nowarn "$PATCH_PATH" >/dev/null 2>&1; then
  if [[ "$CHECK_ONLY" -eq 1 ]]; then
    echo "Patch can be applied: $PATCH_NAME"
    exit 0
  fi

  git apply --whitespace=nowarn "$PATCH_PATH"
  echo "Applied patch: $PATCH_NAME"
  exit 0
fi

if git apply --reverse --check --whitespace=nowarn "$PATCH_PATH" >/dev/null 2>&1; then
  echo "Patch is already applied: $PATCH_NAME"
  exit 0
fi

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  echo "Patch cannot be applied cleanly: $PATCH_NAME" >&2
  exit 1
fi

echo "Patch did not apply cleanly. Trying 3-way apply..."
if git apply --3way --whitespace=nowarn "$PATCH_PATH"; then
  echo "Applied patch with 3-way merge: $PATCH_NAME"
  exit 0
fi

echo "Patch failed. Open $PATCH_NAME and apply the rejected hunks manually." >&2
exit 1
