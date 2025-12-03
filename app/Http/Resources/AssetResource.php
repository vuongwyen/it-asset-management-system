<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AssetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_tag' => $this->asset_tag,
            'serial' => $this->serial,
            'model' => new DeviceModelResource($this->whenLoaded('model')),
            'status_label' => new StatusLabelResource($this->whenLoaded('statusLabel')),
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'purchase_date' => $this->purchase_date,
            'purchase_cost' => $this->purchase_cost,
            'current_value' => $this->current_value,
            'warranty_months' => $this->warranty_months,
            'image_url' => $this->image ? Storage::url($this->image) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
