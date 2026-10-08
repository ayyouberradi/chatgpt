#!/usr/bin/env bash
# Explicit one-time business reset; never runs during normal deployment.
set -euo pipefail
[[ "${1:-}" == 'RESET BUSINESS RECORDS' ]] || { echo 'Explicit reset scope required' >&2; exit 1; }
cd /home/u808335549/domains/salmon-turtle-767162.hostingersite.com/laravel
php artisan down --retry=60
trap 'php artisan up' EXIT
php <<'PHP'
<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$connection = Illuminate\Support\Facades\DB::connection();
if ($connection->getDriverName() !== 'sqlite') throw new RuntimeException('Reset requires a SQLite backup procedure.');
$folder = storage_path('app/deployment-backups');
if (!is_dir($folder) && !mkdir($folder, 0700, true)) throw new RuntimeException('Cannot create private backup folder.');
$destination = $folder.'/before-business-reset-'.date('Ymd-His').'-'.bin2hex(random_bytes(4)).'.sqlite';
$pdo = $connection->getPdo();
$pdo->exec('VACUUM INTO '.$pdo->quote($destination));
chmod($destination, 0600);
if (!is_file($destination) || filesize($destination) === 0) throw new RuntimeException('Backup verification failed.');
$preserve = ['users', 'site_settings', 'business_settings', 'catalogue_services', 'contract_templates', 'whatsapp_settings'];
$fingerprint = function ($table) use ($connection) { return hash('sha256', serialize($connection->table($table)->orderBy('id')->get()->all())); };
$before = [];
foreach ($preserve as $table) $before[$table] = $fingerprint($table);
$clear = ['whatsapp_replies', 'whatsapp_status_events', 'whatsapp_messages', 'client_portal_accesses', 'billing_reminders', 'notifications', 'billing_schedules', 'payments', 'document_items', 'business_documents', 'lead_follow_ups', 'leads', 'business_clients', 'audit_events', 'daily_document_sequences', 'document_sequences'];
$connection->transaction(function () use ($connection, $clear, $before, $fingerprint) {
    // Remove self references before deleting numbered and linked records.
    $connection->table('business_documents')->update(['source_document_id' => null, 'deposit_invoice_id' => null, 'billing_schedule_id' => null, 'lead_id' => null]);
    foreach ($clear as $table) $connection->table($table)->delete();
    foreach ($clear as $table) if ($connection->table($table)->exists()) throw new RuntimeException('Reset verification failed: '.$table);
    foreach ($before as $table => $hash) if ($fingerprint($table) !== $hash) throw new RuntimeException('Retained data changed: '.$table);
    if ($connection->select('PRAGMA foreign_key_check')) throw new RuntimeException('Foreign key verification failed.');
});
echo "::notice::Business records are empty; numbering reset. Website, admin users, settings, services and templates verified unchanged. Private pre-reset backup saved.\n";
PHP
php artisan up
trap - EXIT
