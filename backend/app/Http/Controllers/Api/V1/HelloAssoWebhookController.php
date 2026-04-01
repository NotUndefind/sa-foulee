<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BudgetEntry;
use App\Models\HelloAssoWebhook;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * POST /api/v1/webhooks/helloasso
 *
 * Reçoit les notifications de paiement HelloAsso et :
 *  1. Logue le webhook (toujours)
 *  2. Vérifie l'idempotence (même email, même année civile)
 *  3. Met à jour membership_paid_at / membership_paid_amount sur l'user
 *  4. Crée une budget_entry (recette / cotisation)
 *
 * Format attendu du corps JSON HelloAsso :
 * {
 *   "eventType": "Payment",
 *   "data": {
 *     "payer": { "email": "…", "firstName": "…", "lastName": "…" },
 *     "amount": 3000,          // en centimes
 *     "date": "2024-01-15T10:30:00+00:00",
 *     "order": { "id": 12345, "formSlug": "adhesion-2024-2025" }
 *   }
 * }
 */
class HelloAssoWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $data = json_decode($payload, true);

        $eventType = $data['eventType'] ?? null;
        $payerEmail = strtolower(trim($data['data']['payer']['email'] ?? ''));
        $amountCents = (int) ($data['data']['amount'] ?? 0);
        $amountEuros = $amountCents > 0 ? round($amountCents / 100, 2) : null;
        $orderId = (string) ($data['data']['order']['id'] ?? '');
        $paidAt = isset($data['data']['date'])
            ? Carbon::parse($data['data']['date'])
            : now();

        // ── 1. Log systématique ─────────────────────────────────────────────
        $log = HelloAssoWebhook::create([
            'event_type' => $eventType ?? 'unknown',
            'payer_email' => $payerEmail ?: null,
            'amount' => $amountEuros,
            'order_id' => $orderId ?: null,
            'status' => 'error', // sera mis à jour
            'payload' => $payload,
            'notes' => null,
        ]);

        // ── Validation minimale ─────────────────────────────────────────────
        if ($eventType !== 'Payment' || empty($payerEmail)) {
            $log->update([
                'status' => 'skipped',
                'notes' => "Ignoré : eventType={$eventType}, email vide ou absent.",
            ]);

            return response()->json(['message' => 'Webhook ignoré.'], 200);
        }

        // ── 2. Rechercher l'utilisateur ─────────────────────────────────────
        $user = User::where('email', $payerEmail)->first();

        if (! $user) {
            $log->update([
                'status' => 'user_not_found',
                'notes' => "Aucun compte trouvé pour {$payerEmail}.",
            ]);
            Log::info("HelloAsso webhook: user not found for {$payerEmail}");

            return response()->json(['message' => 'Utilisateur introuvable — webhook loggé.'], 200);
        }

        // ── 3. Idempotence — même email, même année civile ──────────────────
        $year = $paidAt->year;

        $alreadyProcessed = HelloAssoWebhook::where('payer_email', $payerEmail)
            ->where('status', 'processed')
            ->whereYear('created_at', $year)
            ->exists();

        if ($alreadyProcessed) {
            $log->update([
                'status' => 'skipped',
                'notes' => "Idempotence : cotisation {$year} déjà enregistrée pour {$payerEmail}.",
            ]);

            return response()->json(['message' => 'Déjà traité.'], 200);
        }

        // ── 4. Mise à jour cotisation + création budget_entry ───────────────
        DB::transaction(function () use ($user, $paidAt, $amountEuros, $orderId, $log) {
            $user->update([
                'membership_paid_at' => $paidAt,
                'membership_paid_amount' => $amountEuros,
            ]);

            BudgetEntry::create([
                'type' => 'recette',
                'category' => 'cotisation',
                'amount' => $amountEuros ?? 0,
                'description' => "Cotisation HelloAsso — {$user->first_name} {$user->last_name}",
                'entry_date' => $paidAt->toDateString(),
                'user_id' => $user->id,
                'created_by' => null, // automatique, pas d'opérateur humain
                'source' => 'helloasso',
                'external_ref' => $orderId ?: null,
            ]);

            $log->update(['status' => 'processed', 'notes' => "Cotisation mise à jour pour user #{$user->id}."]);
        });

        return response()->json(['message' => 'Cotisation mise à jour.'], 200);
    }
}
