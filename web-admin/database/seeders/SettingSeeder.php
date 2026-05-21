<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'gcash_number' => '09123456789',
            'license_price' => '4999.00',
            'license_prefix' => 'JUNK',
            'support_email' => 'support@junkshop-pos.com',
            'app_version' => '1.0.0',
            'installer_download_link' => '#',
        ];

        foreach ($settings as $key => $value) {
            // Use firstOrCreate to avoid overwriting user changes if the key already exists
            Setting::firstOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'general']
            );
        }
    }
}
