<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatusLabel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
