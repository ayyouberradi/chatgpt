#!/usr/bin/env bash
# Remove only temporary deployment uploads; the live app, public files and backups stay intact.
set -euo pipefail
deploy_root='/home/u808335549/domains/salmon-turtle-767162.hostingersite.com'
[[ "${1:-}" == "$deploy_root" && "${2:-}" == "$deploy_root"/.github-release-* ]] || exit 1
release_root="$2"
[[ "$(basename "$release_root")" =~ ^\.github-release-[0-9]+-[0-9]+$ ]] || exit 1
removed=0
for staging_path in "$deploy_root"/.github-release-*; do
  [[ -d "$staging_path" && ! -L "$staging_path" && "$staging_path" != "$release_root" ]] || continue
  [[ "$(basename "$staging_path")" =~ ^\.github-release-[0-9]+-[0-9]+$ ]] || continue
  rm -rf -- "$staging_path"
  removed=$((removed + 1))
done
echo "Removed $removed obsolete deployment staging directories."
mkdir -p "$release_root"
