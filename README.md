# 🐱 Matrix AI Landing Page - Frontend

> Landing page interactiva con tema Matrix para Daniel Castiblanco, consultor de IA. Incluye un gato mascota flotante con sonido de ronroneo y sistema de chat para calificación de leads.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow)

## 🎯 Características Principales

### 🤖 Gato Mascota Interactivo
- **Posición fija** en esquina inferior derecha
- **Press & Hold**: Mantén presionado para que ronronee
- **Eye tracking**: Los ojos siguen el cursor del mouse
- **Sonido real**: Reproduce `ronroneo.wav` mientras lo presionas
- **Responsive**: Se adapta al tamaño de pantalla

### 💻 Tema Matrix Terminal
- **Estética terminal** con prompts estilo Linux
- **Fuentes Matrix**: Orbitron + Share Tech Mono
- **Colores balanceados**: Verdes no saturados (#00d455)
- **Animaciones suaves**: Float, glow, scanline effects

### 💬 Sistema de Chat
- **10 preguntas máximo** para calificar leads
- **Typing indicators** animados
- **Auto-scroll** y auto-focus
- **Integración** con backend Supabase

## 🚀 Quick Start

```bash
# Opción 1: Abrir directamente (NO REQUIERE INSTALACIÓN)
Abre index.html en tu navegador

# Opción 2: Python
python -m http.server 8000

# Opción 3: Node.js
npx serve

# Opción 4: VS Code Live Server
Click derecho en index.html -> "Open with Live Server"
```

## 📁 Estructura del Proyecto

```
frontend/
├── index.html              # Página principal con SVG del gato
├── assets/
│   └── favicon.svg         # Favicon DC verde
├── js/
│   ├── floating-cat.js     # 🐱 Lógica del gato (ronroneo, ojos)
│   ├── matrix-chat.js      # 💬 Sistema de chat
│   ├── knowledge-base.js   # 📚 Info de Daniel
│   ├── config-minimal.js   # ⚙️ Configuración
│   └── [archivos legacy]   # Versiones anteriores
├── styles/
│   ├── matrix-theme.css    # 🎨 Estilos Matrix actuales
│   └── [estilos legacy]    # Versiones anteriores
└── ../ronroneo.wav         # 🔊 Sonido del gato (carpeta padre)
```

## 🐱 Cómo Funciona el Gato

### Archivos Clave:
1. **index.html** (líneas 30-138): SVG del gato con párpados y pupilas
2. **floating-cat.js**: Toda la lógica de interacción
3. **matrix-theme.css** (líneas 126-204): Estilos y animaciones

### Comportamiento:
```javascript
// Eventos del gato
mousedown/touchstart → startPurring() → Cierra ojos + Sonido
mouseup/touchend → stopPurring() → Abre ojos + Para sonido
mousemove → updateEyePosition() → Pupilas siguen cursor (si ojos abiertos)
```

### Estructura SVG del Gato:
```html
<div id="floatingCat" class="floating-cat">
  <svg id="aiCat">
    <!-- Cabeza, orejas, bigotes externos -->
    <!-- Ojos con pupilas móviles -->
    <!-- Párpado (rect) que se escala en Y -->
    <!-- Cola animada -->
  </svg>
</div>
```

## 🎨 Personalización

### Cambiar colores (matrix-theme.css):
```css
:root {
  --matrix-green: #00d455;        /* Verde principal */
  --matrix-green-bright: #26d467;  /* Verde brillante */
  --matrix-green-dim: #238636;     /* Verde tenue */
}
```

### Ajustar posición del gato:
```css
.floating-cat {
  bottom: 30px;  /* Distancia desde abajo */
  right: 30px;   /* Distancia desde derecha */
}
```

### Configurar API (config-minimal.js):
```javascript
const CONFIG = {
  IS_DEVELOPMENT: true,  // false en producción
  CALENDLY_URL: 'https://calendly.com/daniel-castiblanco/30min'
}
```

## 🐛 Troubleshooting

### El gato no ronronea:
1. Verifica que `ronroneo.wav` esté en la carpeta padre (`../`)
2. Abre la consola del navegador (F12)
3. Busca mensajes como "🔇 Audio file not found"
4. Asegúrate de mantener presionado, no solo click

### Los ojos no siguen el cursor:
1. Verifica que NO estés presionando el gato (ojos cerrados)
2. Revisa la consola por errores de JavaScript
3. Los ojos solo se mueven cuando están abiertos

### El chat no funciona:
1. Verifica `config-minimal.js` tiene las URLs correctas
2. Si es desarrollo, `IS_DEVELOPMENT: true` usa mock API
3. Para producción necesitas el backend Supabase corriendo

## 📝 Notas Importantes para Desarrolladores

### ⚠️ REGLAS CRÍTICAS:
- **NO USAR REACT/FRAMEWORKS** - El cliente lo rechaza explícitamente
- **Mantener vanilla JS** - Sin dependencias externas
- **Terminal aesthetic** es clave - No cambiar a UI moderna
- **El gato siempre visible** - Elemento distintivo de la marca
- **Sonido al mantener presionado** - No al click simple

### 📱 Responsive Breakpoints:
- **Mobile**: < 480px (gato 80px)
- **Tablet**: < 768px (gato 100px)  
- **Desktop**: > 768px (gato 120px)

## 🚀 Deployment

### GitHub Pages:
```bash
# El frontend ya está en el repo
# Ve a Settings → Pages → Source: main branch → /frontend folder
# URL: https://twynzen.github.io/landincatpagecalendly/
```

### Netlify/Vercel:
```bash
# Solo arrastra la carpeta frontend
# No necesita build process
# Es HTML/CSS/JS puro
```

### Configuración Producción:
1. Cambiar `IS_DEVELOPMENT: false` en config-minimal.js
2. Configurar variables de entorno en hosting
3. Verificar CORS en backend Supabase

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Add: Nueva característica'`)
4. Push al branch (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

### Guía de Commits:
- `Add:` Nueva funcionalidad
- `Fix:` Corrección de bugs
- `Update:` Actualización de funcionalidad existente
- `Style:` Cambios visuales/CSS
- `Docs:` Documentación

## 📞 Links Importantes

- **GitHub Frontend**: [landincatpagecalendly](https://github.com/Twynzen/landincatpagecalendly)
- **GitHub Backend**: [landincatpagecalendlyBACK](https://github.com/Twynzen/landincatpagecalendlyBACK)
- **Demo Live**: [Próximamente en GitHub Pages]
- **Calendly**: [daniel-castiblanco/30min](https://calendly.com/daniel-castiblanco/30min)

## 📄 Licencia

MIT - Usa este código como quieras.

---

*Creado con 💚 y mucho café. El gato ronronea de verdad.*
*Frontend 100% vanilla JS - Sin frameworks, sin complicaciones.*