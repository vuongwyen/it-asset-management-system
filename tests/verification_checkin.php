<?php

use App\Models\User;
use App\Models\Asset;
use App\Models\StatusLabel;
use App\Models\Category;
use App\Models\DeviceModel;
use App\Models\Manufacturer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Verification for Asset Check-in...\n";

try {
    // 1. Setup Data
    // Create User
    $user = User::firstOrCreate(
        ['email' => 'test_checkin@example.com'],
        ['name' => 'Test User', 'password' => Hash::make('password')]
    );

    // Create Status Labels
    $statusReady = StatusLabel::firstOrCreate(['name' => 'Ready to Deploy', 'type' => 'deployable']);
    $statusDeployed = StatusLabel::firstOrCreate(['name' => 'Deployed', 'type' => 'deployable']);

    // Create Category
    $category = Category::firstOrCreate(
        ['name' => 'Test Category'],
        ['type' => 'asset']
    );

    // Create Manufacturer
    $manufacturer = Manufacturer::firstOrCreate(
        ['name' => 'Test Manufacturer'],
        ['support_url' => 'http://example.com/support']
    );

    // Create Device Model
    $model = DeviceModel::firstOrCreate(
        ['name' => 'Test Model'],
        [
            'model_number' => 'TM-100',
            'manufacturer_id' => $manufacturer->id,
            'category_id' => $category->id
        ]
    );

    // Create Asset
    $asset = Asset::create([
        'asset_tag' => 'TAG-' . uniqid(),
        'serial' => 'SN-' . uniqid(),
        'model_id' => $model->id,
        'status_id' => $statusDeployed->id,
        'assigned_to' => $user->id,
        'assigned_type' => User::class,
    ]);

    echo "Created Asset: {$asset->id} assigned to User: {$user->id}\n";

    // 2. Simulate Request
    $requestData = [
        'asset_id' => $asset->id,
        'status_id' => $statusReady->id,
        'note' => 'Returning asset for testing',
    ];

    echo "Simulating Check-in Request...\n";

    $controller = new \App\Http\Controllers\Api\AssetTransactionController();
    $request = new \App\Http\Requests\CheckinAssetRequest();
    $request->merge($requestData);
    $request->setContainer($app);
    $request->setRedirector($app->make(Illuminate\Routing\Redirector::class));

    // Manually validate
    $validator = Illuminate\Support\Facades\Validator::make($requestData, $request->rules());
    if ($validator->fails()) {
        echo "VALIDATION FAILED:\n";
        print_r($validator->errors()->all());
        exit(1);
    }

    $response = $controller->checkin($request);
    echo "Response Status: " . $response->getStatusCode() . "\n";

    $content = $response->getContent();
    echo "Response Content: " . $content . "\n";
    file_put_contents(__DIR__ . '/output.log', "Response Content: " . $content . "\n", FILE_APPEND);

    if ($response->getStatusCode() !== 200) {
        throw new Exception("Response status is not 200");
    }

    // 3. Verify DB
    $updatedAsset = Asset::find($asset->id);
    if ($updatedAsset->assigned_to === null && $updatedAsset->status_id == $statusReady->id) {
        echo "SUCCESS: Asset assigned_to is null and status updated.\n";
    } else {
        echo "FAILURE: Asset state incorrect. Assigned: {$updatedAsset->assigned_to}, Status: {$updatedAsset->status_id}\n";
    }

    $history = \App\Models\AssetHistory::where('asset_id', $asset->id)->where('action_type', 'checkin')->latest()->first();
    if ($history && $history->user_id == $user->id) {
        echo "SUCCESS: Asset History created correctly.\n";
    } else {
        echo "FAILURE: Asset History missing or incorrect.\n";
    }
} catch (\Exception $e) {
    $log = "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString();
    echo $log;
    file_put_contents(__DIR__ . '/output.log', $log, FILE_APPEND);
}
