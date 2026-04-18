<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BudgetEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BudgetEntryController extends Controller
{
    /**
     * GET /api/v1/budget
     * Liste paginée avec filtres optionnels : type, category, from, to.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['nullable', 'string', 'in:recette,depense'],
            'category' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $query = BudgetEntry::with('creator:id,first_name,last_name')
            ->orderBy('entry_date', 'desc')
            ->orderBy('id', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('from')) {
            $query->whereDate('entry_date', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('entry_date', '<=', $request->input('to'));
        }

        $perPage = (int) $request->input('per_page', 50);
        $entries = $query->paginate($perPage);

        return response()->json([
            'data' => $entries->map(fn ($e) => $this->format($e)),
            'meta' => [
                'total' => $entries->total(),
                'per_page' => $entries->perPage(),
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/budget
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:recette,depense'],
            'category' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:2000'],
            'entry_date' => ['required', 'date'],
            'receipt_url' => ['nullable', 'url', 'max:500'],
        ]);

        $entry = BudgetEntry::create([
            ...$data,
            'source' => 'manual',
            'created_by' => $request->user()->id,
        ]);

        $entry->load('creator:id,first_name,last_name');

        return response()->json($this->format($entry), 201);
    }

    /**
     * PATCH /api/v1/budget/{entry}
     */
    public function update(Request $request, BudgetEntry $entry): JsonResponse
    {
        $data = $request->validate([
            'type' => ['sometimes', 'string', 'in:recette,depense'],
            'category' => ['sometimes', 'string', 'max:100'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:2000'],
            'entry_date' => ['sometimes', 'date'],
            'receipt_url' => ['nullable', 'url', 'max:500'],
        ]);

        $entry->update($data);
        $entry->load('creator:id,first_name,last_name');

        return response()->json($this->format($entry->fresh(['creator'])));
    }

    /**
     * DELETE /api/v1/budget/{entry}
     * Admin|Founder uniquement (géré par la route middleware).
     */
    public function destroy(BudgetEntry $entry): JsonResponse
    {
        $entry->delete();

        return response()->json(['message' => 'Entrée budgétaire supprimée.']);
    }

    /**
     * GET /api/v1/budget/summary
     * Solde global + total recettes/dépenses + répartition sur les 12 derniers mois.
     */
    public function summary(): JsonResponse
    {
        $totalRecettes = BudgetEntry::where('type', 'recette')->sum('amount');
        $totalDepenses = BudgetEntry::where('type', 'depense')->sum('amount');

        // Aggrégats mensuels sur 12 mois glissants
        $monthly = BudgetEntry::selectRaw(
            "DATE_FORMAT(entry_date, '%Y-%m') as month, type, SUM(amount) as total"
        )
            ->where('entry_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month', 'type')
            ->orderBy('month')
            ->get();

        // Structurer en tableau [{ month, recettes, depenses, solde }]
        $months = [];
        foreach ($monthly as $row) {
            $m = $row->month;
            if (! isset($months[$m])) {
                $months[$m] = ['month' => $m, 'recettes' => 0.0, 'depenses' => 0.0];
            }
            $months[$m][$row->type === 'recette' ? 'recettes' : 'depenses'] = (float) $row->total;
        }

        $monthlyFormatted = array_values(array_map(function ($m) {
            $m['solde'] = round($m['recettes'] - $m['depenses'], 2);

            return $m;
        }, $months));

        // Catégories les plus utilisées (top 5 dépenses)
        $topCategories = BudgetEntry::where('type', 'depense')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($r) => ['category' => $r->category, 'total' => (float) $r->total]);

        return response()->json([
            'solde' => round((float) $totalRecettes - (float) $totalDepenses, 2),
            'total_recettes' => (float) $totalRecettes,
            'total_depenses' => (float) $totalDepenses,
            'monthly' => $monthlyFormatted,
            'top_categories' => $topCategories,
        ]);
    }

    /**
     * GET /api/v1/budget/export
     * Export CSV avec BOM UTF-8 (compatible Excel FR).
     */
    public function export(Request $request): Response
    {
        $request->validate([
            'type' => ['nullable', 'string', 'in:recette,depense'],
            'category' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = BudgetEntry::with('creator:id,first_name,last_name')
            ->orderBy('entry_date', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }
        if ($request->filled('from')) {
            $query->whereDate('entry_date', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('entry_date', '<=', $request->input('to'));
        }

        $entries = $query->get();

        // Nom du fichier avec les dates de la période
        $fromLabel = $request->filled('from') ? $request->input('from') : 'debut';
        $toLabel = $request->filled('to') ? $request->input('to') : now()->format('Y-m-d');
        $filename = "budget-safoulee-{$fromLabel}-{$toLabel}.csv";

        $bom = "\xEF\xBB\xBF";
        $lines = [$bom.'Date,Type,Catégorie,Description,Recette (€),Dépense (€),Justificatif,Saisi par'];

        $totalRecettes = 0.0;
        $totalDepenses = 0.0;

        foreach ($entries as $e) {
            $amount = (float) $e->amount;
            $isRecette = $e->type === 'recette';

            if ($isRecette) {
                $totalRecettes += $amount;
            } else {
                $totalDepenses += $amount;
            }

            $lines[] = implode(',', [
                '"'.$e->entry_date->format('d/m/Y').'"',
                '"'.$e->type.'"',
                '"'.str_replace('"', '""', $e->category).'"',
                '"'.str_replace('"', '""', $e->description ?? '').'"',
                $isRecette ? number_format($amount, 2, ',', ' ') : '',
                $isRecette ? '' : number_format($amount, 2, ',', ' '),
                '"'.str_replace('"', '""', $e->receipt_url ?? '').'"',
                '"'.($e->creator ? "{$e->creator->first_name} {$e->creator->last_name}" : '').'"',
            ]);
        }

        // Ligne de totaux
        $solde = $totalRecettes - $totalDepenses;
        $lines[] = '';
        $lines[] = implode(',', [
            '"TOTAUX"',
            '""',
            '""',
            '""',
            number_format($totalRecettes, 2, ',', ' '),
            number_format($totalDepenses, 2, ',', ' '),
            '""',
            '""',
        ]);
        $lines[] = implode(',', [
            '"SOLDE"',
            '""',
            '""',
            '""',
            $solde >= 0 ? number_format($solde, 2, ',', ' ') : '',
            $solde < 0 ? number_format(abs($solde), 2, ',', ' ') : '',
            '""',
            '""',
        ]);

        return response(implode("\n", $lines), 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ---- Helper ----

    private function format(BudgetEntry $e): array
    {
        return [
            'id' => $e->id,
            'type' => $e->type,
            'category' => $e->category,
            'amount' => (float) $e->amount,
            'description' => $e->description,
            'entry_date' => $e->entry_date?->format('Y-m-d'),
            'receipt_url' => $e->receipt_url,
            'source' => $e->source,
            'created_by' => $e->creator ? [
                'id' => $e->creator->id,
                'first_name' => $e->creator->first_name,
                'last_name' => $e->creator->last_name,
            ] : null,
            'created_at' => $e->created_at,
        ];
    }
}
