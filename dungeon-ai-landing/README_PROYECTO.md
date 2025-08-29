# 🏰 Dungeon AI Landing - Daniel Castiblanco

## 📋 Estado del Proyecto

### ✅ Completado
- **Estructura Angular**: Aplicación Angular 17 con componentes standalone
- **Sistema de servicios**: Datos de consultoría IA extraídos y organizados
- **Componente de fondo**: Canvas con paredes antiguas y circuitos apagados
- **Sistema de antorchas**: Antorchas Matrix posicionadas estratégicamente
- **Arquitectura modular**: Componentes bien organizados y separados
- **Estilos globales**: Variables CSS Matrix y tipografías configuradas

### 🚧 Por Implementar (Componentes creados pero vacíos)

#### 1. **Custom Cursor** (`custom-cursor.component`)
- Cursor en forma de ojo azul-verde en llamas
- Cambio a red cuando se activa modo caza
- Luz débil que enciende antorchas

#### 2. **Cat Guide** (`cat-guide.component`)
- Gato que despierta al ser iluminado
- Sistema de diálogo y tooltips
- Animaciones de sueño/despertar
- Traducción de jeroglíficos cuando está alimentado

#### 3. **Service Hieroglyphs** (`service-hieroglyphs.component`)
- 6 servicios mostrados como jeroglíficos
- Solo visibles cuando hay luz de antorcha
- Click para que el gato traduzca
- Grid responsivo 3x2

#### 4. **Mouse Hunter** (`mouse-hunter.component`)
- Ratones que aparecen en zonas iluminadas
- Sistema de captura con red
- Alimentar al gato con ratones capturados

#### 5. **Consultation Button** (`consultation-button.component`)
- Botón siempre visible que titila
- Se ilumina completamente con luz
- Efecto de circuitos al hover
- Enlace a Calendly

## 🚀 Cómo Ejecutar

```bash
cd frontend/dungeon-ai-landing
npm install
ng serve
```

Abrir en navegador: `http://localhost:4200`

## 📁 Estructura del Proyecto

```
dungeon-ai-landing/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dungeon-background/     ✅ Implementado
│   │   │   ├── torch-system/           ✅ Implementado
│   │   │   ├── custom-cursor/          🚧 Por hacer
│   │   │   ├── cat-guide/              🚧 Por hacer
│   │   │   ├── service-hieroglyphs/    🚧 Por hacer
│   │   │   ├── consultation-button/    🚧 Por hacer
│   │   │   └── mouse-hunter/           🚧 Por hacer
│   │   ├── services/
│   │   │   ├── game-state.service.ts   ✅ Implementado
│   │   │   ├── services-data.service.ts ✅ Implementado
│   │   │   └── cursor-manager.service.ts 🚧 Por hacer
│   │   ├── models/
│   │   │   └── service.model.ts        ✅ Implementado
│   │   └── app.component.*             ✅ Configurado
│   ├── assets/
│   │   ├── cat.png                     ✅ Copiado
│   │   ├── ronroneo.wav                ✅ Copiado
│   │   └── services-data.json          ✅ Datos extraídos
│   └── styles.scss                     ✅ Estilos globales
```

## 🎮 Mecánicas del Juego

### Flujo de Interacción
1. **Inicio**: Usuario ve paredes oscuras con circuitos apagados
2. **Cursor ojo**: Al mover cerca de antorchas, estas se encienden
3. **Iluminación**: Revela jeroglíficos (servicios) y despierta al gato
4. **Gato guía**: Pide ser alimentado para ayudar
5. **Red**: Cambiar cursor a red para cazar ratones
6. **Alimentar gato**: Darle ratones activa traducción
7. **Traducción**: Click en jeroglíficos → gato explica servicios
8. **CTA**: Botón siempre visible, más brillante con luz

## 🎨 Diseño Visual

### Paleta de Colores (Matrix)
- Verde principal: `#00ff44`
- Verde oscuro: `#00aa22`
- Verde glow: `#00ff4480`
- Negro fondo: `#0a0a0a`
- Circuitos apagados: `#001100`

### Tipografías
- Títulos: Orbitron (Google Fonts)
- Texto: Share Tech Mono (Google Fonts)

## 📝 Próximos Pasos Sugeridos

1. **Implementar Custom Cursor**
   - Crear canvas para el cursor personalizado
   - Detectar proximidad con elementos
   - Cambiar entre ojo y red

2. **Desarrollar Cat Guide**
   - Sprite del gato con estados
   - Sistema de diálogos contextuales
   - Animaciones de despertar/dormir

3. **Crear Service Hieroglyphs**
   - Diseñar símbolos jeroglíficos para cada servicio
   - Sistema de revelado con luz
   - Tooltips del gato al hacer click

4. **Sistema Mouse Hunter**
   - Spawn aleatorio de ratones
   - Detección de colisión con red
   - Contador de ratones capturados

5. **Finalizar Consultation Button**
   - Animaciones Matrix
   - Integración con Calendly
   - Efectos de hover especiales

## 🐛 Notas Importantes

- El proyecto usa Angular 17 con componentes standalone
- No uses módulos, todo es standalone
- Los servicios ya tienen los datos de consultoría
- GameStateService maneja el estado global
- Las antorchas ya emiten eventos custom cuando se encienden

## 📞 Contacto

**Daniel Castiblanco**
- Consultor de IA
- Especializado en orquestación y automatización
- [Agendar consultoría](https://calendly.com/danielcastiblanco)