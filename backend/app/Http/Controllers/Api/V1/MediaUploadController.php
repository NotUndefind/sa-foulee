<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUploadController extends Controller
{
    /**
     * POST /api/v1/uploads/media
     * Upload d'une image ou vidéo pour les articles de blog.
     * Réservé aux rôles : admin, founder, coach, bureau.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp,mp4',
                'max:51200', // 50 Mo max (images vérifiées aussi par image rule séparée)
            ],
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();

        // Validation MIME stricte — rejette les types non autorisés
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
        if (! in_array($mime, $allowedMimes, true)) {
            return response()->json(['message' => 'Type de fichier non autorisé.'], 422);
        }

        // Limite 5 Mo pour les images
        $isImage = str_starts_with($mime, 'image/');
        if ($isImage && $file->getSize() > 5 * 1024 * 1024) {
            return response()->json(['message' => 'Les images ne peuvent pas dépasser 5 Mo.'], 422);
        }

        $extension = $isImage
            ? pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION) ?: 'jpg'
            : 'mp4';

        $year = now()->format('Y');
        $month = now()->format('m');
        $filename = Str::uuid().'.'.$extension;
        $path = "uploads/blog/{$year}/{$month}/{$filename}";

        Storage::disk('public')->putFileAs(
            "uploads/blog/{$year}/{$month}",
            $file,
            $filename
        );

        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url], 201);
    }
}
