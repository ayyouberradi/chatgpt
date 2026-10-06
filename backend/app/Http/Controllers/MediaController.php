<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
class MediaController extends Controller {
 public function index() {
  $disk = Storage::disk('public');
  return response()->json(array_map(fn ($path) => ['name' => basename($path), 'url' => '/storage/'.$path, 'size' => $disk->size($path), 'type' => $disk->mimeType($path), 'created_at' => date(DATE_ATOM, $disk->lastModified($path))], $disk->files('media')));
 }
 public function store(Request $request) {
  $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,webp,avif,gif,mp4,webm,mov|max:20480']);
  $path = $request->file('file')->store('media', 'public');
  return response()->json(['name' => basename($path), 'url' => '/storage/'.$path], 201);
 }
 public function destroy(string $name) {
  abort_unless(preg_match('/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/', $name), 404);
  abort_unless(Storage::disk('public')->exists('media/'.$name), 404);
  Storage::disk('public')->delete('media/'.$name);
  return response()->json(['message' => 'Deleted.']);
 }
}
