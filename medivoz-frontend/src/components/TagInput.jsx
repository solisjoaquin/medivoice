import { useState } from 'react'

export default function TagInput({ items = [], onAdd, onRemove, placeholder, colorClass = 'tag-blue' }) {
  const [value, setValue] = useState('')

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && value.trim()) {
      e.preventDefault()
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        className="input"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder || 'Escribí y presioná Enter'}
      />
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map(item => (
            <span key={item} className={`tag ${colorClass}`}>
              {item}
              <button className="tag-remove" onClick={() => onRemove(item)} aria-label={`Eliminar ${item}`}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
