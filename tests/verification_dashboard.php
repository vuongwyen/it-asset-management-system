<?php

use App\Models\User;
use App\Models\Asset;
use App\Models\License;
use App\Models\StatusLabel;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Verification for Dashboard Stats...\n";

try {
    // 1. Setup Data (Ensure some data exists)
    if (Asset::count() == 0) {
        echo "Creating dummy asset...\n";
        Asset::factory()->create();
    }
    if (License::count() == 0) {
        echo "Creating dummy license...\n";
        // Create manually if factory doesn't exist
        DB::table('licenses')->insert([
            'software_name' => 'Test Software',
            'seats' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // 2. Call Controller
    $controller = new \App\Http\Controllers\Api\DashboardController();
    $response = $controller->stats();

    echo "Response Status: " . $response->getStatusCode() . "\n";

    if ($response->getStatusCode() !== 200) {
        throw new Exception("Stats failed: " . $response->getContent());
    }

    $data = json_decode($response->getContent(), true);

    echo "Total Assets: " . $data['total_assets'] . "\n";
    echo "Total Cost: " . $data['total_cost'] . "\n";
    echo "Total Licenses: " . $data['total_licenses'] . "\n";

    echo "Assets by Status:\n";
    foreach ($data['assets_by_status'] as $status) {
        echo " - " . $status['status'] . ": " . $status['count'] . "\n";
    }

    echo "Recent Activity Count: " . count($data['recent_activity']) . "\n";

    if ($data['total_assets'] >= 0 && is_numeric($data['total_cost'])) {
        echo "SUCCESS: Data structure looks correct.\n";
    } else {
        echo "FAILURE: Data structure incorrect.\n";
    }
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
