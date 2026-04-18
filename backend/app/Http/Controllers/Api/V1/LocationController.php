<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Location\StoreLocationRequest;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Liste tous les lieux favoris.
     */
    public function index(): JsonResponse
    {
        $locations = Location::orderBy('name')->get(['id', 'name']);

        return response()->json(['data' => $locations]);
    }

    /**
     * Créer un nouveau lieu.
     */
    public function store(StoreLocationRequest $request): JsonResponse
    {
        $location = Location::create([
            'name' => $request->validated()['name'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['id' => $location->id, 'name' => $location->name], 201);
    }

    /**
     * Supprimer un lieu.
     * Admin/founder peuvent tout supprimer ; un coach ne peut supprimer que le sien.
     */
    public function destroy(Request $request, Location $location): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['admin', 'founder'])
            && ! ($user->hasRole('coach') && $location->created_by === $user->id)) {
            abort(403);
        }

        $location->delete();

        return response()->json(['message' => 'Lieu supprimé.']);
    }
}
