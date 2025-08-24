# 🚀 GUÍA DE CONFIGURACIÓN - FRONTEND

## 📋 Requisitos Previos

- Node.js 16+ (opcional, solo para desarrollo avanzado)
- Python 3.x (para servidor local simple)
- Cuenta en Supabase con proyecto creado
- API key de OpenAI (se configura en Supabase, NO en frontend)

## 🔧 PASO 1: Configurar Variables de Entorno

### 1.1 Copiar el archivo de ejemplo
```bash
cp .env.example .env
```

### 1.2 Editar `.env` con tus credenciales reales:
```env
# Supabase (obtener desde dashboard.supabase.com)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (tu anon key completa)

# Calendly (tu link personal)
VITE_CALENDLY_URL=https://calendly.com/tu-usuario/30min
```

⚠️ **IMPORTANTE**: El archivo `.env` NUNCA se sube a Git (está en .gitignore)

## 🔐 PASO 2: Configurar Backend en Supabase

### 2.1 Configurar Edge Functions

1. Ve a tu proyecto en [dashboard.supabase.com](https://dashboard.supabase.com)
2. En el menú lateral: **Edge Functions**
3. Haz deploy de las funciones del backend:
   ```bash
   # Desde la carpeta backend
   supabase functions deploy chat
   supabase functions deploy lead
   ```

### 2.2 Configurar Secrets en Supabase

En Supabase Dashboard > Settings > Edge Functions > Secrets, agregar:

```bash
OPENAI_API_KEY=sk-... (tu API key de OpenAI)
```

⚠️ **NUNCA pongas la API key de OpenAI en el frontend**

### 2.3 Configurar CORS

En Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `http://localhost:8000` (desarrollo)
- Redirect URLs: Agregar tu dominio de producción

## 🌐 PASO 3: Ejecutar la Aplicación

### Desarrollo Local (Simple)
```bash
# Desde la carpeta frontend
python -m http.server 8000

# Abrir en navegador
http://localhost:8000
```

### Desarrollo con Live Reload (Opcional)
```bash
# Instalar live-server globalmente
npm install -g live-server

# Ejecutar
live-server --port=8000
```

## ✅ PASO 4: Verificar Funcionamiento

### 4.1 Verificar Send-Cat
- [ ] El gato aparece y saluda al cargar
- [ ] Se mueve autónomamente por la página
- [ ] Responde al hacer click (ronroneo)
- [ ] Habla contextualmente según la sección

### 4.2 Verificar Chat
- [ ] El chat acepta mensajes
- [ ] Respuestas contextuales inteligentes
- [ ] Sistema RAG funcionando
- [ ] Lead qualification automático

### 4.3 Verificar Inteligencia
- [ ] Send-Cat detecta usuario idle
- [ ] Reacciona cerca del CTA
- [ ] Ofrece ayuda contextual
- [ ] Decisiones basadas en comportamiento

## 🐛 TROUBLESHOOTING

### Error: "Supabase connection failed"
- Verificar VITE_SUPABASE_URL en `.env`
- Verificar VITE_SUPABASE_ANON_KEY en `.env`
- Asegurar que el proyecto Supabase esté activo

### Error: "Chat no responde"
- Verificar que las Edge Functions estén desplegadas
- Verificar OPENAI_API_KEY en Supabase Secrets
- Revisar logs en Supabase Dashboard > Edge Functions > Logs

### Error: "Send-Cat no se mueve"
- Abrir consola del navegador (F12)
- Buscar errores en JavaScript
- Verificar que todos los scripts carguen correctamente

### Error: "No hay ronroneo"
- Verificar que el archivo `ronroneo.wav` esté en la raíz
- Algunos navegadores bloquean autoplay de audio
- Intentar hacer click primero en la página

## 📱 CONFIGURACIÓN MOBILE

La aplicación es responsive, pero para mejor experiencia móvil:

1. Agregar meta viewport (ya incluido)
2. Testear en diferentes dispositivos
3. Ajustar CSS si es necesario en `matrix-theme.css`

## 🚢 DEPLOY A PRODUCCIÓN

### Opción 1: GitHub Pages
```bash
# El repositorio ya está configurado
git push origin main
# Activar GitHub Pages en Settings > Pages
```

### Opción 2: Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Opción 3: Netlify
1. Arrastrar carpeta `frontend` a netlify.com
2. Configurar variables de entorno en Netlify Dashboard

## 📊 MONITOREO

### Analytics (Opcional)
En `.env`:
```env
VITE_GA_ID=G-XXXXXXXXXX
VITE_ANALYTICS_ENABLED=true
```

### Logs de Supabase
- Dashboard > Edge Functions > Logs
- Dashboard > Database > Logs

## 🔄 ACTUALIZACIONES

Para obtener últimas actualizaciones:
```bash
git pull origin main
```

## 📞 SOPORTE

- Issues: [GitHub Issues](https://github.com/Twynzen/landincatpagecalendly/issues)
- Documentación Supabase: [docs.supabase.com](https://docs.supabase.com)
- Documentación OpenAI: [platform.openai.com/docs](https://platform.openai.com/docs)

---

## 🎯 CHECKLIST FINAL

- [ ] `.env` creado con credenciales reales
- [ ] Backend desplegado en Supabase
- [ ] OPENAI_API_KEY configurada en Supabase
- [ ] Send-Cat funcionando y moviéndose
- [ ] Chat respondiendo inteligentemente
- [ ] Calendly link actualizado
- [ ] Probado en móvil
- [ ] Sin errores en consola

¡Listo! Tu Send-Cat está vivo y ayudando a convertir visitantes 🤖✨