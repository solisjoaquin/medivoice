import { useState, useRef, useEffect } from 'react'

const BAR_COUNT = 28

export default function AudioPlayer({ base64, mimeType = 'audio/mpeg', text }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!base64) return
    const src = `data:${mimeType};base64,${base64}`
    audioRef.current = new Audio(src)

    audioRef.current.ontimeupdate = () => {
      const pct = audioRef.current.currentTime / (audioRef.current.duration || 1)
      setProgress(pct)
    }
    audioRef.current.onended = () => {
      setPlaying(false)
      setProgress(0)
    }
    return () => { audioRef.current?.pause() }
  }, [base64, mimeType])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const filledBars = Math.round(progress * BAR_COUNT)

  // Bar heights for a pseudo-waveform
  const heights = [30, 55, 40, 70, 45, 60, 35, 80, 50, 65, 40, 75, 55, 45, 70, 60, 50, 80, 35, 65, 45, 55, 70, 40, 60, 50, 65, 35]

  return (
    <div className="audio-player">
      <div className="audio-player-label">Audio response</div>
      {text && <p className="audio-player-text">{text}</p>}
      <div className="audio-controls">
        <button className="audio-play-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸' : '▶'}
        </button>
        <div className="audio-waveform" role="progressbar">
          {heights.slice(0, BAR_COUNT).map((h, i) => (
            <div
              key={i}
              className={`audio-bar ${i < filledBars ? 'active' : ''}`}
              style={{ height: `${playing ? h * (0.5 + Math.random() * 0.5) : h * 0.5}%`, transition: playing ? 'height 0.15s' : 'none' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
