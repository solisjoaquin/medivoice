import React, { useState, useEffect, useRef } from 'react'
import { getChat, sendMessageStream, clearChat } from '../services/api.js'

export default function ChatDrawer({ isOpen, onClose }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setFetching(true)
            load()
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

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
        if (!confirm('Delete entire chat history?')) return
        await clearChat()
        setMessages([])
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    if (!isOpen) return null

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="drawer-header">
                    <div>
                        <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--blue-900)' }}>My doctor</h2>
                        <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 2 }}>The assistant has access to your medical history</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {messages.length > 0 && (
                            <button className="btn btn-danger btn-sm" onClick={handleClear}>Delete</button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 20, padding: '4px 8px' }}>✕</button>
                    </div>
                </div>

                {/* Messages */}
                <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 0 }}>
                    {fetching && (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <span className="spinner" style={{ width: 28, height: 28, color: 'var(--blue-400)' }} />
                        </div>
                    )}

                    {!fetching && messages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                            <p style={{ fontSize: 15 }}>No messages yet</p>
                            <p style={{ fontSize: 13, marginTop: 6 }}>Write your question to talk to your doctor</p>
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
                                maxWidth: '85%',
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
                                {msg.role === 'assistant' ? '🤖 Assistant · ' : ''}
                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
                    <div ref={bottomRef} style={{ height: 1 }} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 24px 20px', background: 'var(--white)', borderTop: '1px solid var(--slate-200)' }}>
                    {error && <div className="alert alert-error" style={{ marginBottom: 10, fontSize: 13, padding: '8px 12px' }}><span>⚠️</span><span>{error}</span></div>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <textarea
                            className="input"
                            placeholder="Write your message..."
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
                            Send
                        </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--slate-400)', textAlign: 'center', marginTop: 8 }}>
                        Enter to send · Shift+Enter for new line
                    </p>
                </div>

                <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
          }
        `}</style>
            </div>
        </div>
    )
}
