<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Str;
use App\Models\User;

class NewsletterController extends Controller
{
    /**
     * PATCH /api/v1/me/newsletter
     * Toggle l'abonnement newsletter du membre connecté.
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'subscribed' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        if ($request->boolean('subscribed')) {
            $user->update([
                'newsletter_subscribed_at'    => $user->newsletter_subscribed_at ?? now(),
                'newsletter_unsubscribe_token' => $user->newsletter_unsubscribe_token ?? Str::random(64),
            ]);
        } else {
            $user->update([
                'newsletter_subscribed_at'    => null,
                'newsletter_unsubscribe_token' => null,
            ]);
        }

        return response()->json([
            'subscribed'              => $user->fresh()->newsletter_subscribed_at !== null,
            'newsletter_subscribed_at' => $user->fresh()->newsletter_subscribed_at,
        ]);
    }

    /**
     * GET /api/v1/admin/newsletter/subscribers
     * Liste des membres abonnés [Admin|Founder].
     */
    public function subscribers(Request $request): JsonResponse
    {
        $subscribers = User::whereNotNull('newsletter_subscribed_at')
            ->orderBy('newsletter_subscribed_at', 'desc')
            ->get(['id', 'first_name', 'last_name', 'email', 'newsletter_subscribed_at']);

        return response()->json([
            'total'       => $subscribers->count(),
            'subscribers' => $subscribers,
        ]);
    }

    /**
     * POST /api/v1/newsletter/unsubscribe (public, sans auth)
     * Désabonnement via token HMAC depuis le lien email.
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string', 'size:64'],
        ]);

        $token = $request->string('token');

        $user = User::whereNotNull('newsletter_unsubscribe_token')
            ->where('newsletter_unsubscribe_token', $token)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Ce lien n\'est plus valide.'], 404);
        }

        $user->update([
            'newsletter_subscribed_at'    => null,
            'newsletter_unsubscribe_token' => null,
        ]);

        return response()->json(['message' => 'Vous avez été désabonné(e) avec succès.']);
    }

    /**
     * GET /api/v1/admin/newsletter/subscribers/export
     * Export CSV des abonnés [Admin|Founder].
     */
    public function exportSubscribers(Request $request): Response
    {
        $subscribers = User::whereNotNull('newsletter_subscribed_at')
            ->orderBy('newsletter_subscribed_at', 'desc')
            ->get(['first_name', 'last_name', 'email', 'newsletter_subscribed_at']);

        $date     = now()->format('Y-m-d');
        $filename = "newsletter-abonnes-{$date}.csv";

        $lines = ["Prénom,Nom,Email,Date d'abonnement"];
        foreach ($subscribers as $user) {
            $lines[] = implode(',', [
                '"' . $user->first_name . '"',
                '"' . $user->last_name . '"',
                '"' . $user->email . '"',
                '"' . $user->newsletter_subscribed_at->format('d/m/Y H:i') . '"',
            ]);
        }

        return response(implode("\n", $lines), 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
