<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Imports\AssetsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls',
        ]);

        try {
            $import = new AssetsImport;
            Excel::import($import, $request->file('file'));

            $failures = $import->failures();

            if ($failures->isNotEmpty()) {
                $errors = [];
                foreach ($failures as $failure) {
                    $errors[] = [
                        'row' => $failure->row(),
                        'attribute' => $failure->attribute(),
                        'errors' => $failure->errors(),
                        'values' => $failure->values(),
                    ];
                }

                return response()->json([
                    'message' => 'Import hoàn tất với một số lỗi.',
                    'errors' => $errors,
                    'count' => 0 // Excel::import doesn't return count directly with ToModel, logic needed if exact count required
                ], 422);
            }

            return response()->json([
                'message' => 'Import tài sản thành công!',
            ]);
        } catch (\Exception $e) {
            Log::error($e);
            return response()->json([
                'message' => 'Có lỗi xảy ra trong quá trình import.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
