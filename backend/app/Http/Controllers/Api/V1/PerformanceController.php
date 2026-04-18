<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Performance\StorePerformanceRequest;
use App\Models\Performance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    /**
     * Historique des performances d'un membre.
     * Seul le membre lui-même ou un admin peut les consulter.
     */
    public function index(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id !== $user->id && ! $currentUser->hasAnyRole(['admin', 'founder'])) {
            abort(403);
        }

        $performances = $user->performances()
            ->orderByDesc('date')
            ->paginate(20);

        $totalDistance = $user->performances()->sum('distance_km');
        $totalSessions = $user->performances()->count();

        return response()->json([
            'data' => $performances->map(fn (Performance $p) => $this->formatPerformance($p)),
            'meta' => [
                'current_page' => $performances->currentPage(),
                'last_page' => $performances->lastPage(),
                'total' => $performances->total(),
                'total_distance' => round((float) $totalDistance, 2),
                'total_sessions' => $totalSessions,
            ],
        ]);
    }

    /**
     * Saisie manuelle d'une performance.
     */
    public function store(StorePerformanceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['source'] = 'manual';

        $performance = Performance::create($data);

        return response()->json($this->formatPerformance($performance), 201);
    }

    // -------------------------------------------------------------------------

    private function formatPerformance(Performance $p): array
    {
        return [
            'id' => $p->id,
            'user_id' => $p->user_id,
            'distance_km' => (float) $p->distance_km,
            'duration_sec' => $p->duration_sec,
            'elevation_m' => $p->elevation_m,
            'date' => $p->date->toDateString(),
            'source' => $p->source,
            'created_at' => $p->created_at->toIso8601String(),
        ];
    }
}
