<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EquipmentAssignmentController extends Controller
{
    /**
     * POST /api/v1/inventory/{equipment}/assign
     * Attribuer un équipement à un membre.
     */
    public function assign(Request $request, Equipment $equipment): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'notes'   => ['nullable', 'string', 'max:500'],
        ]);

        // Vérifier la disponibilité
        if ($equipment->availableCount() < 1) {
            return response()->json([
                'message' => 'Stock insuffisant — aucune unité disponible pour cet équipement.',
            ], 422);
        }

        $assignment = EquipmentAssignment::create([
            'equipment_id' => $equipment->id,
            'user_id'      => $data['user_id'],
            'assigned_by'  => $request->user()->id,
            'assigned_at'  => now(),
            'notes'        => $data['notes'] ?? null,
        ]);

        $assignment->load([
            'user:id,first_name,last_name,email',
            'assignedBy:id,first_name,last_name',
        ]);

        return response()->json([
            'id'          => $assignment->id,
            'user'        => [
                'id'         => $assignment->user->id,
                'first_name' => $assignment->user->first_name,
                'last_name'  => $assignment->user->last_name,
                'email'      => $assignment->user->email,
            ],
            'assigned_at' => $assignment->assigned_at,
            'notes'       => $assignment->notes,
            'assigned_by' => [
                'id'         => $assignment->assignedBy->id,
                'first_name' => $assignment->assignedBy->first_name,
                'last_name'  => $assignment->assignedBy->last_name,
            ],
        ], 201);
    }

    /**
     * PATCH /api/v1/inventory/assignments/{assignment}/return
     * Marquer un équipement comme rendu.
     */
    public function return(Request $request, EquipmentAssignment $assignment): JsonResponse
    {
        if ($assignment->returned_at !== null) {
            return response()->json(['message' => 'Cet équipement a déjà été rendu.'], 422);
        }

        $assignment->update(['returned_at' => now()]);

        return response()->json([
            'id'          => $assignment->id,
            'returned_at' => $assignment->returned_at,
        ]);
    }
}
