<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * GET /api/v1/settings/public
     * Settings publics (sans auth) — utilisés par le frontend pour l'affichage conditionnel.
     */
    public function public(): JsonResponse
    {
        $settings = Setting::where('is_public', true)->get(['key', 'value']);

        return response()->json(
            $settings->pluck('value', 'key')
        )->header('Cache-Control', 'public, max-age=60');
    }

    /**
     * GET /api/v1/admin/settings
     * Tous les settings — réservé admin/founder.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all(['key', 'value', 'is_public', 'updated_by', 'updated_at']);

        return response()->json($settings->map(fn($s) => [
            'key'        => $s->key,
            'value'      => $s->value,
            'is_public'  => $s->is_public,
            'updated_by' => $s->updated_by,
            'updated_at' => $s->updated_at?->toIso8601String(),
        ]));
    }

    /**
     * PATCH /api/v1/admin/settings/{key}
     * Modifier un setting — réservé admin/founder.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $request->validate([
            'value' => ['required', 'string', 'max:500'],
        ]);

        Setting::set($key, $request->input('value'), $request->user()->id);

        return response()->json([
            'key'   => $key,
            'value' => Setting::get($key),
        ]);
    }
}
