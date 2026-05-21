<?php

namespace App\Services;

use App\Models\License;
use Illuminate\Support\Str;

class LicenseService
{
    /**
     * Generate a unique license key.
     * Format: XXXX-XXXX-XXXX-XXXX
     */
    public function generateKey(): string
    {
        do {
            $key = strtoupper(Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));
        } while (License::where('license_key', $key)->exists());

        return $key;
    }

    /**
     * Create a license for a user.
     */
    public function createLicense(int $userId): License
    {
        return License::create([
            'user_id' => $userId,
            'license_key' => $this->generateKey(),
            'status' => 'inactive',
        ]);
    }
}
