<?php

use App\Models\User;
use App\Models\WhatsAppSetting;
use App\Services\RecurringBilling;
use App\Services\WhatsAppBusiness;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

Artisan::command('admin:create {email}', function () {
    $email = $this->argument('email');
    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('A valid email is required.');

        return 1;
    }
    if (User::where('email', $email)->exists()) {
        $this->error('User already exists.');

        return 1;
    }
    $password = $this->secret('Admin password (at least 12 characters)');
    if (strlen($password ?? '') < 12) {
        $this->error('Password must be at least 12 characters.');

        return 1;
    }
    User::create(['name' => 'Administrator', 'email' => $email, 'password' => Hash::make($password)]);
    $this->info('Admin created.');
})->purpose('Create an administrator securely; no public registration.');

Artisan::command('billing:run', function () {
    $result = app(RecurringBilling::class)->run();
    $this->info('::notice::Monthly billing: '.json_encode($result));

    return $result['errors'] ? 1 : 0;
})->purpose('Issue due monthly invoices and create admin payment reminders');

Artisan::command('whatsapp:run {--check}', function () {
    $settings = WhatsAppSetting::current();
    if ($this->option('check')) {
        $this->info('::notice::WhatsApp connection: '.json_encode(['enabled' => $settings->enabled, 'missing_configuration' => WhatsAppSetting::missingConfiguration()]));

        return 0;
    }
    $this->info('::notice::WhatsApp outbox: '.json_encode(app(WhatsAppBusiness::class)->run()));

    return 0;
})->purpose('Process approved WhatsApp templates and scheduled follow-ups');
