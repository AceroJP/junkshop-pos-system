<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['user_id', 'amount', 'status', 'reference_number'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
