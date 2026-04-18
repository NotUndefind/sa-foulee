<?php

namespace App\Http\Concerns;

use Illuminate\Support\Facades\Storage;

trait GeneratesAvatarUrl
{
    private function avatarUrl(string $path): string
    {
        $disk = Storage::disk(config('filesystems.default'));

        try {
            // S3 / R2 : URL temporaire signée (1h)
            return $disk->temporaryUrl($path, now()->addHour());
        } catch (\RuntimeException) {
            // Disque local (privé) : passer par la route de serving
            // $path = "avatars/{userId}/{filename}"
            $parts = explode('/', $path);
            if (count($parts) === 3) {
                return route('avatars.serve', [
                    'userId' => $parts[1],
                    'filename' => $parts[2],
                ]);
            }

            return $disk->url($path);
        }
    }
}
