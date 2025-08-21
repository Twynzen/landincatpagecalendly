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
        const responses = [
            "¿Qué procesos manuales te quitan más tiempo en tu negocio?",
            "¿Cuántas personas tiene tu equipo y cuál es su mayor dolor de trabajo?",
            "¿Qué presupuesto aproximado manejas para automatización/IA?",
            "¿Tienes experiencia previa con chatbots o sistemas de IA?",
            "¿Qué resultados específicos esperas ver en los primeros 30 días?",
            "¿Prefieres soluciones en la nube o sistemas locales por privacidad?",
            "¿Cuál es el volumen de consultas/tickets que manejas mensualmente?",
            "¿Qué tan técnico es tu equipo? ¿Necesitan capacitación?",
            "¿Tienes alguna urgencia o fecha límite para implementar?",
            "Perfecto. ¿Cuándo podríamos agendar 30 minutos para diseñar tu plan específico?"
        ];
        
        if (this.questionCount < responses.length) {
            return responses[this.questionCount];
        }
        
        return "Excelente información. Vamos a agendar tu consultoría gratuita.";
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