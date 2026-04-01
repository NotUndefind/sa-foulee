<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Performance;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * GET /api/v1/stats/homepage
     * Stats publiques pour la page d'accueil (sans auth, cache 5 min).
     */
    public function homepage(): JsonResponse
    {
        // SoftDeletes gère whereNull('deleted_at') — pas de colonne blocked_at dans ce schéma
        $memberCount = User::count();

        $totalKm = (float) Performance::sum('distance_km');

        return response()->json([
            'member_count' => $memberCount,
            'total_km' => $totalKm > 0 ? round($totalKm) : 50,
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
