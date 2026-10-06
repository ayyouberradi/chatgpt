<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;
Route::prefix('api')->group(function () {
 Route::get('session', [AuthController::class, 'session']);
 Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
 Route::get('settings', [SettingsController::class, 'show']);
 Route::middleware('auth')->group(function () {
  Route::post('logout', [AuthController::class, 'logout']);
  Route::patch('settings', [SettingsController::class, 'update']);
  Route::put('settings/{collection}', [SettingsController::class, 'collection']);
  Route::get('media', [MediaController::class, 'index']);
  Route::post('media', [MediaController::class, 'store'])->middleware('throttle:30,1');
  Route::delete('media/{name}', [MediaController::class, 'destroy']);
 });
 Route::any('{path}', fn () => response()->json(['message' => 'Not found.'], 404))->where('path', '.*');
});
Route::get('/{path?}', function () {
 abort_unless(is_file(public_path('site/index.html')), 503, 'Build the frontend first.');
 return response()->file(public_path('site/index.html'));
})->where('path', '^(?!storage/|site/).*');
