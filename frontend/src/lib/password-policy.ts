import { z } from 'zod'

// Valeurs lues au module-load — inlinées par Next.js au build time
const MIN_LENGTH = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH ?? 10)
const REQ_UPPERCASE = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE !== 'false'
const REQ_LOWERCASE = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE !== 'false'
const REQ_DIGIT = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT !== 'false'
const REQ_SPECIAL = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL !== 'false'

export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;\':",./<>?'

/**
 * Schéma Zod pour un champ mot de passe soumis à la politique saFoulee.
 * À importer dans LoginForm, RegisterForm, ResetPasswordForm.
 * Les règles dépendent des variables NEXT_PUBLIC_PASSWORD_*.
 */
export const passwordSchema = z
  .string()
  .min(1, 'Le mot de passe est obligatoire.')
  .min(MIN_LENGTH, `Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`)
  .superRefine((val, ctx) => {
    if (REQ_UPPERCASE && !/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: 'Le mot de passe doit contenir au moins une lettre majuscule.',
      })
    }
    if (REQ_LOWERCASE && !/[a-z]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: 'Le mot de passe doit contenir au moins une lettre minuscule.',
      })
    }
    if (REQ_DIGIT && !/[0-9]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: 'Le mot de passe doit contenir au moins un chiffre.',
      })
    }
    if (REQ_SPECIAL && !/[!@#$%^&*()\-_=+\[\]{}|;':",.\\/<>?]/.test(val)) {
      ctx.addIssue({
        code: "custom",
        message: `Le mot de passe doit contenir au moins un caractère spécial (${PASSWORD_SPECIAL_CHARS}).`,
      })
    }
  })
