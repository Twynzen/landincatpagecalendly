# 🏰 CLAUDE.md - Dungeon AI Landing Angular

## 🎯 **OBJETIVO DEL PROYECTO**
Landing page profesional Matrix para **Daniel Castiblanco - Consultor de IA** con sistema de iluminación por proximidad de cursor. Los textos se revelan mediante animaciones Matrix "revelation" al acercarse el cursor.

## 📋 **ESTADO ACTUAL - FUNCIONAL**
**Fecha**: Agosto 30, 2025
- ✅ Sistema de iluminación por proximidad funcional
- ✅ 6 antorchas Tech Matrix (pueden encenderse permanentemente)
- ✅ Animaciones Matrix revelation automáticas en todos los textos
- ✅ Cursor personalizado (fire/torch/net)
- ✅ Full SCSS + CSS animations (sin Canvas)
- ✅ Responsive design
- 🔒 `CatGuideComponent` y `CursorInventoryComponent` deshabilitados (posible uso futuro)

## 🏗️ **ESTRUCTURA DEL PROYECTO**

### Componentes Activos:
- **`app.component`** - Main container con hero section
- **`circuits-background`** - Fondo con circuitos CSS animados
- **`torch-system`** - 6 antorchas que se encienden permanentemente
- **`service-hieroglyphs`** - 6 servicios de consultoría en grid 3x2
- **`consultation-button`** - Botón CTA con pulso sutil verde y ondas de carga
- **`custom-cursor`** - Cursor personalizado fire/torch/net

### Servicios:
- **`lighting.service`** - Control de iluminación por proximidad
- **`services-data.service`** - Data de los 6 servicios
- **`game-state.service`** - Estado general de la app

## ⚡ **MECÁNICA DE ILUMINACIÓN**

### Sistema "Raspa y Ganas":
```
Cursor se acerca a elemento → Se ilumina gradualmente → 
Animación Matrix revelation → Permanece iluminado
```

### Elementos que se Iluminan:
1. **Hero Section** (app.component):
   - "DANIEL CASTIBLANCO" (pequeño)
   - "CONSULTOR DE IA" (grande)  
   - "Para PERSONAS y NEGOCIOS" (blur effect)

2. **Services Section**:
   - Header "ESPECIALIDADES DE CONSULTORÍA"
   - 6 cards individuales con títulos

3. **Consultation Button**:
   - Estado apagado: Pulso sutil verde cada 3s (texto + contorno)
   - Estado iluminado: 4 ondas de carga concéntricas + verde brillante

4. **Antorchas**:
   - Se encienden permanentemente al hover/click

## 🎨 **DISEÑO VISUAL**

### Layout Base (según `landinpreview.png`):
- **Header**: Títulos principales arriba
- **Services**: Grid 3x2 profesional con íconos SVG
- **CTA**: Botón verde Matrix prominente
- **Background**: Circuitos CSS que se iluminan

### Animaciones Matrix Revelation:
- **Técnica**: Caracteres aleatorios (`01!@#$%^&*`) que se revelan desordenadamente
- **Timing**: 80ms por carácter
- **Efecto**: Texto se "hackea/descifra" mágicamente
- **Color**: Verde Matrix `#00ff44` con glow

### Typography:
- **Font**: Courier New (monospace robótico)
- **Sizes**: Según `landinpreview.png` exactos
- **Effects**: Text-shadow brillante verde
- **Botón CTA**: Glitchy Demo Italic (apagado) → Arial (iluminado) con pulso sutil

## 🔧 **COMANDOS ÚTILES**

```bash
ng serve          # Testing local
ng build          # Build producción  
ng lint          # Verificar código
```

## 📝 **NOTAS PARA DESARROLLADOR**

### Reglas Importantes:
- **Full SCSS**: No usar Canvas, todo con CSS animations
- **Arquitectura modular**: Componentes separados y servicios
- **Comunicación constante**: Preguntar ante dudas
- **Design Preview**: Usar `design-preview.html` para cambios visuales

### Componentes Deshabilitados:
- `CatGuideComponent` - Gato interactivo (posible uso futuro)
- `CursorInventoryComponent` - Arsenal de cursors (posible uso futuro)

### Próximas Mejoras Potenciales:
- Reactivar componentes deshabilitados
- Nuevas animaciones específicas
- Optimizaciones de performance
- Nuevas mecánicas de interacción

---

**🎯 FILOSOFÍA**: Landing profesional Matrix con interacción mágica - la información se revela gradualmente mediante proximidad del cursor, creando experiencia inmersiva pero elegante.