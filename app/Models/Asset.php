<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'asset_tag',
        'serial',
        'model_id',
        'status_id',
        'supplier_id',
        'purchase_date',
        'purchase_cost',
        'image',
        'assigned_to',
        'assigned_type', // Thêm cột này
        'current_value',
        'useful_life_months',
        'residual_value',
    ];

    public function model()
    {
        return $this->belongsTo(DeviceModel::class, 'model_id');
    }

    public function statusLabel()
    {
        return $this->belongsTo(StatusLabel::class, 'status_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assetHistories()
    {
        return $this->hasMany(AssetHistory::class);
    }

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }
}
