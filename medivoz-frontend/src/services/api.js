const BASE = '/api'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error del servidor')
  return data
}

// Profile
export const getProfile = () => req('GET', '/profile')
export const updateProfile = (profile) => req('PUT', '/profile', profile)
export const addItem = (section, item) => req('POST', `/profile/${section}/add`, { item })
export const deleteItem = (section, item) => req('DELETE', `/profile/${section}/${encodeURIComponent(item)}`)

// Consult
export const consult = (query, url) => req('POST', '/consult', { query, url })
export const consultText = (query, url) => req('POST', '/consult/text-only', { query, url })

// Chat
export const getChat = () => req('GET', '/chat')
export const sendMessage = (message) => req('POST', '/chat', { message, role: 'user' })
export const clearChat = () => req('DELETE', '/chat')

export async function sendMessageStream(message, onChunk) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, role: 'user' }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Error del servidor')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep the last potentially incomplete line

    for (const line of lines) {
      if (line.trim() === '') continue
      if (line.startsWith('data: ')) {
        const dataStr = line.replace('data: ', '')
        if (dataStr === '[DONE]') return
        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.text) {
            onChunk(parsed.text)
          } else if (parsed.error) {
            throw new Error(parsed.error)
          }
        } catch (e) {
          console.error('Error parsing stream chunk', e, dataStr)
        }
      }
    }
  }
}
