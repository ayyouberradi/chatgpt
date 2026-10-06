#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -x /workspace/toolchain/bin/php ]]; then
  export PATH="/workspace/toolchain/bin:$PATH"
fi
export npm_config_cache="$project_root/.cache/npm"
export COMPOSER_HOME="$project_root/.cache/composer"
cd "$project_root/backend"
if command -v composer >/dev/null; then
  composer install --no-interaction --prefer-dist
elif [[ -f /workspace/toolchain/composer.phar ]]; then
  php /workspace/toolchain/composer.phar install --no-interaction --prefer-dist
else
  echo 'Install Composer 2 and PHP 8.4 with intl, mbstring, XML, SQLite, curl, zip and fileinfo.' >&2
  exit 1
fi
if [[ ! -f .env ]]; then cp .env.example .env; fi
if ! php -r 'require "vendor/autoload.php"; $app=require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); exit(config("app.key") ? 0 : 1);'; then
  php artisan key:generate --force
fi
if [[ ! -e database/database.sqlite ]]; then touch database/database.sqlite; fi
php artisan migrate --seed --force
php artisan filament:assets
mkdir -p storage/fonts
if [[ ! -e public/storage ]]; then php artisan storage:link; fi
cd "$project_root/frontend"
npm ci --no-audit --no-fund
cd "$project_root"
node scripts/build.mjs
