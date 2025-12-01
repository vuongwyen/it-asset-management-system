<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusLabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['name' => 'Ready to Deploy', 'type' => 'deployable'],
            ['name' => 'Pending', 'type' => 'pending'],
            ['name' => 'Archived', 'type' => 'archived'],
            ['name' => 'Broken', 'type' => 'pending'],
            ['name' => 'Lost', 'type' => 'archived'],
        ];

        foreach ($statuses as $status) {
            \App\Models\StatusLabel::create($status);
        }
    }
}
