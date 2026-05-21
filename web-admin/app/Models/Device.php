<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = ['device_id', 'license_id'];

    public function license()
    {
        return $this->belongsTo(License::class);
    }
}
