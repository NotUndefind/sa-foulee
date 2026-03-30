<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EquipmentController extends Controller
{
    /**
     * GET /api/v1/inventory
     * Liste filtrée (category, status).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipment::with('creator:id,first_name,last_name');

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $equipment = $query->orderBy('name')->get()->map(fn ($e) => $this->format($e));

        return response()->json($equipment);
    }

    /**
     * POST /api/v1/inventory
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:dossard,maillot,matériel,autre'],
            'quantity' => ['required', 'integer', 'min:1'],
            'status'   => ['required', 'string', 'in:good,worn,broken'],
            'notes'    => ['nullable', 'string', 'max:1000'],
        ]);

        $item = Equipment::create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($this->format($item), 201);
    }

    /**
     * GET /api/v1/inventory/{equipment}
     * Détail avec attributions actives + historique.
     */
    public function show(Equipment $equipment): JsonResponse
    {
        $equipment->load([
            'activeAssignments.user:id,first_name,last_name,email',
            'activeAssignments.assignedBy:id,first_name,last_name',
            'assignments.user:id,first_name,last_name,email',
            'assignments.assignedBy:id,first_name,last_name',
        ]);

        return response()->json($this->formatDetail($equipment));
    }

    /**
     * PATCH /api/v1/inventory/{equipment}
     */
    public function update(Request $request, Equipment $equipment): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'in:dossard,maillot,matériel,autre'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'status'   => ['sometimes', 'string', 'in:good,worn,broken'],
            'notes'    => ['nullable', 'string', 'max:1000'],
        ]);

        $equipment->update($data);

        return response()->json($this->format($equipment->fresh()));
    }

    /**
     * DELETE /api/v1/inventory/{equipment}
     * Admin|Founder uniquement (géré par la route middleware).
     */
    public function destroy(Equipment $equipment): JsonResponse
    {
        $equipment->delete();

        return response()->json(['message' => 'Équipement supprimé.']);
    }

    /**
     * GET /api/v1/inventory/export
     * Export CSV avec BOM UTF-8 (compatible Excel FR).
     */
    public function export(): Response
    {
        $items    = Equipment::orderBy('name')->get();
        $date     = now()->format('Y-m-d');
        $filename = "inventaire-safoulee-{$date}.csv";

        $bom   = "\xEF\xBB\xBF";
        $lines = [$bom . 'Nom,Catégorie,Quantité,État,Notes,Date création'];

        foreach ($items as $item) {
            $lines[] = implode(',', [
                '"' . str_replace('"', '""', $item->name)     . '"',
                '"' . $item->category                          . '"',
                $item->quantity,
                '"' . $item->status                            . '"',
                '"' . str_replace('"', '""', $item->notes ?? '') . '"',
                '"' . $item->created_at->format('d/m/Y')       . '"',
            ]);
        }

        return response(implode("\n", $lines), 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ---- Helpers ----

    private function format(Equipment $e): array
    {
        return [
            'id'              => $e->id,
            'name'            => $e->name,
            'category'        => $e->category,
            'quantity'        => $e->quantity,
            'status'          => $e->status,
            'notes'           => $e->notes,
            'assigned_count'  => $e->assignedCount(),
            'available_count' => $e->availableCount(),
            'created_at'      => $e->created_at,
        ];
    }

    private function formatDetail(Equipment $e): array
    {
        return [
            ...$this->format($e),
            'active_assignments'  => $e->activeAssignments->map(fn ($a) => [
                'id'          => $a->id,
                'user'        => $a->user ? ['id' => $a->user->id, 'first_name' => $a->user->first_name, 'last_name' => $a->user->last_name, 'email' => $a->user->email] : null,
                'assigned_at' => $a->assigned_at,
                'notes'       => $a->notes,
                'assigned_by' => $a->assignedBy ? ['id' => $a->assignedBy->id, 'first_name' => $a->assignedBy->first_name, 'last_name' => $a->assignedBy->last_name] : null,
            ]),
            'assignment_history' => $e->assignments->map(fn ($a) => [
                'id'          => $a->id,
                'user'        => $a->user ? ['id' => $a->user->id, 'first_name' => $a->user->first_name, 'last_name' => $a->user->last_name] : null,
                'assigned_at' => $a->assigned_at,
                'returned_at' => $a->returned_at,
                'notes'       => $a->notes,
            ]),
        ];
    }
}
