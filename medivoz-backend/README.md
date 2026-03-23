# MediVoz — Backend API

Backend en Node.js para la plataforma MediVoz. Combina Firecrawl, Claude (Anthropic) y ElevenLabs para generar respuestas médicas personalizadas en audio.

## Setup

```bash
npm install
cp .env.example .env   # completar con tus API keys
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic (Claude) |
| `ELEVENLABS_API_KEY` | API key de ElevenLabs |
| `ELEVENLABS_VOICE_ID` | ID de voz (default: Rachel en inglés, buscar una en español) |
| `FIRECRAWL_API_KEY` | API key de Firecrawl |
| `PORT` | Puerto del servidor (default: 3000) |

> Para voces en español en ElevenLabs, buscar en el Voice Lab una voz latina o crear una propia.

---

## Endpoints

### Health
```
GET /health
```

---

### Perfil médico

```
GET /profile
→ Retorna el historial completo del usuario
```

```
PUT /profile
Body: { medications: [], conditions: [], allergies: [], studies: [] }
→ Reemplaza todo el perfil
```

```
PATCH /profile/:section
Body: { items: ["item1", "item2"] }
→ Reemplaza una sección (medications | conditions | allergies | studies)
```

```
POST /profile/:section/add
Body: { item: "Ibuprofeno 400mg" }
→ Agrega un ítem a la sección
```

```
DELETE /profile/:section/:item
→ Elimina un ítem de la sección
```

---

### Consulta médica en audio

```
POST /consult
Body: {
  "query": "¿Puedo tomar ibuprofeno con mi medicación actual?",
  "url": "https://..." // opcional: URL del prospecto
}
→ Retorna texto + audio en base64 (MP3)
```

**Respuesta:**
```json
{
  "ok": true,
  "query": "...",
  "text": "Explicación generada por Claude...",
  "audio": {
    "base64": "...",
    "mimeType": "audio/mpeg"
  },
  "scrapedUrl": "https://..." 
}
```

Para reproducir en el frontend:
```js
const audio = new Audio(`data:audio/mpeg;base64,${response.audio.base64}`)
audio.play()
```

```
POST /consult/text-only
Body: { "query": "...", "url": "..." }
→ Solo texto, sin llamar a ElevenLabs (útil en desarrollo)
```

---

### Chat con médico

```
GET /chat
→ Historial completo del chat
```

```
POST /chat
Body: { "message": "Tengo una duda sobre mis resultados", "role": "user" }
→ Envía mensaje y obtiene respuesta del asistente IA
```

```
DELETE /chat
→ Borra el historial del chat
```

---

## Arquitectura del flujo principal

```
Usuario hace consulta
        ↓
[Firecrawl] scraping opcional de URL (prospecto, ANMAT, etc.)
        ↓
[Claude] genera respuesta personalizada con el historial del usuario
        ↓
[ElevenLabs] convierte texto a audio MP3
        ↓
Frontend reproduce el audio
```

## Estructura del proyecto

```
src/
├── index.js              # Entry point + Express server
├── routes/
│   ├── profile.js        # CRUD historial médico
│   ├── consult.js        # Pipeline consulta → audio
│   └── chat.js           # Mensajería con médico
├── services/
│   ├── db.js             # Lectura/escritura JSON
│   ├── claude.js         # Integración Anthropic
│   ├── elevenlabs.js     # Text-to-speech
│   └── firecrawl.js      # Web scraping
└── data/
    ├── profile.json      # Historial del usuario
    └── chat.json         # Historial del chat
```
