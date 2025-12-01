<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DeviceModelResource extends JsonResource
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
            'name' => $this->name,
            'model_number' => $this->model_number,
            'manufacturer' => new ManufacturerResource($this->whenLoaded('manufacturer')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'image_url' => $this->image ? Storage::url($this->image) : null,
            'assets_count' => $this->whenCounted('assets'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
