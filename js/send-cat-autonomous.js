// ============================================
// SEND-CAT AUTONOMOUS - Sistema de movimiento y awareness
// ============================================

class SendCatAutonomous {
    constructor() {
        this.catElement = document.getElementById('floatingCat');
        this.name = "Send-Cat";
        
        // Posición actual y target
        this.position = { x: 30, y: 30 };
        this.targetPosition = null;
        this.isMoving = false;
        
        // Awareness del contexto
        this.awareness = {
            currentSection: null,
            mousePosition: { x: 0, y: 0 },
            lastActivity: Date.now(),
            idleTime: 0,
            scrollPosition: 0,
            timeOnSections: {},
            hoveredElement: null
        };
        
        // Estados del gato
        this.state = 'idle'; // idle, moving, talking, guiding, excited
        this.mode = 'explore'; // explore, guide, assist, celebrate
        
        // Memoria de interacciones
        this.memory = {
            hasGreeted: false,
            sectionsVisited: new Set(),
            timesNearCTA: 0,
            userIndustry: null,
            conversationPhase: 0
        };
        
        // Configuración de comportamiento
        this.config = {
            moveSpeed: 1.5,
            idleThreshold: 5000,
            ctaProximity: 200,
            bubbleTimeout: 5000
        };
        
        this.init();
    }
    
    init() {
        console.log('🤖 Send-Cat Autonomous System iniciado');
        
        // Iniciar tracking
        this.startContextTracking();
        this.startBehaviorLoop();
        
        // Posición inicial
        this.setPosition(window.innerWidth - 150, window.innerHeight - 150);
        
        // Saludar después de 1 segundo
        setTimeout(() => this.greet(), 1000);
    }
    
    // ========== MOVIMIENTO ==========
    
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.catElement.style.right = 'auto';
        this.catElement.style.bottom = 'auto';
        this.catElement.style.left = `${x}px`;
        this.catElement.style.top = `${y}px`;
        this.catElement.style.position = 'fixed';
    }
    
    moveToPosition(x, y, callback) {
        if (this.isMoving) return;
        
        this.isMoving = true;
        this.targetPosition = { x, y };
        this.state = 'moving';
        
        const distance = Math.sqrt(
            Math.pow(x - this.position.x, 2) + 
            Math.pow(y - this.position.y, 2)
        );
        
        const duration = (distance / 200) * this.config.moveSpeed;
        
        // Animación suave
        const startX = this.position.x;
        const startY = this.position.y;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            
            // Easing function
            const easeProgress = this.easeInOutQuad(progress);
            
            const currentX = startX + (x - startX) * easeProgress;
            const currentY = startY + (y - startY) * easeProgress;
            
            this.setPosition(currentX, currentY);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isMoving = false;
                this.state = 'idle';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    moveToElement(selector, offset = { x: -100, y: -50 }) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + offset.x;
        const targetY = rect.top + rect.height / 2 + offset.y;
        
        this.moveToPosition(targetX, targetY);
    }
    
    // ========== AWARENESS Y TRACKING ==========
    
    startContextTracking() {
        // Track mouse
        document.addEventListener('mousemove', (e) => {
            this.awareness.mousePosition = { x: e.clientX, y: e.clientY };
            this.awareness.lastActivity = Date.now();
        });
        
        // Track scroll
        document.addEventListener('scroll', () => {
            this.awareness.scrollPosition = window.scrollY;
            this.awareness.lastActivity = Date.now();
            this.detectCurrentSection();
        });
        
        // Track hover en elementos importantes
        const importantElements = ['#scheduleCall', '.hero-title', '.chat-section'];
        importantElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('mouseenter', () => {
                    this.awareness.hoveredElement = selector;
                    this.onImportantHover(selector);
                });
                element.addEventListener('mouseleave', () => {
                    this.awareness.hoveredElement = null;
                });
            }
        });
        
        // Track idle time
        setInterval(() => {
            this.awareness.idleTime = Date.now() - this.awareness.lastActivity;
            
            if (this.awareness.idleTime > this.config.idleThreshold) {
                this.onUserIdle();
            }
        }, 1000);
    }
    
    detectCurrentSection() {
        const sections = document.querySelectorAll('section');
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = section.className;
            }
        });
        
        if (currentSection !== this.awareness.currentSection) {
            this.awareness.currentSection = currentSection;
            this.onSectionChange(currentSection);
        }
        
        // Track time on section
        if (currentSection) {
            if (!this.awareness.timeOnSections[currentSection]) {
                this.awareness.timeOnSections[currentSection] = 0;
            }
            this.awareness.timeOnSections[currentSection]++;
        }
    }
    
    // ========== COMPORTAMIENTOS ==========
    
    startBehaviorLoop() {
        setInterval(() => {
            this.analyzeBehavior();
        }, 2000);
    }
    
    analyzeBehavior() {
        // Si el usuario está idle y no hemos ayudado recientemente
        if (this.awareness.idleTime > 5000 && !this.isMoving) {
            this.offerContextualHelp();
        }
        
        // Si está cerca del CTA principal
        const ctaButton = document.querySelector('#scheduleCall');
        if (ctaButton) {
            const rect = ctaButton.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(this.awareness.mousePosition.x - rect.left - rect.width/2, 2) +
                Math.pow(this.awareness.mousePosition.y - rect.top - rect.height/2, 2)
            );
            
            if (distance < this.config.ctaProximity && this.memory.timesNearCTA < 2) {
                this.encourageScheduling();
                this.memory.timesNearCTA++;
            }
        }
    }
    
    // ========== DIÁLOGOS CONTEXTUALES ==========
    
    speak(message, duration = 5000) {
        // Remover burbuja anterior si existe
        const existingBubble = document.querySelector('.send-cat-bubble');
        if (existingBubble) {
            existingBubble.remove();
        }
        
        // Crear nueva burbuja
        const bubble = document.createElement('div');
        bubble.className = 'send-cat-bubble';
        bubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-name">Send-Cat:</span>
                <p>${message}</p>
            </div>
            <div class="bubble-tail"></div>
        `;
        
        // Posicionar cerca del gato
        bubble.style.position = 'fixed';
        bubble.style.left = `${this.position.x + 120}px`;
        bubble.style.top = `${this.position.y - 20}px`;
        bubble.style.zIndex = '10000';
        
        document.body.appendChild(bubble);
        
        // Animar entrada
        bubble.style.opacity = '0';
        bubble.style.transform = 'scale(0.8)';
        setTimeout(() => {
            bubble.style.transition = 'all 0.3s ease';
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1)';
        }, 10);
        
        // Auto-remover
        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8)';
            setTimeout(() => bubble.remove(), 300);
        }, duration);
        
        // Actualizar estado del gato
        this.setState('talking');
        setTimeout(() => this.setState('idle'), 1000);
    }
    
    // ========== INTERACCIONES ESPECÍFICAS ==========
    
    greet() {
        if (this.memory.hasGreeted) return;
        
        this.moveToPosition(window.innerWidth / 2, window.innerHeight / 2, () => {
            this.speak("¡Hola! Soy Send-Cat 🤖 Asistente de Daniel Castiblanco. ¿Te guío por sus servicios de consultoría IA?", 6000);
            this.memory.hasGreeted = true;
        });
    }
    
    onSectionChange(section) {
        if (!this.memory.sectionsVisited.has(section)) {
            this.memory.sectionsVisited.add(section);
            
            const sectionMessages = {
                'hero': "Daniel ha ayudado a +50 empresas a implementar IA práctica",
                'chat-section': "Cuéntame sobre tu negocio y veamos cómo la IA puede ayudarte",
                'cta-section': "¡30 minutos gratis! Daniel analiza tu caso sin compromiso"
            };
            
            if (sectionMessages[section]) {
                setTimeout(() => {
                    this.speak(sectionMessages[section]);
                }, 1000);
            }
        }
    }
    
    onImportantHover(selector) {
        const hoverMessages = {
            '#scheduleCall': "¡Excelente elección! Daniel tiene disponibilidad esta semana",
            '.hero-title': "Daniel transforma procesos manuales en sistemas inteligentes",
            '.chat-section': "Responde unas preguntas y Daniel preparará una propuesta personalizada"
        };
        
        if (hoverMessages[selector] && !this.isMoving) {
            this.moveToElement(selector, { x: -150, y: -100 });
            setTimeout(() => {
                this.speak(hoverMessages[selector]);
            }, 500);
        }
    }
    
    onUserIdle() {
        // Solo ayudar cada 30 segundos máximo
        if (Date.now() - (this.lastIdleHelp || 0) < 30000) return;
        
        this.lastIdleHelp = Date.now();
        this.offerContextualHelp();
    }
    
    offerContextualHelp() {
        const section = this.awareness.currentSection;
        const helpMessages = {
            'hero': "¿Necesitas ayuda? Daniel especializa en RAG, agentes y automatización",
            'chat-section': "¿Tienes dudas? Escribe tu pregunta abajo",
            'cta-section': "La consultoría inicial es gratuita y sin compromiso",
            'default': "¿Explorando? Daniel tiene casos de éxito en educación, SaaS y retail"
        };
        
        const message = helpMessages[section] || helpMessages['default'];
        this.speak(message);
        
        // Moverse suavemente para llamar atención
        const wiggleX = this.position.x + (Math.random() - 0.5) * 100;
        const wiggleY = this.position.y + (Math.random() - 0.5) * 50;
        this.moveToPosition(wiggleX, wiggleY);
    }
    
    encourageScheduling() {
        this.setState('excited');
        this.moveToElement('#scheduleCall', { x: -120, y: -80 });
        
        const encouragements = [
            "¡Este es el momento! Agenda con Daniel ahora",
            "Daniel tiene 3 slots disponibles esta semana",
            "Los mejores resultados empiezan con una conversación"
        ];
        
        const message = encouragements[Math.floor(Math.random() * encouragements.length)];
        setTimeout(() => this.speak(message, 6000), 1000);
    }
    
    // ========== UTILIDADES ==========
    
    setState(state) {
        this.state = state;
        // Coordinar con el sistema de ronroneo original
        if (window.floatingCat) {
            if (state === 'excited') {
                window.floatingCat.catSvg.classList.add('excited');
            } else {
                window.floatingCat.catSvg.classList.remove('excited');
            }
            
            // Mantener funcionalidad de ronroneo
            if (state === 'talking') {
                window.floatingCat.setState('purring');
            } else if (state === 'idle') {
                window.floatingCat.setState('idle');
            }
        }
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // ========== API PÚBLICA ==========
    
    goTo(selector) {
        this.moveToElement(selector);
    }
    
    say(message) {
        this.speak(message);
    }
    
    celebrate() {
        this.setState('excited');
        // Hacer un pequeño baile
        const originalX = this.position.x;
        const originalY = this.position.y;
        
        this.moveToPosition(originalX - 30, originalY, () => {
            this.moveToPosition(originalX + 30, originalY, () => {
                this.moveToPosition(originalX, originalY - 30, () => {
                    this.moveToPosition(originalX, originalY);
                });
            });
        });
        
        this.speak("¡Genial! 🎉");
    }
}

// Estilos para las burbujas de diálogo
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .send-cat-bubble {
        background: var(--terminal-bg, rgba(13, 17, 23, 0.95));
        border: 1px solid var(--matrix-green-dim, #238636);
        border-radius: 12px;
        padding: 12px 16px;
        max-width: 250px;
        box-shadow: 0 4px 20px rgba(0, 212, 85, 0.2);
        font-family: 'Share Tech Mono', monospace;
        color: var(--matrix-green-text, #7ee787);
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .send-cat-bubble .bubble-content {
        position: relative;
    }
    
    .send-cat-bubble .bubble-name {
        color: var(--matrix-green-bright, #26d467);
        font-weight: bold;
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
    }
    
    .send-cat-bubble p {
        margin: 0;
        line-height: 1.4;
    }
    
    .send-cat-bubble .bubble-tail {
        position: absolute;
        bottom: 10px;
        left: -8px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px 8px 8px 0;
        border-color: transparent var(--terminal-bg, rgba(13, 17, 23, 0.95)) transparent transparent;
    }
    
    .send-cat-bubble .bubble-tail::before {
        content: '';
        position: absolute;
        bottom: -8px;
        left: -1px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px 8px 8px 0;
        border-color: transparent var(--matrix-green-dim, #238636) transparent transparent;
    }
    
    #floatingCat.excited {
        animation: bounce 0.5s ease infinite alternate;
    }
    
    @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(styleSheet);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el gato flotante esté inicializado
    setTimeout(() => {
        window.sendCat = new SendCatAutonomous();
        console.log('🚀 Send-Cat Autonomous activado');
    }, 500);
});

// Exportar para uso global
window.SendCatAutonomous = SendCatAutonomous;