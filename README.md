# 🎨 AI Consulting Frontend

Landing page premium con sistema de chat inteligente para calificación de leads.

## 🚀 Quick Start

```bash
# Opción 1: Python (más simple)
python -m http.server 8000

# Opción 2: Node.js
npm install
npm run serve

# Opción 3: Abrir directamente
open index.html
```

## 📦 Estructura

```
frontend/
├── index.html          # Landing page principal
├── styles/
│   ├── main.scss      # Estilos fuente (editar este)
│   ├── _variables.scss # Variables y configuración
│   └── main.css       # CSS compilado (generado)
├── js/
│   ├── config.js      # Configuración y constantes
│   ├── api.js         # Cliente API y mocks
│   ├── chat.js        # Lógica del chat
│   └── main.js        # Controlador principal
└── assets/
    └── favicon.svg    # Icono del sitio
```

## 🎨 Personalización

### Cambiar Colores

Edita `styles/_variables.scss`:

```scss
$color-accent-primary: #6ee7ff;   // Tu color principal
$color-accent-secondary: #4a9eff; // Tu color secundario
```

Luego recompila:
```bash
npm run scss:build
```

### Modificar Textos

Todos los textos están en `index.html`:
- Hero section (línea ~65)
- Paths cards (línea ~140)
- Process steps (línea ~260)

### Configurar API

Edita `js/config.js`:

```javascript
const CONFIG = {
    SUPABASE_URL: 'tu-url-aqui',
    SUPABASE_ANON_KEY: 'tu-key-aqui',
    CALENDLY_URL: 'tu-calendly-link'
}
```

## 🧪 Desarrollo Local

El frontend incluye un **Mock API** que simula el backend cuando trabajas localmente:

1. Abre `index.html` en el navegador
2. El chat funcionará automáticamente con respuestas simuladas
3. Perfect para testing y desarrollo

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

Todos los breakpoints están en `_variables.scss`

## 🔧 Scripts Disponibles

```bash
npm run dev        # Servidor local con Python
npm run serve      # Servidor local con Node
npm run scss       # Compilar SCSS en modo watch
npm run scss:build # Compilar SCSS para producción
npm run format     # Formatear código con Prettier
```

## 🚀 Deploy

### Opción 1: GitHub Pages
```bash
git add .
git commit -m "Deploy"
git push
# Activar Pages en Settings
```

### Opción 2: Netlify
1. Arrastrar carpeta a [netlify.com](https://netlify.com)
2. ¡Listo!

### Opción 3: Vercel
```bash
npx vercel
```

### Opción 4: Cualquier CDN
Solo sube los archivos a cualquier hosting estático.

## ⚡ Performance

- Tamaño total: ~150KB
- Tiempo de carga: <1s
- Score Lighthouse: 95+
- Sin dependencias en runtime

## 🐛 Troubleshooting

### "Estilos no se ven bien"
```bash
# Recompilar CSS
npm run scss:build
```

### "Chat no funciona"
- Verificar `config.js` tiene las URLs correctas
- Revisar consola del navegador (F12)

### "Cambié SCSS pero no veo cambios"
- Asegurar que compilaste: `npm run scss:build`
- Limpiar caché: Ctrl+Shift+R

## 📄 Licencia

MIT - Usa este código como quieras.

---

**Frontend standalone** - No requiere Node.js para funcionar, solo para desarrollo.