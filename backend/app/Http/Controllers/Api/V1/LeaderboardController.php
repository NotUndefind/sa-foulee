<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    /**
     * Classement des membres par distance totale.
     *
     * Query param: period = week | month | season (défaut: month)
     */
    public function index(Request $request): JsonResponse
    {
        if (! Setting::getBool('leaderboard_enabled', true)) {
            return response()->json(['message' => 'Fonctionnalité désactivée par l\'administrateur.'], 403);
        }

        $period = $request->input('period', 'month');

        // Clé de cache par période (5 min)
        $cacheKey = "leaderboard:{$period}";

        $entries = Cache::remember($cacheKey, 300, function () use ($period) {
            $startDate = match ($period) {
                'week' => now()->startOfWeek(),
                'season' => now()->month >= 9
                    ? now()->startOfYear()->setMonth(9)->startOfDay()  // Septembre de l'année courante
                    : now()->subYear()->setMonth(9)->startOfDay(),     // Septembre de l'année précédente
                default => now()->startOfMonth(), // month
            };

            return DB::table('performances')
                ->join('users', 'performances.user_id', '=', 'users.id')
                ->whereNull('users.deleted_at')
                ->where('performances.date', '>=', $startDate)
                ->select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    DB::raw('SUM(performances.distance_km) as total_distance_km'),
                    DB::raw('COUNT(performances.id) as total_sessions'),
                )
                ->groupBy('users.id', 'users.first_name', 'users.last_name')
                ->orderByDesc('total_distance_km')
                ->limit(50)
                ->get()
                ->map(function ($row, int $index) {
                    return [
                        'rank' => $index + 1,
                        'user' => [
                            'id' => $row->id,
                            'name' => "{$row->first_name} {$row->last_name}",
                        ],
                        'total_distance_km' => round((float) $row->total_distance_km, 2),
                        'total_sessions' => (int) $row->total_sessions,
                    ];
                })
                ->values()
                ->toArray();
        });

        return response()->json([
            'data' => $entries,
            'period' => $period,
        ]);
    }
}
