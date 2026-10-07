<?php
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
Artisan::command('admin:create {email}', function () {
 $email = $this->argument('email');
 if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $this->error('A valid email is required.'); return 1; }
 if (User::where('email', $email)->exists()) { $this->error('User already exists.'); return 1; }
 $password = $this->secret('Admin password (at least 12 characters)');
 if (strlen($password ?? '') < 12) { $this->error('Password must be at least 12 characters.'); return 1; }
 User::create(['name' => 'Administrator', 'email' => $email, 'password' => Hash::make($password)]);
 $this->info('Admin created.');
})->purpose('Create an administrator securely; no public registration.');

\Illuminate\Support\Facades\Artisan::command('billing:run', function () {
    $result = app(\App\Services\RecurringBilling::class)->run();
    $this->info('::notice::Monthly billing: '.json_encode($result));
    return $result['errors'] ? 1 : 0;
})->purpose('Issue due monthly invoices and create admin payment reminders');
