<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodingController extends Controller
{
    public function geocode(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'max:500']]);

        $response = Http::withHeaders([
            'User-Agent' => 'SpeedService/1.0 (fouadechitou@gmail.com)',
            'Accept-Language' => 'fr',
        ])->get('https://nominatim.openstreetmap.org/search', [
            'q'              => $request->q,
            'format'         => 'json',
            'limit'          => 5,
            'countrycodes'   => 'bj',
            'addressdetails' => 0,
        ]);

        if ($response->failed()) {
            return response()->json(['message' => 'Erreur de géocodage.'], 502);
        }

        $results = collect($response->json())->map(fn ($r) => [
            'lat'          => (float) $r['lat'],
            'lon'          => (float) $r['lon'],
            'display_name' => $r['display_name'],
        ])->values();

        return response()->json($results);
    }

    public function distance(Request $request): JsonResponse
    {
        $request->validate([
            'pickup_lat'    => ['required', 'numeric', 'between:-90,90'],
            'pickup_lon'    => ['required', 'numeric', 'between:-180,180'],
            'delivery_lat'  => ['required', 'numeric', 'between:-90,90'],
            'delivery_lon'  => ['required', 'numeric', 'between:-180,180'],
        ]);

        $km = $this->haversine(
            $request->pickup_lat, $request->pickup_lon,
            $request->delivery_lat, $request->delivery_lon,
        );

        return response()->json([
            'distance_km'       => round($km, 2),
            'distance_road_km'  => round($km * 1.3, 2),
        ]);
    }

    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
