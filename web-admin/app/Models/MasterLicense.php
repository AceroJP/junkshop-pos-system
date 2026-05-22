<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterLicense extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_key',
        'description',
        'is_active',
        'expires_at',
        'created_by',
        'last_used_at',
        'used_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
