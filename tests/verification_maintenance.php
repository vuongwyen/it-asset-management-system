<?php

use App\Models\User;
use App\Models\Asset;
use App\Models\StatusLabel;
use App\Models\Category;
use App\Models\DeviceModel;
use App\Models\Manufacturer;
use App\Models\Supplier;
use App\Models\Maintenance;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Verification for Maintenance Module...\n";

try {
    // 1. Setup Data
    $statusReady = StatusLabel::firstOrCreate(['name' => 'Ready to Deploy', 'type' => 'deployable']);
    $supplier = Supplier::firstOrCreate(['name' => 'Test Supplier'], ['url' => 'http://supplier.com', 'support_url' => 'http://supplier.com/support', 'support_phone' => '123', 'support_email' => 's@s.com']);

    $category = Category::firstOrCreate(['name' => 'Test Category'], ['type' => 'asset']);
    $manufacturer = Manufacturer::firstOrCreate(['name' => 'Test Manufacturer'], ['support_url' => 'http://example.com']);
    $model = DeviceModel::firstOrCreate(['name' => 'Test Model'], ['model_number' => 'TM-100', 'manufacturer_id' => $manufacturer->id, 'category_id' => $category->id]);

    $asset = Asset::create([
        'asset_tag' => 'M-TAG-' . uniqid(),
        'serial' => 'M-SN-' . uniqid(),
        'model_id' => $model->id,
        'status_id' => $statusReady->id,
        'supplier_id' => $supplier->id,
    ]);

    echo "Created Asset: {$asset->id} (Status: {$asset->status_id})\n";

    // 2. Test Store (Start Maintenance)
    echo "Testing Store Maintenance...\n";
    $storeData = [
        'asset_id' => $asset->id,
        'supplier_id' => $supplier->id,
        'start_date' => date('Y-m-d'),
        'notes' => 'Screen repair',
        'cost' => 100,
    ];

    $controller = new \App\Http\Controllers\Api\MaintenanceController();
    $request = new \App\Http\Requests\StoreMaintenanceRequest();
    $request->merge($storeData);
    $request->setContainer($app);
    $request->setRedirector($app->make(Illuminate\Routing\Redirector::class));
    $request->validateResolved();

    $response = $controller->store($request);
    echo "Store Response: " . $response->getStatusCode() . "\n";

    if ($response->getStatusCode() !== 201) {
        throw new Exception("Store failed: " . $response->getContent());
    }

    $maintenanceData = json_decode($response->getContent(), true)['data'];
    $maintenanceId = $maintenanceData['id'];

    // Verify Asset Status -> In Maintenance
    $asset->refresh();
    $statusMaintenance = StatusLabel::where('name', 'In Maintenance')->first();
    if ($asset->status_id == $statusMaintenance->id) {
        echo "SUCCESS: Asset status updated to 'In Maintenance'.\n";
    } else {
        echo "FAILURE: Asset status is {$asset->status_id}, expected {$statusMaintenance->id}\n";
    }

    // 3. Test Update (Complete Maintenance)
    echo "Testing Update Maintenance (Completion)...\n";
    $updateData = [
        'completion_date' => date('Y-m-d'),
        'notes' => 'Screen repair completed',
    ];

    $updateRequest = new \App\Http\Requests\UpdateMaintenanceRequest();
    $updateRequest->merge($updateData);
    $updateRequest->setContainer($app);
    $updateRequest->setRedirector($app->make(Illuminate\Routing\Redirector::class));
    $updateRequest->validateResolved();

    $response = $controller->update($updateRequest, $maintenanceId);
    echo "Update Response: " . $response->getStatusCode() . "\n";

    if ($response->getStatusCode() !== 200) {
        throw new Exception("Update failed: " . $response->getContent());
    }

    // Verify Asset Status -> Ready to Deploy
    $asset->refresh();
    if ($asset->status_id == $statusReady->id) {
        echo "SUCCESS: Asset status updated to 'Ready to Deploy'.\n";
    } else {
        echo "FAILURE: Asset status is {$asset->status_id}, expected {$statusReady->id}\n";
    }
} catch (\Exception $e) {
    $log = "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString();
    echo $log;
    file_put_contents(__DIR__ . '/output_maint.log', $log, FILE_APPEND);
}
