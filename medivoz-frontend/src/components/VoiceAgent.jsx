import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useConversation } from '@elevenlabs/react'
import { getAgentSignedUrl, getAgentPrompt } from '../services/api.js'

export default function VoiceAgent() {
    const conversation = useConversation()
    const [error, setError] = useState('')
    const [connecting, setConnecting] = useState(false)
    const [volumeLevels, setVolumeLevels] = useState(Array(24).fill(10))

    const animationRef = useRef(null)

    const handleConnect = useCallback(async () => {
        try {
            setConnecting(true)
            setError('')

            // 1. Request microphone permissions
            await navigator.mediaDevices.getUserMedia({ audio: true })

            // 2. Fetch the dynamic system prompt (Patient profile + Doctor data)
            const promptData = await getAgentPrompt()

            // 3. Fetch ElevenLabs Signed URL securely from backend
            const urlData = await getAgentSignedUrl()
            console.log('Got signed URL data:', urlData)

            if (!urlData.signedUrl) {
                throw new Error('Backend did not return a valid signedUrl.')
            }

            // 4. Start the interactive voice session
            console.log('Starting session with dynamic variables...')
            await conversation.startSession({
                connectionType: 'websocket',
                signedUrl: urlData.signedUrl,
                dynamicVariables: promptData.dynamicVariables
            })
            console.log('Session started successfully.')
        } catch (err) {
            console.error('Agent connection error:', err)
            setError(err.message || 'Failed to connect to the medical agent. Check your AGENT_ID and API_KEY.')
        } finally {
            setConnecting(false)
        }
    }, [conversation])

    const handleDisconnect = useCallback(async () => {
        await conversation.endSession()
    }, [conversation])

    // Visualizer loop for when agent or user speaks
    const updateVisualizer = useCallback(() => {
        if (conversation.status === 'connected') {
            const data = conversation.isSpeaking
                ? conversation.getOutputByteFrequencyData()
                : conversation.getInputByteFrequencyData()

            if (data) {
                // Map the frequency data into 24 bins for our visualizer
                const step = Math.max(1, Math.floor(data.length / 24))
                const levels = []
                for (let i = 0; i < 24; i++) {
                    const val = data[i * step] || 0
                    // scale 0-255 to roughly 10-100% height
                    const h = Math.max(10, (val / 255) * 100)
                    levels.push(h)
                }
                setVolumeLevels(levels)
            } else {
                setVolumeLevels(Array(24).fill(10))
            }
        } else {
            setVolumeLevels(Array(24).fill(10))
        }

        animationRef.current = requestAnimationFrame(updateVisualizer)
    }, [conversation])

    useEffect(() => {
        animationRef.current = requestAnimationFrame(updateVisualizer)
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [updateVisualizer])

    const [showPostCall, setShowPostCall] = useState(false)
    const [message, setMessage] = useState('')
    const [sendingMsg, setSendingMsg] = useState(false)
    const [msgSent, setMsgSent] = useState(false)

    // Watch for call end to show post-call option
    useEffect(() => {
        if (conversation.status === 'connected') {
            setShowPostCall(false) // Reset if reconnected
            setMsgSent(false)
            setMessage('')
        } else if (conversation.status === 'disconnected' || conversation.status === 'finished') {
            // Only show if we were previously connecting or connected (to avoid showing on initial load)
            // But for simplicity, we can just show it when disconnected if it was ever active.
            // Actually, conversation.status might be 'disconnected' by default.
            // Let's use a ref to track if a call was ever active.
        }
    }, [conversation.status])

    // Tracking if call was active
    const wasActiveRef = useRef(false)
    useEffect(() => {
        if (conversation.status === 'connected') {
            wasActiveRef.current = true
        } else if (wasActiveRef.current && (conversation.status === 'disconnected' || conversation.status === 'finished')) {
            setShowPostCall(true)
            wasActiveRef.current = false
        }
    }, [conversation.status])

    const handleSendMessage = async () => {
        if (!message.trim()) return
        setSendingMsg(true)
        try {
            const { sendMessageToDoctor } = await import('../services/doctorApi.js')
            await sendMessageToDoctor(message)
            setMsgSent(true)
            setMessage('')
        } catch (err) {
            console.error('Error sending message to doctor:', err)
            alert('Failed to send message.')
        } finally {
            setSendingMsg(false)
        }
    }

    const isConnected = conversation.status === 'connected'

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', background: isConnected ? 'linear-gradient(135deg, var(--blue-800), var(--blue-900))' : 'var(--white)', transition: 'background 0.3s ease', minHeight: 300, border: isConnected ? 'none' : '1px solid var(--slate-200)', color: isConnected ? 'white' : 'inherit', position: 'relative' }}>

            {!isConnected && !connecting ? (
                <>
                    <h2 className="card-title" style={{ fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Talk to your AI Doctor</h2>
                    <p style={{ color: 'var(--slate-500)', fontSize: 14, textAlign: 'center', marginBottom: 32, maxWidth: 300 }}>
                        Press the button to start a real-time voice call with your medical assistant. It knows your clinical history.
                    </p>
                    <button
                        onClick={handleConnect}
                        className="btn btn-primary btn-lg"
                        style={{ borderRadius: '50%', width: 80, height: 80, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(26, 111, 212, 0.4)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                    </button>
                    {error && (
                        <div className="alert alert-error" style={{ marginTop: 24, fontSize: 13, maxWidth: '100%' }}>
                            <span>⚠️</span><span>{error}</span>
                        </div>
                    )}

                    {showPostCall && (
                        <div className="fade-up" style={{ marginTop: 32, width: '100%', maxWidth: 320, padding: 16, borderTop: '1px solid var(--slate-100)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {msgSent ? (
                                <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: 14, padding: '12px 0' }}>
                                    ✓ Message sent to your doctor!
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-700)', textAlign: 'center' }}>Send a message to your doctor?</h3>
                                    <textarea
                                        className="input"
                                        placeholder="Type your message here..."
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={3}
                                        style={{ fontSize: 13, resize: 'none' }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="btn btn-sm"
                                        disabled={!message.trim() || sendingMsg}
                                        style={{ background: 'var(--blue-600)', color: 'white' }}
                                    >
                                        {sendingMsg ? 'Sending...' : 'Send Message'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </>
            ) : connecting ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <span className="spinner" style={{ width: 40, height: 40, color: 'var(--blue-400)' }} />
                    <p style={{ color: 'var(--slate-500)' }}>Connecting to medical assistant...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '24px 0' }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, marginBottom: 40 }}>
                        {conversation.isSpeaking ? 'Agent speaking...' : 'Listening...'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 80, marginBottom: 40 }}>
                        {volumeLevels.map((h, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 6,
                                    height: `${h}%`,
                                    background: conversation.isSpeaking ? 'var(--blue-400)' : 'rgba(255, 255, 255, 0.4)',
                                    borderRadius: 3,
                                    transition: 'height 0.1s ease, background 0.3s ease'
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleDisconnect}
                        className="btn btn-danger btn-lg"
                        style={{ borderRadius: '50%', width: 64, height: 64, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(229, 62, 62, 0.4)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="22" x2="2" y1="2" y2="22" /></svg>
                    </button>
                    <div style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>End call</div>
                </div>
            )}
        </div>
    )
}
