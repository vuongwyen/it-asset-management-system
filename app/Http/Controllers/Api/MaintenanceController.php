<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use App\Models\Asset;
use App\Models\StatusLabel;
use App\Http\Requests\StoreMaintenanceRequest;
use App\Http\Requests\UpdateMaintenanceRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MaintenanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $maintenances = Maintenance::with(['asset', 'supplier'])->latest()->paginate(10);
        return response()->json($maintenances);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMaintenanceRequest $request)
    {
        DB::beginTransaction();
        try {
            // 1. Create Maintenance
            $maintenance = Maintenance::create($request->validated());

            // 2. Update Asset Status -> In Maintenance
            $asset = Asset::lockForUpdate()->findOrFail($request->asset_id);

            // Find or create 'In Maintenance' status
            $statusMaintenance = StatusLabel::firstOrCreate(
                ['name' => 'In Maintenance'],
                ['type' => 'deployable', 'notes' => 'Asset is being repaired or maintained']
            );

            $asset->status_id = $statusMaintenance->id;
            $asset->save();

            DB::commit();

            return response()->json([
                'message' => 'Maintenance created successfully',
                'data' => $maintenance
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Maintenance Store Failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create maintenance: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $maintenance = Maintenance::with(['asset', 'supplier'])->findOrFail($id);
        return response()->json($maintenance);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMaintenanceRequest $request, string $id)
    {
        DB::beginTransaction();
        try {
            $maintenance = Maintenance::findOrFail($id);
            $maintenance->fill($request->validated());
            $maintenance->save();

            // 3. If completed, Update Asset Status -> Ready to Deploy
            if ($maintenance->completion_date) {
                $asset = Asset::lockForUpdate()->findOrFail($maintenance->asset_id);

                $statusReady = StatusLabel::where('name', 'Ready to Deploy')->first();
                if (!$statusReady) {
                    $statusReady = StatusLabel::where('type', 'deployable')->first();
                }

                if ($statusReady) {
                    $asset->status_id = $statusReady->id;
                    $asset->save();
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Maintenance updated successfully',
                'data' => $maintenance
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Maintenance Update Failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update maintenance: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $maintenance = Maintenance::findOrFail($id);
        $maintenance->delete();
        return response()->json(['message' => 'Maintenance deleted successfully']);
    }
}
