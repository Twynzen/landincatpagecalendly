// ============================================
// API Client para comunicación con backend
// ============================================

class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL || CONFIG.SUPABASE_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        };
    }
    
    // Método genérico para hacer requests
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}/functions/v1/${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...(options.headers || {})
                }
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Request failed:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión' 
            };
        }
    }
    
    // Enviar mensaje al chat
    async sendChatMessage(messages, sessionId) {
        return this.request('chat', {
            method: 'POST',
            body: JSON.stringify({
                messages,
                sessionId,
                timestamp: new Date().toISOString()
            })
        });
    }
    
    // Guardar lead en base de datos
    async saveLead(leadData) {
        return this.request('lead', {
            method: 'POST',
            body: JSON.stringify({
                ...leadData,
                created_at: new Date().toISOString(),
                source: 'landing_chat',
                status: 'new'
            })
        });
    }
    
    // Agendar consultoría (integración con Calendly o sistema propio)
    async scheduleConsultation(leadId, preferredTime) {
        return this.request('schedule', {
            method: 'POST',
            body: JSON.stringify({
                leadId,
                preferredTime,
                type: 'initial_consultation',
                duration: 30 // minutos
            })
        });
    }
    
    // Analizar sentimiento y clasificar lead
    async analyzeLead(transcript) {
        return this.request('analyze', {
            method: 'POST',
            body: JSON.stringify({
                transcript,
                analysis_type: 'lead_classification'
            })
        });
    }
    
    // Obtener estado del sistema (para debug)
    async getSystemStatus() {
        return this.request('health', {
            method: 'GET'
        });
    }
}

// Cliente API singleton
const apiClient = new APIClient();

// API Mock para desarrollo local
class MockAPIClient {
    constructor() {
        this.responses = {
            chat: this.mockChatResponse.bind(this),
            lead: this.mockLeadResponse.bind(this),
            analyze: this.mockAnalyzeResponse.bind(this)
        };
        this.messageCount = 0;
    }
    
    async request(endpoint, options = {}) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        
        if (this.responses[endpoint]) {
            const body = options.body ? JSON.parse(options.body) : {};
            return this.responses[endpoint](body);
        }
        
        return { success: true, data: { message: 'Mock response' } };
    }
    
    mockChatResponse(body) {
        this.messageCount++;
        const { messages } = body;
        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
        
        let reply = '';
        let shouldClose = false;
        let summary = null;
        
        // Lógica simple de respuestas basada en el número de mensaje
        switch(this.messageCount) {
            case 1:
                reply = "Entiendo. ¿Cuánto tiempo o dinero te está costando este problema actualmente? Por ejemplo: horas por semana, casos por mes, o costo mensual.";
                break;
            case 2:
                reply = "Excelente información. Si implementamos IA aquí, ¿qué resultado concreto esperarías ver en 30-45 días? (reducción de tiempo, aumento de conversión, menos errores...)";
                break;
            case 3:
                reply = "Perfecto. ¿Dónde están los datos de este proceso actualmente? (CRM como Salesforce/HubSpot, Excel/Google Sheets, base de datos, emails, documentos...)";
                break;
            case 4:
                reply = "¿Hay restricciones importantes que deba conocer? Por ejemplo: los datos no pueden salir de tu empresa, cumplimiento regulatorio específico, presupuesto limitado...";
                break;
            case 5:
                reply = "Una última pregunta: ¿Para cuándo necesitas tener esto funcionando? ¿Y quién tomaría la decisión final de implementación?";
                break;
            case 6:
                reply = "¡Perfecto! Ya tengo toda la información necesaria. He preparado un resumen de tu caso para Daniel. Ahora puedes agendar tu consultoría gratuita de 30 minutos donde diseñaremos el piloto específico para tu necesidad.";
                shouldClose = true;
                summary = {
                    classification: lastUserMessage.includes('claro') || lastUserMessage.includes('api') 
                        ? CONFIG.LEAD_TYPES.KNOWS_WHAT_WANTS 
                        : CONFIG.LEAD_TYPES.WANTS_TO_START,
                    industry: "Por determinar",
                    pain_point: "Proceso manual repetitivo",
                    goal_30_45_days: "Automatización inicial",
                    current_tools: "Excel/Email",
                    constraints: "Ninguna crítica",
                    urgency: "1-2 meses",
                    decision_maker: "Usuario",
                    success_metric: "Reducción 50% tiempo"
                };
                break;
            default:
                reply = "Gracias por la información adicional. ¿Hay algo más específico sobre tu proceso que debería saber?";
        }
        
        return {
            success: true,
            data: {
                reply,
                shouldClose,
                summary,
                messageCount: this.messageCount
            }
        };
    }
    
    mockLeadResponse(body) {
        console.log('Mock: Guardando lead', body);
        return {
            success: true,
            data: {
                id: 'lead_' + Date.now(),
                message: 'Lead guardado exitosamente'
            }
        };
    }
    
    mockAnalyzeResponse(body) {
        return {
            success: true,
            data: {
                classification: CONFIG.LEAD_TYPES.WANTS_TO_START,
                confidence: 0.85,
                next_steps: ['Agendar consultoría', 'Preparar diagnóstico']
            }
        };
    }
    
    async sendChatMessage(messages, sessionId) {
        return this.request('chat', {
            method: 'POST',
            body: JSON.stringify({ messages, sessionId })
        });
    }
    
    async saveLead(leadData) {
        return this.request('lead', {
            method: 'POST',
            body: JSON.stringify(leadData)
        });
    }
    
    async analyzeLead(transcript) {
        return this.request('analyze', {
            method: 'POST',
            body: JSON.stringify({ transcript })
        });
    }
}

// Usar mock si estamos en desarrollo local
const IS_DEVELOPMENT = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.protocol === 'file:';

// Exportar el cliente apropiado
window.api = IS_DEVELOPMENT ? new MockAPIClient() : apiClient;