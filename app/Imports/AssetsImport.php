<?php

namespace App\Imports;

use App\Models\Asset;
use App\Models\DeviceModel;
use App\Models\StatusLabel;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Illuminate\Validation\Rule;
use Exception;

class AssetsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // 1. Find Model ID
        $model = DeviceModel::where('name', $row['model_name'])->first();
        if (!$model) {
            // We can throw an exception to be caught by the validator or handle it as a failure
            // Since ToModel doesn't easily support custom validation errors for logic like this without
            // using WithValidation's 'exists' rule (which checks ID, not name lookup), 
            // we'll throw an exception which will be treated as a failure if not caught, 
            // but SkipsOnFailure might not catch generic Exceptions in model().
            // Better approach: Use 'exists' in rules() if possible, but we are looking up by name.
            // So we will manually fail.
            throw new Exception("Model '{$row['model_name']}' không tồn tại.");
        }

        // 2. Find Status ID
        $status = StatusLabel::where('name', $row['status_name'])->first();
        if (!$status) {
            throw new Exception("Status '{$row['status_name']}' không tồn tại.");
        }

        return new Asset([
            'asset_tag'     => $row['asset_tag'],
            'serial'        => $row['serial'],
            'model_id'      => $model->id,
            'status_id'     => $status->id,
            'purchase_cost' => $row['purchase_cost'],
            'purchase_date' => \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['purchase_date']),
        ]);
    }

    public function rules(): array
    {
        return [
            'asset_tag' => 'required|unique:assets,asset_tag',
            'serial'    => 'required|unique:assets,serial',
            'model_name' => 'required',
            'status_name' => 'required',
            'purchase_cost' => 'numeric|nullable',
            'purchase_date' => 'required',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'asset_tag.unique' => 'Asset Tag đã tồn tại.',
            'serial.unique' => 'Serial đã tồn tại.',
            'model_name.required' => 'Tên Model là bắt buộc.',
            'status_name.required' => 'Tên Status là bắt buộc.',
        ];
    }
}
