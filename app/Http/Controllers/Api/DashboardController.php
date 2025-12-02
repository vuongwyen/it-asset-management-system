<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\License;
use App\Models\AssetHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats()
    {
        // 1. Total Assets
        $totalAssets = Asset::count();

        // 2. Total Cost
        $totalCost = Asset::sum('purchase_cost');

        // 3. Total Licenses
        $totalLicenses = License::count();

        // 4. Assets by Status
        $assetsByStatus = Asset::select('status_id', DB::raw('count(*) as count'))
            ->groupBy('status_id')
            ->with('statusLabel')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->statusLabel ? $item->statusLabel->name : 'Unknown',
                    'count' => $item->count,
                    'type' => $item->statusLabel ? $item->statusLabel->type : 'unknown',
                ];
            });

        // 5. Recent Activity
        $recentActivity = AssetHistory::with(['asset', 'user', 'admin'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_assets' => $totalAssets,
            'total_cost' => $totalCost,
            'total_licenses' => $totalLicenses,
            'assets_by_status' => $assetsByStatus,
            'recent_activity' => $recentActivity,
        ]);
    }
}
