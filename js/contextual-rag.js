// ============================================
// CONTEXTUAL RAG - Sistema de respuestas inteligente con contexto
// ============================================

class ContextualRAG {
    constructor() {
        this.knowledgeBase = window.DANIEL_KNOWLEDGE;
        this.context = {
            currentSection: null,
            userBehavior: [],
            chatHistory: [],
            detectedIndustry: null,
            leadQualification: {
                industry: null,
                painPoints: [],
                urgency: null,
                budget: null,
                timeline: null,
                techLevel: null,
                score: 0
            }
        };
        
        this.conversationFlow = {
            stage: 0, // 0=greeting, 1=discovery, 2=qualification, 3=closing
            questionsAsked: [],
            nextQuestion: null
        };
        
        console.log('🧠 Contextual RAG System iniciado');
    }
    
    // ========== ANÁLISIS DE CONTEXTO ==========
    
    analyzeQuery(message, navigationContext = {}) {
        const analysis = {
            intent: this.detectIntent(message),
            industry: this.detectIndustry(message),
            painPoint: this.detectPainPoint(message),
            urgency: this.detectUrgency(message),
            techLevel: this.detectTechLevel(message),
            context: navigationContext
        };
        
        // Actualizar contexto global
        this.updateContext(analysis);
        
        return analysis;
    }
    
    detectIntent(message) {
        const intents = {
            greeting: /hola|buenos|hi|hello|hey/i,
            inquiry: /precio|costo|cuanto|presupuesto/i,
            industry: /educacion|software|retail|gaming|salud|finanzas|startup|pyme/i,
            problem: /problema|dolor|dificultad|automatizar|optimizar/i,
            timeline: /urgente|rapido|cuando|tiempo|fecha/i,
            demo: /demo|ejemplo|caso|muestra/i,
            schedule: /agendar|reunion|cita|llamada|consulta/i,
            technical: /rag|llm|ai|integracion|api|modelo/i
        };
        
        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(message)) return intent;
        }
        
        return 'general';
    }
    
    detectIndustry(message) {
        const industries = {
            'educacion': /educacion|universidad|colegio|estudiante|profesor|academia/i,
            'software': /software|desarrollo|app|codigo|programacion|startup|saas/i,
            'retail': /retail|ventas|ecommerce|tienda|cliente|soporte/i,
            'gaming': /gaming|juego|discord|comunidad|moderacion/i,
            'salud': /salud|medico|hospital|paciente|clinica/i,
            'finanzas': /banco|finanzas|credito|inversion|contabilidad/i,
            'consultoria': /consultor|asesoria|servicio|profesional/i,
            'manufactura': /fabrica|produccion|inventario|manufactura/i
        };
        
        for (const [industry, pattern] of Object.entries(industries)) {
            if (pattern.test(message)) return industry;
        }
        
        return null;
    }
    
    detectPainPoint(message) {
        const painPoints = {
            'manual_processes': /manual|repetitivo|tiempo|aburrido/i,
            'customer_support': /soporte|tickets|consultas|atencion/i,
            'data_analysis': /datos|reportes|dashboard|analytics/i,
            'automation': /automatizar|optimizar|eficiencia/i,
            'costs': /caro|expensive|presupuesto|barato/i,
            'scale': /escalar|crecer|volumen|capacidad/i,
            'integration': /integrar|conectar|sistemas|api/i
        };
        
        for (const [pain, pattern] of Object.entries(painPoints)) {
            if (pattern.test(message)) return pain;
        }
        
        return null;
    }
    
    detectUrgency(message) {
        if (/urgente|ya|inmediato|rapido|asap/i.test(message)) return 'high';
        if (/pronto|semana|mes/i.test(message)) return 'medium';
        if (/futuro|despues|mas tarde/i.test(message)) return 'low';
        return null;
    }
    
    detectTechLevel(message) {
        const techWords = /api|rag|llm|ml|ai|python|javascript|docker|kubernetes|aws/i;
        const businessWords = /roi|kpi|presupuesto|proceso|equipo|cliente/i;
        
        if (techWords.test(message)) return 'technical';
        if (businessWords.test(message)) return 'business';
        return 'mixed';
    }
    
    // ========== GENERACIÓN DE RESPUESTAS ==========
    
    generateResponse(userMessage, context = {}) {
        const analysis = this.analyzeQuery(userMessage, context);
        
        // Actualizar stage del flow conversacional
        this.updateConversationFlow(analysis);
        
        // Generar respuesta basada en análisis y stage
        let response = this.craftResponse(analysis);
        
        // Agregar pregunta de seguimiento si es necesario
        const followUp = this.getFollowUpQuestion();
        if (followUp) {
            response += `\n\n${followUp}`;
        }
        
        // Guardar en historial
        this.context.chatHistory.push({
            user: userMessage,
            assistant: response,
            analysis: analysis,
            timestamp: Date.now()
        });
        
        return response;
    }
    
    craftResponse(analysis) {
        const { intent, industry, painPoint, urgency, context } = analysis;
        
        // Respuestas basadas en intención
        switch (intent) {
            case 'greeting':
                return this.getGreetingResponse();
                
            case 'industry':
                return this.getIndustryResponse(industry);
                
            case 'inquiry':
                return this.getPricingResponse(analysis);
                
            case 'problem':
                return this.getProblemResponse(painPoint);
                
            case 'timeline':
                return this.getTimelineResponse(urgency);
                
            case 'demo':
                return this.getDemoResponse(industry);
                
            case 'schedule':
                return this.getScheduleResponse();
                
            case 'technical':
                return this.getTechnicalResponse(analysis);
                
            default:
                return this.getContextualResponse(analysis);
        }
    }
    
    // ========== RESPUESTAS ESPECÍFICAS ==========
    
    getGreetingResponse() {
        const greetings = [
            "¡Perfecto! Daniel me programó para ayudarte a encontrar la solución IA ideal.",
            "¡Hola! Soy Send-Cat, el asistente de Daniel. Vamos a encontrar cómo la IA puede transformar tu caso.",
            "¡Excelente! Daniel tiene experiencia ayudando con implementaciones de IA. Cuéntame tu situación."
        ];
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    getIndustryResponse(industry) {
        if (!industry || !this.knowledgeBase.industries[industry]) {
            return "Interesante sector. Daniel ha trabajado con múltiples industrias. ¿Cuál es tu principal dolor de cabeza operacional?";
        }
        
        const industryData = this.knowledgeBase.industries[industry];
        const solutions = industryData.solutions.slice(0, 2).join(', ');
        
        return `¡${industry}! Daniel tiene experiencia específica ahí. Ha implementado: ${solutions}. ¿Cuál de estos te resuena más?`;
    }
    
    getPricingResponse(analysis) {
        const { techLevel } = analysis;
        
        if (techLevel === 'technical') {
            return "Daniel maneja desde pilotos de $2K hasta implementaciones enterprise. La consultoría inicial es gratuita para entender scope y dar cotización exacta.";
        } else {
            return "La primera consultoría de 30 minutos es gratuita. Daniel analiza tu caso y te da un plan con inversión clara y ROI esperado.";
        }
    }
    
    getProblemResponse(painPoint) {
        const painSolutions = {
            'manual_processes': "Daniel especializa en automatizar procesos repetitivos. Ha reducido 60-80% del trabajo manual en casos como el tuyo.",
            'customer_support': "Soporte automatizado es el fuerte de Daniel. Ha implementado sistemas que resuelven 70% de tickets automáticamente.",
            'data_analysis': "Daniel ha creado dashboards automáticos que generan insights en tiempo real. Nada más reportes manuales de 2 semanas.",
            'automation': "Automatización es el core de Daniel. Desde workflows simples hasta orquestación de agentes complejos.",
            'costs': "Daniel se enfoca en ROI medible. Sus implementaciones típicamente se pagan solas en 2-4 meses.",
            'scale': "Escalabilidad es clave en diseño de Daniel. Sistemas que crecen contigo sin quebrar el presupuesto.",
            'integration': "Daniel es experto en integraciones. Conecta tus sistemas existentes sin disruption."
        };
        
        return painSolutions[painPoint] || "Daniel analiza cada caso específicamente. Su enfoque siempre es ROI medible y implementación práctica.";
    }
    
    getTimelineResponse(urgency) {
        if (urgency === 'high') {
            return "Entiendo la urgencia. Daniel puede empezar con un piloto en 1-2 semanas. ¿Hablamos esta semana para acelerar?";
        } else if (urgency === 'medium') {
            return "Perfecto timing. Daniel típicamente entrega pilotos funcionales en 2-4 semanas. ¿Agendamos para planear?";
        } else {
            return "Bien planear con tiempo. Daniel puede diseñar una hoja de ruta gradual. La consultoría te dará el plan completo.";
        }
    }
    
    getDemoResponse(industry) {
        const demos = this.knowledgeBase.success_cases.filter(c => 
            !industry || c.industry.toLowerCase().includes(industry)
        );
        
        if (demos.length > 0) {
            const demo = demos[0];
            return `Te muestro un caso real: ${demo.problem} → Daniel implementó ${demo.solution} → Resultado: ${demo.result}. ¿Te interesa algo similar?`;
        }
        
        return "Daniel tiene múltiples casos de éxito. En la consultoría te mostrará demos específicos para tu industria.";
    }
    
    getScheduleResponse() {
        return "¡Perfecto! Daniel tiene slots disponibles esta semana. La consultoría es gratuita y sin compromiso. ¿Prefieres mañana o pasado?";
    }
    
    getTechnicalResponse(analysis) {
        const techResponses = {
            'rag': "Daniel es experto en RAG. Implementa retrieval con evaluaciones continuas y guardrails para respuestas precisas.",
            'llm': "Daniel trabaja con GPT-4, Claude, Gemini y también LLMs locales para máxima privacidad y control de costos.",
            'api': "Daniel desarrolla APIs optimizadas para IA. Integración limpia con tus sistemas existentes.",
            'ml': "Enfoque de Daniel es MLOps completo: desarrollo, deployment, monitoreo y mejora continua."
        };
        
        const message = analysis.message?.toLowerCase() || '';
        for (const [tech, response] of Object.entries(techResponses)) {
            if (message.includes(tech)) return response;
        }
        
        return "Daniel maneja todo el stack de IA: desde fine-tuning hasta deployment enterprise. ¿Qué aspecto técnico te interesa más?";
    }
    
    getContextualResponse(analysis) {
        // Respuesta general basada en contexto acumulado
        const stage = this.conversationFlow.stage;
        
        if (stage === 0) {
            return "Cuéntame más sobre tu situación. Daniel me entrenó para entender casos complejos y encontrar la mejor solución.";
        } else if (stage === 1) {
            return "Interesante. Daniel ha resuelto casos similares. ¿Cuál es tu mayor dolor de cabeza en este tema?";
        } else if (stage === 2) {
            return "Perfecto, ya tengo buen contexto. Daniel puede definitivamente ayudarte. ¿Coordinamos una consultoría esta semana?";
        } else {
            return "Con toda esta información, Daniel puede preparar una propuesta específica para ti. ¿Agendamos 30 minutos?";
        }
    }
    
    // ========== FLUJO CONVERSACIONAL ==========
    
    updateConversationFlow(analysis) {
        // Incrementar stage basado en información recopilada
        if (analysis.industry && this.conversationFlow.stage < 1) {
            this.conversationFlow.stage = 1;
        }
        
        if (analysis.painPoint && this.conversationFlow.stage < 2) {
            this.conversationFlow.stage = 2;
        }
        
        if (analysis.urgency && this.conversationFlow.stage < 3) {
            this.conversationFlow.stage = 3;
        }
        
        // Track preguntas realizadas
        if (!this.conversationFlow.questionsAsked.includes(analysis.intent)) {
            this.conversationFlow.questionsAsked.push(analysis.intent);
        }
    }
    
    getFollowUpQuestion() {
        const stage = this.conversationFlow.stage;
        const asked = this.conversationFlow.questionsAsked;
        
        // Stage 0: Descubrimiento básico
        if (stage === 0 && !asked.includes('industry')) {
            return "¿En qué industria o sector trabajas?";
        }
        
        // Stage 1: Identificar problema
        if (stage === 1 && !asked.includes('problem')) {
            return "¿Cuál es el proceso más tedioso o que más tiempo te consume?";
        }
        
        // Stage 2: Calificar urgencia
        if (stage === 2 && !asked.includes('timeline')) {
            return "¿Qué tan urgente es resolver esto? ¿Tienes alguna fecha límite?";
        }
        
        // Stage 3: Cerrar
        if (stage >= 3) {
            return "¿Te parece si coordinamos una consultoría gratuita de 30 minutos para que Daniel analice tu caso específico?";
        }
        
        return null;
    }
    
    // ========== UTILIDADES ==========
    
    updateContext(analysis) {
        if (analysis.industry) {
            this.context.detectedIndustry = analysis.industry;
            this.context.leadQualification.industry = analysis.industry;
        }
        
        if (analysis.painPoint) {
            this.context.leadQualification.painPoints.push(analysis.painPoint);
        }
        
        if (analysis.urgency) {
            this.context.leadQualification.urgency = analysis.urgency;
        }
        
        if (analysis.techLevel) {
            this.context.leadQualification.techLevel = analysis.techLevel;
        }
        
        // Calcular lead score
        this.updateLeadScore();
    }
    
    updateLeadScore() {
        let score = 0;
        const qual = this.context.leadQualification;
        
        if (qual.industry) score += 20;
        if (qual.painPoints.length > 0) score += 25;
        if (qual.urgency === 'high') score += 30;
        else if (qual.urgency === 'medium') score += 20;
        else if (qual.urgency === 'low') score += 10;
        
        if (qual.techLevel === 'technical') score += 15;
        else if (qual.techLevel === 'business') score += 10;
        
        if (this.context.chatHistory.length >= 3) score += 10;
        
        this.context.leadQualification.score = score;
    }
    
    getLeadSummary() {
        return {
            stage: this.conversationFlow.stage,
            qualification: this.context.leadQualification,
            chatHistory: this.context.chatHistory,
            isQualified: this.context.leadQualification.score >= 60
        };
    }
    
    // ========== API PÚBLICA ==========
    
    ask(question, context = {}) {
        return this.generateResponse(question, context);
    }
    
    setContext(key, value) {
        this.context[key] = value;
    }
    
    reset() {
        this.context.chatHistory = [];
        this.conversationFlow.stage = 0;
        this.conversationFlow.questionsAsked = [];
        this.context.leadQualification = {
            industry: null,
            painPoints: [],
            urgency: null,
            budget: null,
            timeline: null,
            techLevel: null,
            score: 0
        };
    }
}

// Inicializar sistema
document.addEventListener('DOMContentLoaded', () => {
    window.contextualRAG = new ContextualRAG();
    console.log('🚀 Contextual RAG activado');
});

// Exportar para uso global
window.ContextualRAG = ContextualRAG;