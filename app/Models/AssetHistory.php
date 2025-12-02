<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetHistory extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'asset_id',
        'user_id',
        'action_type', // checkout, checkin, audit...
        'note', // Đảm bảo dùng 'note' thay vì 'notes'
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
