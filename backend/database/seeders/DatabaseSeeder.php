<?php

namespace Database\Seeders;

use App\Models\CatalogueService;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $settings = SiteSetting::firstOrCreate(['id' => 1], ['content' => json_decode(file_get_contents(database_path('seeders/site-content.json')), true, 512, JSON_THROW_ON_ERROR)]);
        foreach (($settings->content['admin_data']['services'] ?? []) as $service) {
            $price = $service['startingPrice'] ?? ($service['priceOptions'][0]['price'] ?? '0');
            preg_match('/[\d,]+(?:\.\d{1,2})?/', $price, $match);
            CatalogueService::firstOrCreate(['source_key' => $service['id']], ['name' => $service['title'], 'description' => $service['description'] ?? null, 'scope' => implode("\n", $service['features'] ?? []), 'unit_amount' => (int) round((float) str_replace(',', '', $match[0] ?? '0') * 100), 'currency' => 'MAD', 'billing_period' => str_contains($price, '/month') ? 'monthly' : 'one_time']);
        }
    }
}
