import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from './json-ld'

describe('serializeJsonLd', () => {
  it('neutralise une tentative de fermeture de balise script', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' })

    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
    expect(out).not.toContain('>')
  })

  it('produit un JSON qui se relit à l’identique', () => {
    const separators = String.fromCharCode(0x2028) + String.fromCharCode(0x2029)
    const data = { name: 'A & B <c>', sep: `x${separators}y` }
    const out = serializeJsonLd(data)

    expect(out).not.toContain(separators[0])
    expect(out).not.toContain(separators[1])
    expect(JSON.parse(out)).toEqual(data)
  })
})
