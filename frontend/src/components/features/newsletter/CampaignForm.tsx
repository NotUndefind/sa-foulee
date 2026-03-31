'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { createCampaign, updateCampaign, sendCampaign, type Campaign } from '@/lib/newsletter'

interface Props {
  subscriberCount: number
  onSaved: (campaign: Campaign) => void
  onCancel: () => void
}

export default function CampaignForm({ subscriberCount, onSaved, onCancel }: Props) {
  const [subject, setSubject] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [savedCampaign, setSavedCampaign] = useState<Campaign | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] focus:outline-none px-4 py-3',
      },
    },
  })

  useEffect(
    () => () => {
      editor?.destroy()
    },
    [editor]
  )

  const getHtml = () => editor?.getHTML() ?? ''

  const handleSaveDraft = async () => {
    setError(null)
    const body_html = getHtml()
    if (!subject.trim() || !body_html.trim() || body_html === '<p></p>') {
      setError('Le sujet et le contenu sont requis.')
      return
    }
    setSaving(true)
    try {
      let campaign: Campaign
      if (savedCampaign) {
        campaign = await updateCampaign(savedCampaign.id, { subject, body_html })
      } else {
        campaign = await createCampaign({ subject, body_html })
      }
      setSavedCampaign(campaign)
      setSuccessMsg('Brouillon enregistré.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch {
      setError("Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (!savedCampaign) return
    setSending(true)
    setShowConfirm(false)
    setError(null)
    try {
      await sendCampaign(savedCampaign.id)
      onSaved({
        ...savedCampaign,
        sent_at: new Date().toISOString(),
        recipient_count: subscriberCount,
      })
    } catch {
      setError("Erreur lors de l'envoi. Réessaie.")
      setSending(false)
    }
  }

  const handleSendClick = async () => {
    // Sauvegarder d'abord si pas encore sauvegardé
    if (!savedCampaign) {
      await handleSaveDraft()
    }
    setShowConfirm(true)
  }

  return (
    <>
      <style>{`
        .cf-editor-wrap {
          border: 1px solid rgba(192,48,46,0.15);
          border-radius: 12px;
          overflow: hidden;
          transition: border 0.2s;
        }
        .cf-editor-wrap:focus-within {
          border-color: #FB3936;
          box-shadow: 0 0 0 3px rgba(251,57,54,0.1);
        }
        .cf-toolbar {
          display: flex; gap: 4px; flex-wrap: wrap;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(192,48,46,0.08);
          background: rgba(251,57,54,0.02);
        }
        .cf-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
          border: 1px solid rgba(192,48,46,0.15); background: white; cursor: pointer;
          color: #2C2C2C; transition: background 0.15s;
        }
        .cf-btn:hover    { background: rgba(251,57,54,0.06); }
        .cf-btn.is-active { background: rgba(251,57,54,0.12); border-color: #FB3936; color: #D42F2D; }
        .cf-input {
          width: 100%; border: 1px solid rgba(192,48,46,0.15); border-radius: 12px;
          padding: 10px 14px; font-size: 14px; outline: none; font-family: inherit;
          transition: border 0.2s;
        }
        .cf-input:focus { border-color: #FB3936; box-shadow: 0 0 0 3px rgba(251,57,54,0.1); }
      `}</style>

      <div className="space-y-4">
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(251,57,54,0.06)',
              border: '1px solid rgba(251,57,54,0.2)',
              color: '#D42F2D',
            }}
          >
            {error}
          </div>
        )}
        {successMsg && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(169,50,38,0.06)',
              border: '1px solid rgba(169,50,38,0.2)',
              color: '#D42F2D',
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Sujet */}
        <div>
          <label
            className="mb-1.5 block text-xs font-bold tracking-wider uppercase"
            style={{ color: '#7F7F7F' }}
          >
            Sujet
          </label>
          <input
            className="cf-input"
            placeholder="Objet de l'email…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Éditeur */}
        <div>
          <label
            className="mb-1.5 block text-xs font-bold tracking-wider uppercase"
            style={{ color: '#7F7F7F' }}
          >
            Contenu
          </label>
          <div className="cf-editor-wrap">
            {editor && (
              <div className="cf-toolbar">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`cf-btn${editor.isActive('bold') ? 'is-active' : ''}`}
                >
                  <strong>G</strong>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`cf-btn${editor.isActive('italic') ? 'is-active' : ''}`}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`cf-btn${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`cf-btn${editor.isActive('bulletList') ? 'is-active' : ''}`}
                >
                  • Liste
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`cf-btn${editor.isActive('orderedList') ? 'is-active' : ''}`}
                >
                  1. Liste
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setHardBreak().run()}
                  className="cf-btn"
                >
                  ↵
                </button>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-5 py-2.5 text-sm font-bold transition"
            style={{ background: 'rgba(0,0,0,0.05)', color: '#2C2C2C' }}
          >
            Annuler
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:opacity-40"
              style={{
                background: 'rgba(192,48,46,0.08)',
                color: '#C0302E',
                border: '1px solid rgba(192,48,46,0.2)',
              }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer brouillon'}
            </button>
            <button
              type="button"
              onClick={handleSendClick}
              disabled={saving || sending || !subject.trim()}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
              }}
            >
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>

      {/* Modale confirmation */}
      {showConfirm && savedCampaign && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
            }}
          >
            <h3
              style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', marginBottom: '12px' }}
            >
              Confirmer l&apos;envoi
            </h3>
            <p
              style={{ fontSize: '14px', color: '#7F7F7F', lineHeight: 1.6, marginBottom: '24px' }}
            >
              Vous allez envoyer{' '}
              <strong style={{ color: '#D42F2D' }}>{savedCampaign.subject}</strong> à{' '}
              <strong style={{ color: '#D42F2D' }}>
                {subscriberCount} membre{subscriberCount !== 1 ? 's' : ''}
              </strong>{' '}
              abonné{subscriberCount !== 1 ? 's' : ''}. Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold"
                style={{ background: 'rgba(0,0,0,0.06)', color: '#2C2C2C' }}
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)',
                  boxShadow: '0 2px 8px rgba(251,57,54,0.3)',
                }}
              >
                Envoyer maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
