// Sérialise un objet schema.org pour l'injecter dans <script type="application/ld+json">.
// JSON.stringify n'échappe pas `<` : une donnée contenant `</script>` fermerait la
// balise et permettrait une injection de script (XSS). On échappe donc les
// caractères sensibles en séquences unicode, qui restent du JSON valide.
// Les séparateurs de ligne/paragraphe Unicode (U+2028 / U+2029) sont aussi
// échappés : ils cassent certains parseurs JS.
const LINE_SEPARATOR = String.fromCharCode(0x2028)
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029)

const UNSAFE_CHARS = new Set(['<', '>', '&', LINE_SEPARATOR, PARAGRAPH_SEPARATOR])

function toUnicodeEscape(char: string): string {
  return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
}

export function serializeJsonLd(data: unknown): string {
  return Array.from(JSON.stringify(data), (char) =>
    UNSAFE_CHARS.has(char) ? toUnicodeEscape(char) : char
  ).join('')
}
