<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StatusLabel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StatusLabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        StatusLabel::truncate();
        Schema::enableForeignKeyConstraints();

        $statuses = [
            [
                'name' => 'Sẵn sàng sử dụng',
                'type' => 'deployable',
            ],
            [
                'name' => 'Đang sử dụng',
                'type' => 'deployable',
            ],
            [
                'name' => 'Đang sửa chữa/Hỏng',
                'type' => 'pending',
            ],
            [
                'name' => 'Đã thanh lý/Mất',
                'type' => 'archived',
            ],
        ];

        foreach ($statuses as $status) {
            StatusLabel::create($status);
        }
    }
}
