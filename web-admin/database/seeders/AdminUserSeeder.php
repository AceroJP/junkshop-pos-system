<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Initial Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'super@admin.junkshop.com',
            'password' => Hash::make('Admin@12345'), // 10 chars, uppercase, number
            'role' => User::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);

        // Finance Admin
        User::create([
            'name' => 'Finance Admin',
            'email' => 'finance@admin.junkshop.com',
            'password' => Hash::make('Finance@2026'),
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);
    }
}
