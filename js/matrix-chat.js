// ============================================
// MATRIX CHAT - Sistema de Chat Simplificado  
// ============================================

class MatrixChat {
    constructor() {
        this.messages = [];
        this.questionCount = 0;
        this.maxQuestions = 10;
        this.isProcessing = false;
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        
        this.elements = {
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            sendButton: document.getElementById('sendMessage'),
            modal: document.getElementById('completionModal')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.focusInput();
        console.log('🤖 Matrix Chat iniciado');
    }
    
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
    }
    
    async sendMessage() {
        const message = this.elements.chatInput.value.trim();
        if (!message || this.isProcessing) return;
        
        this.isProcessing = true;
        this.addUserMessage(message);
        this.elements.chatInput.value = '';
        
        // Simular typing
        await this.showTypingIndicator();
        
        // Generar respuesta
        const response = this.generateResponse(message);
        await this.addAssistantMessage(response);
        
        this.questionCount++;
        
        // Completar chat si llegamos al límite
        if (this.questionCount >= this.maxQuestions) {
            await this.completeChat();
        }
        
        this.isProcessing = false;
        this.focusInput();
    }
    
    addUserMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <span class="prompt">user@session:~$</span>
            <div class="message-content">
                <p>${this.escapeHtml(content)}</p>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({
            role: 'user',
            content: content,
            timestamp: new Date()
        });
    }
    
    async addAssistantMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `
            <span class="prompt">system@ai-consultant:~$</span>
            <div class="message-content">
                <p><strong class="matrix-highlight">${this.escapeHtml(content)}</strong></p>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({
            role: 'assistant',
            content: content,
            timestamp: new Date()
        });
    }
    
    async showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message system typing';
        typingDiv.innerHTML = `
            <span class="prompt">system@ai-consultant:~$</span>
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
        
        // Simular tiempo de respuesta
        await this.delay(1000 + Math.random() * 1000);
        typingDiv.remove();
    }
    
    generateResponse(userInput) {
        // Usar el sistema RAG contextual si está disponible
        if (window.contextualRAG) {
            const navigationContext = {
                currentSection: window.sendCat?.awareness?.currentSection || null,
                timeOnPage: Date.now() - this.sessionStartTime,
                questionsAsked: this.questionCount,
                userBehavior: window.sendCat?.awareness?.userActivity || []
            };
            
            return window.contextualRAG.ask(userInput, navigationContext);
        }
        
        // Fallback: sistema anterior
        const responses = [
            "¿En qué industria o sector trabajas?",
            "¿Cuál es el proceso más tedioso que consumes más tiempo?",
            "¿Qué tan urgente es automatizar esto? ¿Hay alguna fecha límite?",
            "¿Tu equipo es más técnico o de negocio?",
            "¿Has probado alguna solución de IA antes?",
            "¿Cuál sería el resultado ideal en los primeros 30 días?",
            "¿Prefieres soluciones cloud o locales por privacidad?",
            "¿Aproximadamente qué volumen de trabajo/consultas manejas?",
            "¿Hay presupuesto asignado o necesitas justificar la inversión?",
            "Perfecto. Daniel puede ayudarte. ¿Coordinamos 30 minutos esta semana?"
        ];
        
        if (this.questionCount < responses.length) {
            return responses[this.questionCount];
        }
        
        return "¡Excelente! Tengo toda la info para que Daniel prepare una propuesta específica.";
    }
    
    async completeChat() {
        await this.delay(1000);
        
        // Mostrar modal de completación
        this.elements.modal.classList.remove('hidden');
        
        // Guardar lead (simulado en desarrollo)
        this.saveLead();
        
        console.log('✅ Chat completado');
    }
    
    saveLead() {
        const leadData = {
            session_id: this.sessionId,
            messages: this.messages,
            completed_at: new Date().toISOString(),
            user_agent: navigator.userAgent
        };
        
        console.log('💾 Lead guardado:', leadData);
        
        // En producción, enviar a Supabase
        // fetch('/functions/v1/lead', { method: 'POST', body: JSON.stringify(leadData) })
    }
    
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    focusInput() {
        setTimeout(() => this.elements.chatInput.focus(), 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    generateSessionId() {
        return 'matrix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.matrixChat = new MatrixChat();
});