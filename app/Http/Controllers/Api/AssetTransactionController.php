<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetHistory;
use App\Models\StatusLabel;
use App\Http\Requests\CheckoutAssetRequest;
use App\Http\Requests\CheckinAssetRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class AssetTransactionController extends Controller
{
    /**
     * Cấp phát tài sản (Checkout)
     */
    public function checkout(CheckoutAssetRequest $request)
    {
        Log::info('Start Checkout Process', ['request' => $request->all()]);

        DB::beginTransaction();

        try {
            $asset = Asset::lockForUpdate()->findOrFail($request->asset_id);

            // 1. Cập nhật trạng thái Asset -> Deployed
            $deployedStatus = StatusLabel::where('name', 'Deployed')->first();
            if (!$deployedStatus) {
                // Fallback
                $deployedStatus = StatusLabel::where('type', 'deployable')->first();
            }

            if (!$deployedStatus) {
                throw new \Exception('Không tìm thấy trạng thái "Deployed" trong hệ thống.');
            }

            $asset->status_id = $deployedStatus->id;
            $asset->assigned_to = $request->user_id;
            $asset->assigned_type = \App\Models\User::class; // Optional: Lưu class name
            $asset->save();

            Log::info('Asset updated', ['asset_id' => $asset->id, 'status_id' => $asset->status_id, 'assigned_to' => $asset->assigned_to]);

            // 2. Ghi log AssetHistory
            $history = AssetHistory::create([
                'asset_id' => $asset->id,
                'user_id' => $request->user_id, // Người nhận
                'action_type' => 'checkout',
                'note' => $request->note, // Fix: note instead of notes
            ]);

            Log::info('AssetHistory created', ['history_id' => $history->id]);

            DB::commit();

            return response()->json([
                'message' => 'Cấp phát tài sản thành công!',
                'data' => $asset->load(['assignedUser', 'statusLabel'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout Failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Lỗi cấp phát: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Thu hồi tài sản (Checkin)
     */
    public function checkin(CheckinAssetRequest $request)
    {
        Log::info('Start Checkin Process', ['request' => $request->all()]);

        DB::beginTransaction();

        try {
            $asset = Asset::lockForUpdate()->findOrFail($request->asset_id);
            $previousUser = $asset->assigned_to;

            // 1. Cập nhật trạng thái Asset theo request (Ready, Broken, etc.)
            $asset->status_id = $request->status_id;
            $asset->assigned_to = null; // Xóa người giữ
            $asset->assigned_type = null;
            $asset->save();

            Log::info('Asset updated', ['asset_id' => $asset->id, 'status_id' => $asset->status_id]);

            // 2. Ghi log AssetHistory
            $history = AssetHistory::create([
                'asset_id' => $asset->id,
                'user_id' => $previousUser, // Người trả
                'action_type' => 'checkin',
                'note' => $request->note, // Fix: note instead of notes
            ]);

            Log::info('AssetHistory created', ['history_id' => $history->id]);

            DB::commit();

            return response()->json([
                'message' => 'Thu hồi tài sản thành công!',
                'data' => $asset->load(['statusLabel'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkin Failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Lỗi thu hồi: ' . $e->getMessage()
            ], 500);
        }
    }
}
