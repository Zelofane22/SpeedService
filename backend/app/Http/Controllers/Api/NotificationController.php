<?php

namespace App\Http\Controllers\Api;

use App\Enums\NotificationChannel;
use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $query = NotificationLog::where('user_id', Auth::id())
            ->where('channel', NotificationChannel::InApp)
            ->latest();

        return response()->json([
            'unread_count' => (clone $query)->whereNull('read_at')->count(),
            'notifications' => $query->limit(30)->get(),
        ]);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $notification = NotificationLog::where('user_id', Auth::id())
            ->where('channel', NotificationChannel::InApp)
            ->findOrFail($id);

        $notification->update(['read_at' => $notification->read_at ?? now()]);

        return response()->json($notification);
    }

    public function markAllAsRead(): JsonResponse
    {
        NotificationLog::where('user_id', Auth::id())
            ->where('channel', NotificationChannel::InApp)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}
