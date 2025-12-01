<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'contact_person' => $this->contact_name, // Đổi tên key cho Frontend dễ hiểu hơn cũng đc
            'phone'         => $this->phone,
            'email'         => $this->email,
            'address'       => $this->address,
            'assets_count'  => $this->assets_count, // (Optional) Đếm xem supplier này cung cấp bao nhiêu máy
        ];
    }
}
