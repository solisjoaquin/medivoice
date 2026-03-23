import { useState, useEffect, useRef } from 'react'
import { getChat, sendMessageStream, clearChat } from '../services/api.js'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { load() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function load() {
    try {
      const data = await getChat()
      setMessages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setLoading(true)
    setError('')

    // Optimistic update
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: new Date().toISOString() }
    const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: '', timestamp: new Date().toISOString() }

    setMessages(m => [...m, userMsg, assistantMsg])

    try {
      await sendMessageStream(text, (chunkText) => {
        setMessages(currentMessages => {
          const newMessages = [...currentMessages]
          const lastMsg = newMessages[newMessages.length - 1]
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content += chunkText
          }
          return newMessages
        })
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    if (!confirm('¿Borrar todo el historial del chat?')) return
    await clearChat()
    setMessages([])
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="page fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--slate-200)', background: 'var(--white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: 22 }}>Mi médico</h1>
            <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 2 }}>El asistente tiene acceso a tu historial médico</p>
          </div>
          {messages.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleClear}>Borrar</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {fetching && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <span className="spinner" style={{ width: 28, height: 28, color: 'var(--blue-400)' }} />
            </div>
          )}

          {!fetching && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 15 }}>Aún no hay mensajes</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Escribí tu consulta para hablar con tu médico</p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, var(--blue-400), var(--blue-600))'
                  : 'var(--white)',
                color: msg.role === 'user' ? 'white' : 'var(--slate-800)',
                border: msg.role !== 'user' ? '1px solid var(--slate-200)' : 'none',
                boxShadow: 'var(--shadow-sm)',
                fontSize: 14,
                lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
              <span style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4, marginLeft: 4, marginRight: 4 }}>
                {msg.role === 'assistant' ? '🤖 Asistente · ' : ''}
                {new Date(msg.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{
                padding: '12px 18px',
                background: 'var(--white)',
                border: '1px solid var(--slate-200)',
                borderRadius: '18px 18px 18px 4px',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--slate-400)',
                    animation: 'bounce 1.2s infinite',
                    animationDelay: `${i * 0.2}s`,
                    display: 'inline-block',
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 20px', background: 'var(--white)', borderTop: '1px solid var(--slate-200)' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 10, fontSize: 13 }}><span>⚠️</span><span>{error}</span></div>}
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
          <textarea
            className="input"
            placeholder="Escribí tu mensaje..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            style={{ resize: 'none', minHeight: 44, height: 44, lineHeight: '20px', padding: '12px 16px' }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{ flexShrink: 0 }}
          >
            Enviar
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--slate-400)', textAlign: 'center', marginTop: 8 }}>
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
