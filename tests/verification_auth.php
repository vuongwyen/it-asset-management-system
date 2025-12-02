<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Verification for Sanctum Auth...\n";

try {
    // 1. Setup User
    $email = 'auth_test_' . uniqid() . '@example.com';
    $password = 'password123';
    $user = User::create([
        'name' => 'Auth Test User',
        'email' => $email,
        'password' => Hash::make($password),
    ]);
    echo "Created User: {$email}\n";

    // 2. Test Login (Success)
    echo "Testing Login (Success)...\n";
    $loginData = ['email' => $email, 'password' => $password];

    $controller = new \App\Http\Controllers\Api\AuthController();
    $request = new \Illuminate\Http\Request();
    $request->merge($loginData);

    // Manually set container if needed, but for standard request usually not needed if not using validate()
    // However, we are using Validator facade in controller now, so it should be fine.

    $response = $controller->login($request);
    echo "Login Response: " . $response->getStatusCode() . "\n";

    if ($response->getStatusCode() !== 200) {
        throw new Exception("Login failed: " . $response->getContent());
    }

    $content = json_decode($response->getContent(), true);
    $token = $content['access_token'];
    echo "Token received: " . substr($token, 0, 10) . "...\n";

    // 3. Test Login (Failure)
    echo "Testing Login (Failure)...\n";
    $failData = ['email' => $email, 'password' => 'wrongpassword'];
    $request = new \Illuminate\Http\Request(); // New request
    $request->merge($failData);

    $response = $controller->login($request);
    echo "Fail Login Response: " . $response->getStatusCode() . "\n";

    if ($response->getStatusCode() !== 401 && $response->getStatusCode() !== 422) {
        echo "FAILURE: Expected 401 or 422, got " . $response->getStatusCode() . "\n";
    } else {
        echo "SUCCESS: Got expected error status.\n";
    }

    // 4. Test Me (Protected)
    // We verify token creation in DB as a proxy for successful login
    if ($user->tokens()->count() > 0) {
        echo "SUCCESS: Token exists in database.\n";
    } else {
        echo "FAILURE: No token found in database.\n";
    }

    // 5. Test Logout
    echo "Testing Logout...\n";

    // Mocking authenticated user for logout
    Auth::setUser($user);
    $accessToken = $user->tokens()->first();
    $user->withAccessToken($accessToken);

    // Create a new request for logout and set user resolver
    $logoutRequest = new \Illuminate\Http\Request();
    $logoutRequest->setUserResolver(function () use ($user) {
        return $user;
    });

    $response = $controller->logout($logoutRequest);
    echo "Logout Response: " . $response->getStatusCode() . "\n";

    if ($user->tokens()->count() === 0) {
        echo "SUCCESS: Token deleted from database.\n";
    } else {
        echo "FAILURE: Token still exists in database.\n";
    }
} catch (\Exception $e) {
    $log = "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString();
    echo $log;
    file_put_contents(__DIR__ . '/output_auth.log', $log, FILE_APPEND);
}
