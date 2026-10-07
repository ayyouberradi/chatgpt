#!/usr/bin/env bash
# Runs on Hostinger over authenticated SSH; preserves live data and credentials.
set -euo pipefail
deploy_root="/home/u808335549/domains/salmon-turtle-767162.hostingersite.com"
release_root="${1:?Pass the uploaded release directory}"
[[ "$release_root" == "$deploy_root"/.github-release-* ]] || { echo 'Invalid release directory' >&2; exit 1; }
[[ -f "$deploy_root/laravel/.env" && -f "$release_root/laravel/vendor/autoload.php" && -f "$release_root/public_html/site/index.html" ]] || { echo 'Live configuration or release is missing' >&2; exit 1; }
command -v rsync >/dev/null
cd "$deploy_root/laravel"
php -r 'if (PHP_VERSION_ID < 80400) { fwrite(STDERR, "PHP 8.4+ required\n"); exit(1); }'
php -r 'foreach (["intl", "mbstring", "dom", "pdo_sqlite"] as $extension) { if (!extension_loaded($extension)) { fwrite(STDERR, "Enable PHP extension $extension in Hostinger PHP Configuration before deploying.\n"); exit(1); } }'
# Verify the complete new dependency platform before changing the working site.
php -r 'require $argv[1];' "$release_root/laravel/vendor/autoload.php"
php artisan down --retry=60
trap 'cd "$deploy_root/laravel"; php artisan up' EXIT
# Back up the live SQLite database consistently before running migrations.
php <<'PHP'
<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$connection = Illuminate\Support\Facades\DB::connection();
if ($connection->getDriverName() !== 'sqlite') {
    throw new RuntimeException('This deployment requires a database backup procedure for the configured driver.');
}
$folder = storage_path('app/deployment-backups');
if (!is_dir($folder) && !mkdir($folder, 0700, true)) throw new RuntimeException('Cannot create backup directory.');
$destination = $folder.'/database-'.date('Ymd-His').'-'.bin2hex(random_bytes(4)).'.sqlite';
$pdo = $connection->getPdo();
$pdo->exec('VACUUM INTO '.$pdo->quote($destination));
chmod($destination, 0600);
echo "Database backup saved outside public_html.\n";
PHP
rsync -a --delete \
  --exclude='.env' --exclude='.env.*' --exclude='storage/' \
  --exclude='bootstrap/cache/' --exclude='database/*.sqlite*' \
  "$release_root/laravel/" "$deploy_root/laravel/"
# Keep old hashed frontend assets for browsers with an already-open tab.
rsync -a --exclude='storage' "$release_root/public_html/" "$deploy_root/public_html/"
# Rebuild dependency manifests after adding Filament; these contain no user data.
rm -f bootstrap/cache/config.php bootstrap/cache/packages.php bootstrap/cache/services.php
php artisan package:discover --ansi
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force
php artisan config:cache
mkdir -p storage/fonts
# Exercise the production PDF path (Laravel/public does not exist on this host).
# Render in memory only; never publish a client document or write PDF content to logs.
php <<'PHP'
<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$document = App\Models\BusinessDocument::orderBy('id')->first();
$content = $document
    ? app(App\Http\Controllers\BusinessPdfController::class)($document)->getContent()
    : Barryvdh\DomPDF\Facade\Pdf::loadHTML('<html><body style="font-family: DejaVu Sans">PDF deployment check: é è à</body></html>')->output();
if (!str_starts_with($content, '%PDF-')) throw new RuntimeException('PDF render check failed.');
echo "Production PDF render check passed.\n";
PHP
# The existing shell-created storage link is preserved. No PHP symlink/exec needed.
[[ -L "$deploy_root/public_html/storage" ]] || { echo 'Existing media storage link is missing' >&2; exit 1; }
php artisan up
trap - EXIT
echo 'Hostinger update completed.'
