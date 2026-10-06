<?php
namespace Database\Seeders;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder {
 public function run(): void {
  SiteSetting::firstOrCreate(['id' => 1], ['content' => json_decode(file_get_contents(database_path('seeders/site-content.json')), true, 512, JSON_THROW_ON_ERROR)]);
 }
}
