#!/usr/bin/env bash
set -euo pipefail
cd /home/u808335549/domains/salmon-turtle-767162.hostingersite.com/laravel
php <<'PHP'
<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$db=Illuminate\Support\Facades\DB::connection();
$rows=$db->table('business_documents')->whereIn('type',['quote','invoice'])->orderByDesc('id')->limit(20)->get(['id','type','number','status','source_document_id','deposit_invoice_id','payment_percent','total_amount','issued_at','archived_at']);
foreach ($rows as $row) {
 if($row->type==='invoice') $row->paid=$db->table('payments')->where('business_document_id',$row->id)->whereNull('voided_at')->sum('amount');
 echo '::notice::'.json_encode($row)."\n";
}
PHP
