// ============================================
// Motor de Chat Inteligente con Calificación
// ============================================

class IntelligentChatEngine {
    constructor() {
        this.conversationState = {
            messages: [],
            userData: {},
            questionCount: 0,
            maxQuestions: 10,
            stage: 'discovery', // discovery -> qualification -> closing
            intent: null,
            readyToSchedule: false
        };
        
        // Flujo de preguntas adaptativo
        this.questionFlow = {
            discovery: [
                {
                    id: 'industry',
                    question: '¿En qué industria está tu negocio?',
                    type: 'open',
                    required: true,
                    followUp: this.getIndustryFollowUp.bind(this)
                },
                {
                    id: 'main_pain',
                    question: '¿Cuál es el proceso que más tiempo o dinero te está costando?',
                    type: 'open',
                    required: true,
                    analyze: true
                },
                {
                    id: 'current_solution',
                    question: '¿Cómo lo están manejando actualmente?',
                    type: 'open',
                    required: false
                },
                {
                    id: 'team_size',
                    question: '¿Cuántas personas trabajan en este proceso?',
                    type: 'number',
                    required: false
                },
                {
                    id: 'urgency',
                    question: '¿Qué tan urgente es resolver esto? (crítico/importante/explorando)',
                    type: 'choice',
                    required: true
                }
            ],
            
            qualification: [
                {
                    id: 'decision_maker',
                    question: '¿Eres quien toma la decisión o necesitas aprobación de alguien más?',
                    type: 'open',
                    required: true
                },
                {
                    id: 'budget_range',
                    question: '¿Tienen presupuesto asignado para resolver este problema?',
                    type: 'choice',
                    required: false
                },
                {
                    id: 'timeline',
                    question: '¿Para cuándo esperarías ver primeros resultados?',
                    type: 'open',
                    required: true
                },
                {
                    id: 'success_metrics',
                    question: '¿Cómo medirías el éxito de una solución?',
                    type: 'open',
                    required: false
                }
            ],
            
            technical: [
                {
                    id: 'current_tools',
                    question: '¿Qué herramientas usan actualmente? (CRM, ERP, Excel, etc)',
                    type: 'open',
                    required: false
                },
                {
                    id: 'data_location',
                    question: '¿Dónde están los datos? (nube, on-premise, mixto)',
                    type: 'choice',
                    required: false
                },
                {
                    id: 'privacy_concerns',
                    question: '¿Hay restricciones de privacidad o compliance?',
                    type: 'open',
                    required: false
                }
            ]
        };
        
        this.currentQuestionIndex = 0;
        this.askedQuestions = new Set();
    }
    
    // Obtener siguiente pregunta basada en contexto
    getNextQuestion() {
        const { userData, questionCount, stage } = this.conversationState;
        
        // Si ya tenemos suficiente información o llegamos al límite
        if (questionCount >= this.maxQuestions || this.hasEnoughInfo()) {
            return this.prepareClosing();
        }
        
        // Determinar qué preguntar basado en lo que ya sabemos
        let nextQuestion = null;
        
        // Flujo adaptativo basado en respuestas
        if (!userData.industry) {
            nextQuestion = this.questionFlow.discovery[0];
        } else if (!userData.main_pain) {
            nextQuestion = this.questionFlow.discovery[1];
        } else if (userData.urgency === 'crítico' && !userData.timeline) {
            nextQuestion = this.questionFlow.qualification.find(q => q.id === 'timeline');
        } else if (this.detectTechnicalUser() && !userData.current_tools) {
            nextQuestion = this.questionFlow.technical[0];
        } else {
            // Buscar siguiente pregunta no respondida más relevante
            nextQuestion = this.findMostRelevantQuestion();
        }
        
        if (nextQuestion && !this.askedQuestions.has(nextQuestion.id)) {
            this.askedQuestions.add(nextQuestion.id);
            this.conversationState.questionCount++;
            return nextQuestion;
        }
        
        // Si no hay más preguntas relevantes, cerrar
        return this.prepareClosing();
    }
    
    // Procesar respuesta del usuario
    processUserResponse(message) {
        const lastQuestion = this.getLastAskedQuestion();
        
        // Guardar respuesta
        if (lastQuestion) {
            this.conversationState.userData[lastQuestion.id] = message;
        }
        
        // Analizar intent y contexto
        this.analyzeUserIntent(message);
        
        // Detectar si el usuario quiere agendar directamente
        if (this.detectSchedulingIntent(message)) {
            this.conversationState.readyToSchedule = true;
            return this.prepareSchedulingResponse();
        }
        
        // Detectar preguntas técnicas específicas
        const technicalResponse = this.handleTechnicalQuestion(message);
        if (technicalResponse) {
            return technicalResponse;
        }
        
        // Continuar flujo normal
        const nextQuestion = this.getNextQuestion();
        
        if (nextQuestion.type === 'closing') {
            return nextQuestion;
        }
        
        // Personalizar respuesta basada en contexto
        return this.personalizeResponse(nextQuestion);
    }
    
    // Detectar si es usuario técnico
    detectTechnicalUser() {
        const { userData } = this.conversationState;
        const technicalKeywords = ['api', 'rag', 'llm', 'gpt', 'claude', 'embedding', 'vector', 'ml', 'ai'];
        
        const userMessages = Object.values(userData).join(' ').toLowerCase();
        return technicalKeywords.some(keyword => userMessages.includes(keyword));
    }
    
    // Detectar intención de agendar
    detectSchedulingIntent(message) {
        const schedulingKeywords = ['agendar', 'reunión', 'llamada', 'hablar', 'consultoría', 'calendly'];
        const messageLower = message.toLowerCase();
        return schedulingKeywords.some(keyword => messageLower.includes(keyword));
    }
    
    // Manejar preguntas técnicas específicas
    handleTechnicalQuestion(message) {
        const messageLower = message.toLowerCase();
        
        // Preguntas sobre experiencia
        if (messageLower.includes('experiencia') || messageLower.includes('años')) {
            return {
                type: 'response',
                message: `Daniel tiene ${DANIEL_KNOWLEDGE.profile.experience_years} años de experiencia en IA, especializándose en orquestación de sistemas, no solo chatbots. Ha trabajado con empresas en ${Object.keys(DANIEL_KNOWLEDGE.industries).join(', ')}.`,
                continueFlow: true
            };
        }
        
        // Preguntas sobre tecnologías
        if (messageLower.includes('tecnolog') || messageLower.includes('stack')) {
            const techs = DANIEL_KNOWLEDGE.expertise.core_skills.slice(0, 3).join(', ');
            return {
                type: 'response',
                message: `Trabajamos con ${techs}. Lo importante es que elegimos la tecnología que mejor resuelve TU problema específico, no la más nueva o cara.`,
                continueFlow: true
            };
        }
        
        // Preguntas sobre privacidad
        if (messageLower.includes('privacidad') || messageLower.includes('seguridad')) {
            return {
                type: 'response',
                message: 'Excelente pregunta. Ofrecemos opciones on-premise con LLMs locales cuando la privacidad es crítica. Tus datos nunca salen de tu infraestructura si así lo prefieres.',
                continueFlow: true
            };
        }
        
        // Preguntas sobre costos
        if (messageLower.includes('costo') || messageLower.includes('precio') || messageLower.includes('cuánto')) {
            return {
                type: 'response',
                message: 'El costo depende del caso específico, pero siempre empezamos con un piloto de ROI claro. La consultoría inicial es gratuita y ahí definimos alcance y inversión. ¿Te gustaría agendarla?',
                showScheduling: true
            };
        }
        
        return null;
    }
    
    // Personalizar respuesta basada en contexto
    personalizeResponse(question) {
        const { userData } = this.conversationState;
        let response = question.question;
        
        // Personalizar basado en industria
        if (userData.industry && question.id === 'main_pain') {
            const industryData = DANIEL_KNOWLEDGE.industries[userData.industry];
            if (industryData) {
                response = `Entiendo, ${userData.industry}. ${question.question} Por ejemplo, otros clientes en tu industria optimizan ${industryData.solutions[0].toLowerCase()}.`;
            }
        }
        
        // Agregar contexto basado en urgencia
        if (userData.urgency === 'crítico') {
            response = `Veo que es crítico. ${response}`;
        }
        
        return {
            type: 'question',
            message: response,
            questionId: question.id
        };
    }
    
    // Encontrar pregunta más relevante
    findMostRelevantQuestion() {
        const { userData } = this.conversationState;
        
        // Priorizar basado en lo que ya sabemos
        if (userData.urgency === 'crítico') {
            // Priorizar preguntas de calificación
            for (const q of this.questionFlow.qualification) {
                if (!this.askedQuestions.has(q.id)) return q;
            }
        }
        
        if (this.detectTechnicalUser()) {
            // Priorizar preguntas técnicas
            for (const q of this.questionFlow.technical) {
                if (!this.askedQuestions.has(q.id)) return q;
            }
        }
        
        // Buscar en todos los flujos
        const allQuestions = [
            ...this.questionFlow.discovery,
            ...this.questionFlow.qualification,
            ...this.questionFlow.technical
        ];
        
        return allQuestions.find(q => !this.askedQuestions.has(q.id) && q.required);
    }
    
    // Verificar si tenemos suficiente información
    hasEnoughInfo() {
        const { userData } = this.conversationState;
        const requiredFields = ['industry', 'main_pain', 'urgency'];
        return requiredFields.every(field => userData[field]);
    }
    
    // Preparar cierre de conversación
    prepareClosing() {
        const { userData } = this.conversationState;
        
        // Generar resumen para Daniel
        const summary = this.generateSummary();
        
        // Determinar clasificación
        const classification = this.classifyLead();
        
        // Mensaje de cierre personalizado
        let closingMessage = 'Perfecto, ya tengo la información necesaria. ';
        
        if (classification === 'HOT') {
            closingMessage += 'Veo que tu caso es urgente y muy alineado con lo que hacemos. ';
        } else if (classification === 'WARM') {
            closingMessage += 'Tu caso es interesante y creo que podemos ayudarte. ';
        }
        
        closingMessage += 'He preparado un resumen para Daniel. La consultoría gratuita de 30 minutos es el siguiente paso para diseñar una solución específica.';
        
        return {
            type: 'closing',
            message: closingMessage,
            summary: summary,
            classification: classification,
            showScheduling: true
        };
    }
    
    // Generar resumen
    generateSummary() {
        const { userData } = this.conversationState;
        
        return {
            timestamp: new Date().toISOString(),
            industry: userData.industry || 'No especificado',
            pain_point: userData.main_pain || 'No especificado',
            current_solution: userData.current_solution || 'No especificado',
            team_size: userData.team_size || 'No especificado',
            urgency: userData.urgency || 'explorando',
            decision_maker: userData.decision_maker || 'No especificado',
            timeline: userData.timeline || 'No especificado',
            budget: userData.budget_range || 'No discutido',
            tools: userData.current_tools || 'No especificado',
            privacy_concerns: userData.privacy_concerns || 'No mencionado',
            success_metrics: userData.success_metrics || 'No definido',
            technical_level: this.detectTechnicalUser() ? 'técnico' : 'negocio'
        };
    }
    
    // Clasificar lead
    classifyLead() {
        const { userData } = this.conversationState;
        let score = 0;
        
        // Scoring basado en respuestas
        if (userData.urgency === 'crítico') score += 3;
        else if (userData.urgency === 'importante') score += 2;
        else score += 1;
        
        if (userData.decision_maker && userData.decision_maker.toLowerCase().includes('sí')) score += 2;
        if (userData.budget_range && !userData.budget_range.toLowerCase().includes('no')) score += 2;
        if (userData.timeline && userData.timeline.toLowerCase().includes('mes')) score += 1;
        if (userData.team_size && parseInt(userData.team_size) > 5) score += 1;
        
        // Clasificación final
        if (score >= 7) return 'HOT';
        if (score >= 4) return 'WARM';
        return 'COLD';
    }
    
    // Obtener follow-up para industria
    getIndustryFollowUp(industry) {
        const industryLower = industry.toLowerCase();
        
        for (const [key, data] of Object.entries(DANIEL_KNOWLEDGE.industries)) {
            if (industryLower.includes(key.toLowerCase())) {
                return `Excelente, en ${key} ${data.experience}. `;
            }
        }
        
        return 'Interesante, he trabajado con industrias similares. ';
    }
    
    // Obtener última pregunta hecha
    getLastAskedQuestion() {
        const allQuestions = [
            ...this.questionFlow.discovery,
            ...this.questionFlow.qualification,
            ...this.questionFlow.technical
        ];
        
        const askedArray = Array.from(this.askedQuestions);
        if (askedArray.length === 0) return null;
        
        const lastId = askedArray[askedArray.length - 1];
        return allQuestions.find(q => q.id === lastId);
    }
    
    // Preparar respuesta para agendar
    prepareSchedulingResponse() {
        return {
            type: 'scheduling',
            message: 'Perfecto! Te comparto el link para agendar directamente con Daniel. Son 30 minutos gratuitos donde diseñaremos una solución específica para tu caso.',
            showScheduling: true
        };
    }
    
    // Analizar intent del usuario
    analyzeUserIntent(message) {
        // Análisis básico de intent para mejorar respuestas
        const messageLower = message.toLowerCase();
        
        if (messageLower.includes('no estoy seguro') || messageLower.includes('no sé')) {
            this.conversationState.intent = 'uncertain';
        } else if (messageLower.includes('urgente') || messageLower.includes('rápido')) {
            this.conversationState.intent = 'urgent';
        } else if (messageLower.includes('explorar') || messageLower.includes('información')) {
            this.conversationState.intent = 'exploring';
        }
    }
    
    // Resetear conversación
    reset() {
        this.conversationState = {
            messages: [],
            userData: {},
            questionCount: 0,
            stage: 'discovery',
            intent: null,
            readyToSchedule: false
        };
        this.currentQuestionIndex = 0;
        this.askedQuestions.clear();
    }
}

// Exportar para uso global
window.IntelligentChatEngine = IntelligentChatEngine;