<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PasswordPolicy implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $min = (int) config('password-policy.min_length', 10);
        $upper = (bool) config('password-policy.require_uppercase', true);
        $lower = (bool) config('password-policy.require_lowercase', true);
        $digit = (bool) config('password-policy.require_digit', true);
        $special = (bool) config('password-policy.require_special', true);

        if (mb_strlen($value) < $min) {
            $fail("Le mot de passe doit contenir au moins {$min} caractères.");

            return;
        }

        if ($upper && ! preg_match('/[A-Z]/', $value)) {
            $fail('Le mot de passe doit contenir au moins une lettre majuscule.');

            return;
        }

        if ($lower && ! preg_match('/[a-z]/', $value)) {
            $fail('Le mot de passe doit contenir au moins une lettre minuscule.');

            return;
        }

        if ($digit && ! preg_match('/[0-9]/', $value)) {
            $fail('Le mot de passe doit contenir au moins un chiffre.');

            return;
        }

        if ($special && ! preg_match('/[!@#$%^&*()\-_=+\[\]{}|;\':",.\\/<>?\\\\]/', $value)) {
            $fail('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*…).');
        }
    }
}
