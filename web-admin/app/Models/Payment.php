<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id', 
        'amount', 
        'status', 
        'reference_number', 
        'receipt_image', 
        'rejection_reason', 
        'verified_by', 
        'verified_at'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function license()
    {
        return $this->hasOne(License::class);
    }
}
