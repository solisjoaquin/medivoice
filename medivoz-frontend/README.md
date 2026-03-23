# MediVoz — Frontend

React + Vite. Requiere el backend corriendo en `localhost:3000`.

## Setup

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Consulta médica → audio |
| `/profile` | Historial médico (CRUD) |
| `/chat` | Chat con el médico |

## Variables de entorno

No requiere `.env`. El proxy de Vite redirige `/api/*` → `localhost:3000/*`.

Si el backend corre en otro host, editar `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://tu-backend-url',
    ...
  }
}
```
