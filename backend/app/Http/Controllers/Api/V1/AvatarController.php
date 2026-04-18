<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AvatarController extends Controller
{
    /**
     * GET /avatars/{userId}/{filename}
     * Sert un avatar depuis le disque de stockage configuré.
     * Route publique — pas d'authentification requise.
     */
    public function serve(int $userId, string $filename): StreamedResponse|Response
    {
        // Empêcher le path traversal
        if (str_contains($filename, '/') || str_contains($filename, '..')) {
            abort(400);
        }

        $path = "avatars/{$userId}/{$filename}";
        $disk = Storage::disk(config('filesystems.default'));

        if (! $disk->exists($path)) {
            abort(404);
        }

        return $disk->response($path);
    }
}
