<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessPdfController;
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::post('bookings', [EnquiryController::class, 'booking'])->middleware('throttle:5,1');
    Route::post('enquiries', [EnquiryController::class, 'store'])->middleware('throttle:5,1');
    Route::get('session', [AuthController::class, 'session']);
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::get('settings', [SettingsController::class, 'show']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::middleware(['auth', 'can:manage-business'])->group(function () {
        Route::patch('settings', [SettingsController::class, 'update']);
        Route::put('settings/{collection}', [SettingsController::class, 'collection']);
        Route::get('media', [MediaController::class, 'index']);
        Route::post('media', [MediaController::class, 'store'])->middleware('throttle:30,1');
        Route::delete('media/{name}', [MediaController::class, 'destroy']);
    });
    Route::any('{path}', fn () => response()->json(['message' => 'Not found.'], 404))->where('path', '.*');
});
Route::get('/manage/documents/{document}/pdf', BusinessPdfController::class)->middleware(['auth', 'can:manage-business'])->name('business.pdf');
Route::get('/{path?}', function () {
    abort_unless(is_file(public_path('site/index.html')), 503, 'Build the frontend first.');

    $response = response()->file(public_path('site/index.html'));
    $response->headers->set('Cache-Control', 'private, no-store, max-age=0');

    return $response;
})->where('path', '^(?!storage/|site/|manage(?:/|$)|livewire(?:/|$)).*');
