<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller {
 public function session(Request $request) { return response()->json(['user' => $request->user()]); }
 public function login(Request $request) {
  $credentials = $request->validate(['email' => 'required|email', 'password' => 'required|string|max:255']);
  if (!Auth::attempt($credentials)) throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
  $request->session()->regenerate();
  return response()->json(['user' => $request->user()]);
 }
 public function logout(Request $request) {
  Auth::logout(); $request->session()->invalidate(); $request->session()->regenerateToken();
  return response()->json(['message' => 'Signed out.']);
 }
}
