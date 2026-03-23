import { useState } from 'react'
import { consult, consultText } from '../services/api.js'
import AudioPlayer from '../components/AudioPlayer.jsx'
import { useNavigate } from 'react-router-dom'

export default function ConsultPage() {
  const [query,    setQuery]    = useState('')
  const [url,      setUrl]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')
  const [textOnly, setTextOnly] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const fn = textOnly ? consultText : consult
      const data = await fn(query.trim(), url.trim() || undefined)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page fade-up">
      <div className="section-header">
        <div>
          <h1 className="section-title">Nueva consulta</h1>
          <p className="section-subtitle">Preguntá sobre un medicamento o prospecto</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Query input */}
        <div className="card">
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Tu consulta</label>
            <textarea
              className="input"
              placeholder="Ej: ¿Puedo tomar ibuprofeno con mi medicación actual? ¿Qué efectos secundarios tiene el omeprazol?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">URL del prospecto (opcional)</label>
            <input
              className="input"
              type="url"
              placeholder="https://anmat.gov.ar/... o cualquier prospecto online"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate-600)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={textOnly}
                onChange={e => setTextOnly(e.target.checked)}
                style={{ accentColor: 'var(--blue-500)' }}
              />
              Solo texto (sin audio)
            </label>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
            >
              {loading ? <><span className="spinner" /> Consultando...</> : <><span>🎙️</span> Consultar</>}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result.audio ? (
              <AudioPlayer base64={result.audio.base64} mimeType={result.audio.mimeType} text={result.text} />
            ) : (
              <div className="card">
                <p className="card-title">Respuesta</p>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--slate-700)' }}>{result.text}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setResult(null); setQuery(''); setUrl('') }}>
                Nueva consulta
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/chat')}>
                💬 Hablar con mi médico
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎙️</div>
            <p style={{ fontSize: 15 }}>Tu respuesta personalizada aparecerá aquí</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Basada en tu historial médico</p>
          </div>
        )}
      </div>
    </div>
  )
}
