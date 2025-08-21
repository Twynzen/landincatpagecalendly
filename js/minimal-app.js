// ============================================
// Aplicación Principal Minimalista
// ============================================

class MinimalChatApp {
    constructor() {
        this.chatEngine = new IntelligentChatEngine();
        this.elements = this.initializeElements();
        this.isTyping = false;
        this.conversation = [];
        this.sessionId = this.generateSessionId();
        
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
            statusText: document.querySelector('.status-text')
        };
    }
    
    // Inicializar aplicación
    init() {
        this.setupEventListeners();
        this.setupCalendlyLinks();
        this.focusInput();
        
        // Log de inicio
        console.log('💬 Chat inicializado');
        this.trackEvent('chat_loaded');
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
        
        // Focus automático en input
        this.elements.chatInput.addEventListener('blur', () => {
            if (CONFIG.AUTO_FOCUS) {
                setTimeout(() => this.elements.chatInput.focus(), 100);
            }
        });
    }
    
    // Configurar enlaces de Calendly
    setupCalendlyLinks() {
        this.elements.scheduleButtons.forEach(button => {
            button.href = CONFIG.CALENDLY_URL;
            button.target = '_blank';
            button.addEventListener('click', () => {
                this.trackEvent('schedule_clicked');
            });
        });
    }
    
    // Enviar mensaje
    async sendMessage() {
        const message = this.elements.chatInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.elements.chatInput.value = '';
        
        // Guardar en conversación
        this.conversation.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Mostrar typing
        await this.showTyping();
        
        // Procesar con el motor de chat
        const response = this.chatEngine.processUserResponse(message);
        
        // Mostrar respuesta
        await this.handleResponse(response);
        
        // Guardar lead si es necesario
        if (response.type === 'closing') {
            await this.saveLead(response.summary, response.classification);
        }
    }
    
    // Manejar respuesta del motor
    async handleResponse(response) {
        this.hideTyping();
        
        // Agregar respuesta del asistente
        this.addMessage(response.message, 'assistant');
        
        // Guardar en conversación
        this.conversation.push({
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
        });
        
        // Manejar acciones especiales
        if (response.showScheduling) {
            await this.delay(500);
            this.showSchedulingOptions();
        }
        
        if (response.type === 'closing') {
            await this.delay(1000);
            this.showCompletionModal();
        }
        
        // Trackear progreso
        this.trackEvent('question_answered', {
            question_count: this.chatEngine.conversationState.questionCount,
            stage: this.chatEngine.conversationState.stage
        });
    }
    
    // Agregar mensaje al chat
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Procesar contenido para múltiples párrafos
        const paragraphs = content.split('\n').filter(p => p.trim());
        paragraphs.forEach((paragraph, index) => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            contentDiv.appendChild(p);
        });
        
        messageDiv.appendChild(contentDiv);
        this.elements.chatMessages.appendChild(messageDiv);
        
        // Scroll al final
        this.scrollToBottom();
        
        // Animación de entrada
        requestAnimationFrame(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(10px)';
            requestAnimationFrame(() => {
                messageDiv.style.transition = 'all 0.3s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Mostrar indicador de typing
    async showTyping() {
        this.isTyping = true;
        this.disableInput();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        // Actualizar estado
        this.elements.statusText.textContent = 'Escribiendo...';
        
        // Delay realista
        await this.delay(CONFIG.TYPING_DELAY);
        
        // Remover typing
        typingDiv.remove();
        this.typingElement = null;
    }
    
    // Ocultar indicador de typing
    hideTyping() {
        this.isTyping = false;
        this.enableInput();
        this.elements.statusText.textContent = 'Asistente disponible';
    }
    
    // Mostrar opciones de agendamiento
    showSchedulingOptions() {
        const schedulingDiv = document.createElement('div');
        schedulingDiv.className = 'message assistant scheduling';
        schedulingDiv.innerHTML = `
            <div class="message-content">
                <p><strong>¿Listo para agendar?</strong></p>
                <a href="${CONFIG.CALENDLY_URL}" target="_blank" class="inline-schedule-btn">
                    📅 Reservar consultoría gratuita
                </a>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(schedulingDiv);
        this.scrollToBottom();
        
        // Trackear cuando se muestra
        this.trackEvent('scheduling_options_shown');
    }
    
    // Mostrar modal de completación
    showCompletionModal() {
        this.elements.completionModal.classList.remove('hidden');
        this.trackEvent('chat_completed');
    }
    
    // Scroll al final del chat
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    // Habilitar input
    enableInput() {
        this.elements.chatInput.disabled = false;
        this.elements.sendButton.disabled = false;
        if (CONFIG.AUTO_FOCUS) {
            this.elements.chatInput.focus();
        }
    }
    
    // Deshabilitar input
    disableInput() {
        this.elements.chatInput.disabled = true;
        this.elements.sendButton.disabled = true;
    }
    
    // Focus en input
    focusInput() {
        if (CONFIG.AUTO_FOCUS) {
            setTimeout(() => this.elements.chatInput.focus(), 500);
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
                created_at: new Date().toISOString()
            };
            
            if (CONFIG.IS_DEVELOPMENT) {
                // Mock para desarrollo
                console.log('💾 Lead guardado (mock):', leadData);
                this.trackEvent('lead_saved_mock', { classification });
            } else {
                // Enviar a Supabase en producción
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
    
    // Trackear eventos
    trackEvent(eventName, data = {}) {
        if (CONFIG.ANALYTICS_ENABLED && window.gtag) {
            window.gtag('event', eventName, {
                event_category: 'chat',
                ...data
            });
        }
        
        // Log para desarrollo
        console.log(`📊 ${eventName}:`, data);
    }
    
    // Generar ID de sesión
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Utilidad para delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Reset chat
    reset() {
        this.chatEngine.reset();
        this.conversation = [];
        this.sessionId = this.generateSessionId();
        
        // Limpiar UI
        const messages = this.elements.chatMessages.querySelectorAll('.message:not(.initial)');
        messages.forEach(msg => msg.remove());
        
        this.elements.completionModal.classList.add('hidden');
        this.enableInput();
        this.focusInput();
        
        console.log('🔄 Chat reiniciado');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicación
    window.chatApp = new MinimalChatApp();
    
    // Agregar CSS para botones inline
    const style = document.createElement('style');
    style.textContent = `
        .inline-schedule-btn {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            background: var(--accent);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: all var(--transition);
        }
        
        .inline-schedule-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);
    
    // Log de bienvenida
    console.log('%c💎 AI Consulting Landing v2.0', 'color: #5e72e4; font-size: 16px; font-weight: bold;');
    console.log('%cPowered by Daniel Castiblanco', 'color: #999; font-size: 12px;');
});

// Exportar para uso global
window.MinimalChatApp = MinimalChatApp;