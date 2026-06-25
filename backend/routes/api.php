<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DriverApplicationController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\GeocodingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/status', function () {
    return response()->json(['status' => 'ok']);
});

// Geo (public — no sensitive data)
Route::prefix('geo')->group(function () {
    Route::get('/geocode', [GeocodingController::class, 'geocode']);
    Route::post('/distance', [GeocodingController::class, 'distance']);
});

// Driver application tunnel (public — no account required to apply)
Route::prefix('driver/apply')->group(function () {
    Route::post('/', [DriverApplicationController::class, 'apply']);
    Route::post('/documents', [DriverApplicationController::class, 'uploadDocuments']);
    Route::get('/status', [DriverApplicationController::class, 'status']);
    Route::post('/complement', [DriverApplicationController::class, 'complement']);
});

// Auth (public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile/change-password', [ProfileController::class, 'changePassword']);

    Route::get('/deliveries', [DeliveryController::class, 'index']);
    Route::post('/deliveries', [DeliveryController::class, 'store']);
    Route::get('/deliveries/{id}', [DeliveryController::class, 'show']);
    Route::post('/deliveries/{id}/cancel', [DeliveryController::class, 'cancel']);
    Route::post('/deliveries/{id}/pay', [PaymentController::class, 'pay']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Driver routes
    Route::prefix('driver')->group(function () {
        Route::get('/missions/available', [DriverController::class, 'availableMissions']);
        Route::get('/missions', [DriverController::class, 'myMissions']);
        Route::post('/missions/{id}/accept', [DriverController::class, 'acceptMission']);
        Route::post('/missions/{id}/decline', [DriverController::class, 'declineMission']);
        Route::patch('/missions/{id}/status', [DriverController::class, 'updateStatus']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'listUsers']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::patch('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::get('/deliveries', [AdminController::class, 'listDeliveries']);
        Route::get('/deliveries/{id}', [AdminController::class, 'showDelivery']);
        Route::patch('/deliveries/{id}/status', [AdminController::class, 'updateDeliveryStatus']);
        Route::post('/deliveries/{id}/validate-payment', [AdminController::class, 'validatePayment']);
        Route::get('/drivers', [AdminController::class, 'listDrivers']);
        Route::patch('/drivers/{id}/toggle-active', [AdminController::class, 'toggleDriverStatus']);
        Route::get('/reports', [AdminController::class, 'reports']);

        // Driver application management
        Route::prefix('drivers/applications')->group(function () {
            Route::get('/', [DriverApplicationController::class, 'adminList']);
            Route::get('/{id}', [DriverApplicationController::class, 'adminShow']);
            Route::patch('/{id}/review', [DriverApplicationController::class, 'adminReview']);
        });
    });
});
