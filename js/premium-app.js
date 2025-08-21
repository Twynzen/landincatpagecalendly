// ============================================
// Aplicación Premium con Efectos y Animaciones
// ============================================

class PremiumChatApp {
    constructor() {
        this.chatEngine = new IntelligentChatEngine();
        this.typewriter = new TypewriterEngine();
        this.elements = this.initializeElements();
        this.conversation = [];
        this.sessionId = this.generateSessionId();
        this.isProcessing = false;
        
        this.init();
    }
    
    // Inicializar elementos del DOM
    initializeElements() {
        return {
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            sendButton: document.getElementById('sendMessage'),
            scheduleButtons: document.querySelectorAll('#scheduleCall, #modalSchedule'),
            completionModal: document.getElementById('completionModal'),
            starfield: document.getElementById('starfield')
        };
    }
    
    // Inicializar aplicación
    async init() {
        this.setupEventListeners();
        this.setupCalendlyLinks();
        this.initializeStarfield();
        this.setupAnimationObserver();
        
        // Delay para que carguen otros scripts
        await this.delay(500);
        this.focusInput();
        
        console.log('🚀 Premium AI Landing initialized');
        this.trackEvent('app_loaded');
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Enviar mensaje
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar
        this.elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Eventos de typing para el gato
        this.elements.chatInput.addEventListener('input', () => {
            if (window.aiCatMascot) {
                window.aiCatMascot.onUserTyping();
            }
        });
        
        this.elements.chatInput.addEventListener('focus', () => {
            if (window.aiCatMascot) {
                window.aiCatMascot.setState('listening');
            }
        });
        
        this.elements.chatInput.addEventListener('blur', () => {
            if (window.aiCatMascot && !this.isProcessing) {
                window.aiCatMascot.setState('idle');
            }
        });
        
        // Click fuera del modal para cerrar
        this.elements.completionModal.addEventListener('click', (e) => {
            if (e.target === this.elements.completionModal || 
                e.target.classList.contains('modal-backdrop')) {
                this.closeModal();
            }
        });
    }
    
    // Configurar enlaces de Calendly
    setupCalendlyLinks() {
        this.elements.scheduleButtons.forEach(button => {
            button.href = CONFIG.CALENDLY_URL;
            button.target = '_blank';
            button.addEventListener('click', () => {
                this.trackEvent('schedule_clicked', {
                    source: button.id || 'unknown'
                });
            });
        });
    }
    
    // Inicializar starfield
    initializeStarfield() {
        const canvas = this.elements.starfield;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Redimensionar canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Crear estrellas
        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.8 + 0.2,
            speed: Math.random() * 0.5 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.01
        }));
        
        // Animar estrellas
        const animateStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            stars.forEach(star => {
                // Movimiento sutil
                star.y += star.speed;
                star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
                
                // Wrap around
                if (star.y > canvas.height) {
                    star.y = -star.size;
                    star.x = Math.random() * canvas.width;
                }
                
                // Dibujar estrella
                ctx.save();
                ctx.globalAlpha = Math.max(0.1, Math.min(1, star.opacity));
                ctx.fillStyle = '#00ff88';
                ctx.shadowBlur = star.size * 2;
                ctx.shadowColor = '#00ff88';
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            
            requestAnimationFrame(animateStars);
        };
        
        animateStars();
    }
    
    // Configurar observer para animaciones
    setupAnimationObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observar elementos animables
        document.querySelectorAll('.hero, .interaction-section, .cta-section').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Enviar mensaje
    async sendMessage() {
        const message = this.elements.chatInput.value.trim();
        if (!message || this.isProcessing) return;
        
        this.isProcessing = true;
        
        // Agregar mensaje del usuario con animación
        await this.addUserMessage(message);
        this.elements.chatInput.value = '';
        
        // Guardar en conversación
        this.conversation.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Gato reacciona
        if (window.aiCatMascot) {
            window.aiCatMascot.onAIResponding();
        }
        
        // Mostrar typing indicator
        const typingElement = await this.showTypingIndicator();
        
        // Procesar con el motor de chat
        await this.delay(800 + Math.random() * 400); // Delay realista
        const response = this.chatEngine.processUserResponse(message);
        
        // Remover typing indicator
        typingElement.remove();
        
        // Mostrar respuesta con efecto de escritura
        await this.addAssistantMessage(response.message);
        
        // Guardar respuesta en conversación
        this.conversation.push({
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
        });
        
        // Manejar acciones especiales
        if (response.showScheduling) {
            await this.delay(500);
            this.showInlineScheduling();
        }
        
        if (response.type === 'closing') {
            await this.delay(1000);
            await this.saveLead(response.summary, response.classification);
            this.showCompletionModal();
            
            if (window.aiCatMascot) {
                window.aiCatMascot.onChatComplete();
            }
        }
        
        this.isProcessing = false;
        this.focusInput();
        
        // Trackear progreso
        this.trackEvent('message_sent', {
            message_count: this.conversation.filter(m => m.role === 'user').length,
            response_type: response.type || 'normal'
        });
    }
    
    // Agregar mensaje del usuario
    async addUserMessage(content) {
        const messageDiv = this.createMessageElement('user', content);
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Animación de entrada
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(20px)';
        
        await this.delay(50);
        
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(0)';
    }
    
    // Agregar mensaje del asistente con efecto de escritura
    async addAssistantMessage(content) {
        const messageDiv = this.createMessageElement('assistant');
        this.elements.chatMessages.appendChild(messageDiv);
        
        const contentDiv = messageDiv.querySelector('.message-content');
        
        // Animación de entrada del contenedor
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-20px)';
        
        await this.delay(100);
        
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(0)';
        
        await this.delay(200);
        
        // Efecto de escritura
        await this.typewriter.typeMultipleParagraphs(
            contentDiv,
            content.split('\n').filter(p => p.trim()),
            {
                speed: 25,
                paragraphDelay: 300,
                onStart: () => {
                    if (window.aiCatMascot) {
                        window.aiCatMascot.setState('talking');
                    }
                },
                onComplete: () => {
                    if (window.aiCatMascot) {
                        window.aiCatMascot.setState('idle');
                    }
                    this.scrollToBottom();
                }
            }
        );
    }
    
    // Crear elemento de mensaje
    createMessageElement(sender, content = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '👤' : '🤖';
        
        // Contenido
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (content) {
            // Para mensajes del usuario, agregar directamente
            const p = document.createElement('p');
            p.textContent = content;
            contentDiv.appendChild(p);
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }
    
    // Mostrar indicador de typing
    async showTypingIndicator() {
        const typingDiv = this.createMessageElement('assistant');
        const contentDiv = typingDiv.querySelector('.message-content');
        
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        // Animación de entrada
        typingDiv.style.opacity = '0';
        typingDiv.style.transform = 'translateX(-20px)';
        
        await this.delay(50);
        
        typingDiv.style.transition = 'all 0.3s ease';
        typingDiv.style.opacity = '1';
        typingDiv.style.transform = 'translateX(0)';
        
        return typingDiv;
    }
    
    // Mostrar opción de agendamiento inline
    showInlineScheduling() {
        const schedulingDiv = document.createElement('div');
        schedulingDiv.className = 'message assistant scheduling';
        schedulingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p><strong>¿Listo para dar el siguiente paso?</strong></p>
                <a href="${CONFIG.CALENDLY_URL}" target="_blank" class="inline-schedule-btn">
                    📅 Reservar consultoría gratuita
                </a>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(schedulingDiv);
        this.scrollToBottom();
        
        // Animación de entrada
        schedulingDiv.style.opacity = '0';
        schedulingDiv.style.transform = 'scale(0.9)';
        
        requestAnimationFrame(() => {
            schedulingDiv.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            schedulingDiv.style.opacity = '1';
            schedulingDiv.style.transform = 'scale(1)';
        });
        
        // Trackear cuando se muestra
        this.trackEvent('inline_scheduling_shown');
    }
    
    // Mostrar modal de completación
    showCompletionModal() {
        this.elements.completionModal.classList.remove('hidden');
        
        // Animación de entrada
        const content = this.elements.completionModal.querySelector('.modal-content');
        content.style.transform = 'scale(0.9) translateY(50px)';
        content.style.opacity = '0';
        
        requestAnimationFrame(() => {
            content.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            content.style.transform = 'scale(1) translateY(0)';
            content.style.opacity = '1';
        });
        
        this.trackEvent('completion_modal_shown');
    }
    
    // Cerrar modal
    closeModal() {
        const content = this.elements.completionModal.querySelector('.modal-content');
        content.style.transition = 'all 0.3s ease';
        content.style.transform = 'scale(0.9) translateY(20px)';
        content.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.completionModal.classList.add('hidden');
        }, 300);
    }
    
    // Scroll al final del chat
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    // Focus en input
    focusInput() {
        if (CONFIG.AUTO_FOCUS && !this.isProcessing) {
            setTimeout(() => this.elements.chatInput.focus(), 100);
        }
    }
    
    // Guardar lead
    async saveLead(summary, classification) {
        try {
            const leadData = {
                session_id: this.sessionId,
                conversation: this.conversation,
                summary: summary,
                classification: classification,
                user_agent: navigator.userAgent,
                referrer: document.referrer,
                url: window.location.href,
                created_at: new Date().toISOString(),
                interaction_quality: this.calculateInteractionQuality()
            };
            
            if (CONFIG.IS_DEVELOPMENT) {
                console.log('💾 Lead guardado (desarrollo):', leadData);
                this.trackEvent('lead_saved_dev', { classification });
            } else {
                const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/lead`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify(leadData)
                });
                
                if (response.ok) {
                    console.log('✅ Lead guardado exitosamente');
                    this.trackEvent('lead_saved', { classification });
                } else {
                    console.error('❌ Error guardando lead:', response.status);
                }
            }
        } catch (error) {
            console.error('Error al guardar lead:', error);
        }
    }
    
    // Calcular calidad de interacción
    calculateInteractionQuality() {
        const userMessages = this.conversation.filter(m => m.role === 'user');
        const totalLength = userMessages.reduce((sum, m) => sum + m.content.length, 0);
        const avgLength = totalLength / userMessages.length;
        
        let score = 0;
        
        // Más mensajes = mayor engagement
        if (userMessages.length >= 5) score += 30;
        else if (userMessages.length >= 3) score += 20;
        else score += 10;
        
        // Mensajes más largos = mayor interés
        if (avgLength >= 50) score += 30;
        else if (avgLength >= 20) score += 20;
        else score += 10;
        
        // Tiempo en la página
        const timeSpent = Date.now() - this.startTime;
        if (timeSpent >= 300000) score += 25; // 5+ minutos
        else if (timeSpent >= 120000) score += 15; // 2+ minutos
        else score += 5;
        
        // Completó la conversación
        if (this.conversation.length >= 10) score += 15;
        
        return Math.min(100, score);
    }
    
    // Trackear eventos
    trackEvent(eventName, data = {}) {
        if (CONFIG.ANALYTICS_ENABLED && window.gtag) {
            window.gtag('event', eventName, {
                event_category: 'premium_chat',
                session_id: this.sessionId,
                ...data
            });
        }
        
        console.log(`📊 ${eventName}:`, data);
    }
    
    // Generar ID de sesión
    generateSessionId() {
        return 'premium_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Utilidad para delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Reset completo
    reset() {
        this.chatEngine.reset();
        this.conversation = [];
        this.sessionId = this.generateSessionId();
        this.isProcessing = false;
        
        // Limpiar chat
        const messages = this.elements.chatMessages.querySelectorAll('.message:not(.initial)');
        messages.forEach(msg => msg.remove());
        
        this.closeModal();
        this.focusInput();
        
        if (window.aiCatMascot) {
            window.aiCatMascot.setState('idle');
        }
        
        console.log('🔄 App reiniciada');
    }
}

// CSS adicional para elementos dinámicos
const additionalCSS = `
.inline-schedule-btn {
    display: inline-block;
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--gradient-primary);
    color: var(--text-dark);
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all var(--transition-base);
    border: 2px solid transparent;
}

.inline-schedule-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-green);
    background: var(--accent-glow);
}

.animate-in {
    animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

#starfield {
    opacity: 0.7;
}
`;

// Agregar CSS adicional
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que otros scripts carguen
    setTimeout(() => {
        window.premiumChatApp = new PremiumChatApp();
        window.premiumChatApp.startTime = Date.now();
    }, 100);
    
    // Log de bienvenida
    console.log('%c🌟 Premium AI Landing v3.0', 'color: #00ff88; font-size: 16px; font-weight: bold;');
    console.log('%c✨ Con efectos de escritura y mascota interactiva', 'color: #66ff99; font-size: 12px;');
    console.log('%c💚 Creado con amor para Daniel Castiblanco', 'color: #b3d9b3; font-size: 10px;');
});

// Exportar para uso global
window.PremiumChatApp = PremiumChatApp;