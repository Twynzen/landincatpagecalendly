// ============================================
// Chat Manager - Gestiona la conversación con IA
// ============================================

class ChatManager {
    constructor() {
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        this.isClosed = false;
        this.elements = this.initElements();
        this.initEventListeners();
    }
    
    // Generar ID único de sesión
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Inicializar elementos del DOM
    initElements() {
        return {
            modal: document.getElementById('chatModal'),
            messages: document.getElementById('chatMessages'),
            input: document.getElementById('chatInput'),
            sendBtn: document.getElementById('sendMessage'),
            status: document.getElementById('chatStatus'),
            statusDot: document.querySelector('.status-dot'),
            statusText: document.querySelector('.status-text'),
            actions: document.getElementById('chatActions'),
            closeBtn: document.getElementById('closeChat')
        };
    }
    
    // Inicializar event listeners
    initEventListeners() {
        // Enviar mensaje
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Cerrar modal
        this.elements.closeBtn.addEventListener('click', () => this.close());
        
        // Click fuera del modal para cerrar
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal || e.target.classList.contains('modal-backdrop')) {
                this.close();
            }
        });
    }
    
    // Abrir chat
    open() {
        this.elements.modal.classList.remove('hidden');
        this.elements.modal.setAttribute('aria-hidden', 'false');
        
        // Si es primera vez, mostrar mensaje inicial
        if (this.messages.length === 0) {
            this.addMessage(INITIAL_MESSAGE, 'assistant');
            this.setStatus('connected', 'Conectado');
            this.enableInput();
        }
        
        // Focus en input
        setTimeout(() => this.elements.input.focus(), 100);
    }
    
    // Cerrar chat
    close() {
        this.elements.modal.classList.add('hidden');
        this.elements.modal.setAttribute('aria-hidden', 'true');
    }
    
    // Agregar mensaje al chat
    addMessage(content, sender = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender}-avatar`;
        avatar.textContent = sender === 'user' ? 'TÚ' : 'IA';
        
        // Contenido
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'assistant' && content === 'typing') {
            // Indicador de typing
            contentDiv.innerHTML = `
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
        } else {
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.elements.messages.appendChild(messageDiv);
        
        // Scroll al último mensaje
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        
        // Guardar en historial
        if (sender !== 'typing' && content !== 'typing') {
            this.messages.push({
                role: sender === 'user' ? 'user' : 'assistant',
                content: content,
                timestamp: new Date().toISOString()
            });
        }
        
        return messageDiv;
    }
    
    // Mostrar indicador de typing
    showTyping() {
        this.isTyping = true;
        this.typingElement = this.addMessage('typing', 'assistant');
        this.disableInput();
    }
    
    // Ocultar indicador de typing
    hideTyping() {
        this.isTyping = false;
        if (this.typingElement) {
            this.typingElement.remove();
            this.typingElement = null;
        }
        this.enableInput();
    }
    
    // Enviar mensaje
    async sendMessage() {
        const message = this.elements.input.value.trim();
        
        if (!message || this.isTyping || this.isClosed) return;
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.elements.input.value = '';
        
        // Mostrar typing
        this.showTyping();
        
        // Simular delay natural
        await this.delay(CONFIG.CHAT.TYPING_DELAY);
        
        try {
            // Enviar a la API
            const response = await window.api.sendChatMessage(this.messages, this.sessionId);
            
            // Ocultar typing
            this.hideTyping();
            
            if (response.success) {
                const { reply, shouldClose, summary } = response.data;
                
                // Mostrar respuesta
                this.addMessage(reply, 'assistant');
                
                // Si debe cerrar la conversación
                if (shouldClose && summary) {
                    await this.handleChatCompletion(summary);
                }
                
                // Verificar límite de mensajes
                if (this.messages.length >= CONFIG.CHAT.MAX_MESSAGES) {
                    await this.handleChatCompletion();
                }
            } else {
                this.addMessage('Disculpa, hubo un problema de conexión. ¿Podrías repetir tu respuesta?', 'assistant');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTyping();
            this.addMessage('Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.', 'assistant');
        }
    }
    
    // Manejar finalización del chat
    async handleChatCompletion(summary = null) {
        this.isClosed = true;
        this.disableInput();
        
        // Guardar lead
        if (summary || this.messages.length > 2) {
            await this.saveLead(summary);
        }
        
        // Mostrar acciones finales
        this.elements.actions.classList.remove('hidden');
        
        // Actualizar status
        this.setStatus('completed', 'Análisis completado');
    }
    
    // Guardar información del lead
    async saveLead(summary) {
        try {
            const leadData = {
                session_id: this.sessionId,
                transcript: this.messages,
                summary: summary || this.generateBasicSummary(),
                user_agent: navigator.userAgent,
                referrer: document.referrer,
                url: window.location.href
            };
            
            const response = await window.api.saveLead(leadData);
            
            if (response.success) {
                console.log('Lead guardado:', response.data.id);
                
                // Trackear evento si analytics está habilitado
                if (CONFIG.ANALYTICS.enabled && window.gtag) {
                    window.gtag('event', 'lead_captured', {
                        event_category: 'engagement',
                        event_label: 'chat_completion',
                        value: 1
                    });
                }
            }
        } catch (error) {
            console.error('Error guardando lead:', error);
        }
    }
    
    // Generar resumen básico si no hay uno de la IA
    generateBasicSummary() {
        const userMessages = this.messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join(' | ');
            
        return {
            classification: CONFIG.LEAD_TYPES.WANTS_TO_START,
            raw_input: userMessages,
            message_count: this.messages.length,
            completed_at: new Date().toISOString()
        };
    }
    
    // Habilitar input
    enableInput() {
        this.elements.input.disabled = false;
        this.elements.sendBtn.disabled = false;
        this.elements.input.focus();
    }
    
    // Deshabilitar input
    disableInput() {
        this.elements.input.disabled = true;
        this.elements.sendBtn.disabled = true;
    }
    
    // Actualizar estado de conexión
    setStatus(status, text) {
        this.elements.statusDot.className = 'status-dot ' + status;
        this.elements.statusText.textContent = text;
    }
    
    // Utilidad para delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Reset chat (para nuevo chat)
    reset() {
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        this.isClosed = false;
        this.elements.messages.innerHTML = '';
        this.elements.actions.classList.add('hidden');
        this.elements.input.value = '';
        this.enableInput();
    }
}

// Exportar instancia global
window.chatManager = new ChatManager();