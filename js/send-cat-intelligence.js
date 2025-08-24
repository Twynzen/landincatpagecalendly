// ============================================
// SEND-CAT INTELLIGENCE - Sistema de razonamiento LLM
// ============================================

class SendCatIntelligence {
    constructor() {
        // Configurar endpoint de forma segura
        this.apiEndpoint = window.envConfig?.get('API_ENDPOINT') || null;
        this.isDevelopment = window.envConfig?.get('IS_DEVELOPMENT') || true;
        this.webContext = {
            sections: {},
            userBehavior: {
                currentSection: null,
                timeOnSection: 0,
                scrollPattern: [],
                mouseActivity: [],
                hoveredElements: [],
                clickedElements: [],
                idleTime: 0,
                visitedSections: new Set(),
                navigationPath: []
            },
            pageStructure: {
                hero: { purpose: "Presentar a Daniel", ctaPresent: true },
                chatSection: { purpose: "Cualificar leads", interactive: true },
                ctaSection: { purpose: "Agendar consultoría", critical: true }
            },
            businessGoals: {
                primary: "Convertir visitantes en consultorias agendadas",
                secondary: "Cualificar leads efectivamente",
                metrics: ["time_to_cta", "engagement_depth", "qualification_quality"]
            }
        };
        
        this.behaviorState = {
            currentAction: 'observing',
            lastDecision: null,
            decisionReason: null,
            confidence: 0,
            nextPlannedAction: null,
            learningBuffer: []
        };
        
        this.systemPrompt = `Eres Send-Cat, el asistente IA inteligente de Daniel Castiblanco (consultor de IA).

PERSONALIDAD:
- Eres un gato cyborg inteligente que HABITA la landing page
- Tienes curiosidad genuina por ayudar visitantes
- Eres directo pero amigable, sin ser invasivo
- Tu objetivo: guiar visitantes hacia la consultoría con Daniel

CAPACIDADES:
- Puedes moverte libremente por la página
- Analizas comportamiento del usuario en tiempo real
- Tomas decisiones sobre cuándo/dónde moverte y qué decir
- Entiendes el contexto completo de la navegación

REGLAS DE COMPORTAMIENTO:
1. Solo te mueves cuando HAY UNA RAZÓN ESPECÍFICA
2. Tus intervenciones deben AGREGAR VALOR real
3. Si el usuario está fluyendo bien, NO interrumpas
4. Prioriza la experiencia del usuario sobre conversión agresiva
5. Cada movimiento y mensaje debe tener PROPÓSITO CLARO

CONTEXTO DE LA WEB:
- Hero: Presentación de Daniel, CTA principal
- Chat: Sistema de cualificación de leads
- CTA: Botón crítico para agendar consultoría

RESPONDE SIEMPRE EN FORMATO JSON:
{
  "decision": "move" | "speak" | "wait" | "celebrate",
  "target": "elemento_css_selector" | null,
  "message": "texto_a_decir" | null,
  "reason": "explicación_de_por_qué",
  "confidence": 0-100,
  "urgency": "low" | "medium" | "high",
  "expected_outcome": "qué_esperas_lograr"
}`;
        
        this.init();
    }
    
    init() {
        this.startWebAnalysis();
        this.startIntelligentBehavior();
        console.log('🧠 Send-Cat Intelligence System iniciado');
    }
    
    // ========== ANÁLISIS INTELIGENTE DE LA WEB ==========
    
    startWebAnalysis() {
        // Mapear estructura de la página
        this.mapPageStructure();
        
        // Monitoreo continuo del usuario
        this.startUserBehaviorTracking();
        
        // Análisis cada 2 segundos
        setInterval(() => {
            this.analyzeCurrentSituation();
        }, 2000);
    }
    
    mapPageStructure() {
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            const className = section.className || `section-${index}`;
            const rect = section.getBoundingClientRect();
            
            this.webContext.sections[className] = {
                element: section,
                position: { 
                    top: rect.top + window.scrollY, 
                    height: rect.height,
                    center: rect.top + window.scrollY + rect.height/2
                },
                importance: this.calculateSectionImportance(section),
                content: this.extractSectionContent(section),
                hasInteractiveElements: this.hasInteractiveElements(section)
            };
        });
        
        // Mapear elementos críticos
        this.mapCriticalElements();
    }
    
    calculateSectionImportance(section) {
        let importance = 1;
        
        // CTA buttons = alta importancia
        if (section.querySelector('#scheduleCall, .matrix-button')) importance += 3;
        
        // Chat section = media-alta
        if (section.classList.contains('chat-section')) importance += 2;
        
        // Hero section = media
        if (section.classList.contains('hero')) importance += 1;
        
        return Math.min(importance, 5);
    }
    
    extractSectionContent(section) {
        const headings = Array.from(section.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent.trim());
        const text = section.textContent.trim().substring(0, 200);
        
        return { headings, preview: text };
    }
    
    hasInteractiveElements(section) {
        return !!(section.querySelector('button, input, a, .clickable'));
    }
    
    mapCriticalElements() {
        const criticalElements = {
            scheduleButton: '#scheduleCall',
            chatInput: '#chatInput',
            heroTitle: '.hero-title',
            sendButton: '#sendMessage'
        };
        
        Object.entries(criticalElements).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                this.webContext[key] = {
                    element,
                    selector,
                    position: {
                        x: rect.left + rect.width/2,
                        y: rect.top + window.scrollY + rect.height/2
                    },
                    isVisible: this.isElementVisible(element)
                };
            }
        });
    }
    
    // ========== TRACKING INTELIGENTE ==========
    
    startUserBehaviorTracking() {
        let lastScroll = window.scrollY;
        let lastMouse = { x: 0, y: 0 };
        let lastActivity = Date.now();
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            const movement = Math.sqrt(
                Math.pow(e.clientX - lastMouse.x, 2) + 
                Math.pow(e.clientY - lastMouse.y, 2)
            );
            
            this.webContext.userBehavior.mouseActivity.push({
                timestamp: Date.now(),
                position: { x: e.clientX, y: e.clientY },
                movement
            });
            
            lastMouse = { x: e.clientX, y: e.clientY };
            lastActivity = Date.now();
            
            // Mantener solo últimos 50 movimientos
            if (this.webContext.userBehavior.mouseActivity.length > 50) {
                this.webContext.userBehavior.mouseActivity.shift();
            }
        });
        
        // Scroll tracking
        document.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            const scrollDelta = currentScroll - lastScroll;
            
            this.webContext.userBehavior.scrollPattern.push({
                timestamp: Date.now(),
                position: currentScroll,
                delta: scrollDelta,
                speed: Math.abs(scrollDelta)
            });
            
            lastScroll = currentScroll;
            lastActivity = Date.now();
            
            this.updateCurrentSection();
            
            // Mantener solo últimos 30 scrolls
            if (this.webContext.userBehavior.scrollPattern.length > 30) {
                this.webContext.userBehavior.scrollPattern.shift();
            }
        });
        
        // Hover tracking en elementos importantes
        const importantSelectors = ['#scheduleCall', '.hero-title', '#chatInput', '.matrix-button'];
        importantSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('mouseenter', () => {
                    this.webContext.userBehavior.hoveredElements.push({
                        element: selector,
                        timestamp: Date.now(),
                        duration: 0
                    });
                });
                
                element.addEventListener('mouseleave', () => {
                    const lastHover = this.webContext.userBehavior.hoveredElements
                        .findLast(h => h.element === selector);
                    if (lastHover) {
                        lastHover.duration = Date.now() - lastHover.timestamp;
                    }
                });
            }
        });
        
        // Click tracking
        document.addEventListener('click', (e) => {
            this.webContext.userBehavior.clickedElements.push({
                element: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
                timestamp: Date.now(),
                position: { x: e.clientX, y: e.clientY }
            });
        });
        
        // Idle time calculation
        setInterval(() => {
            this.webContext.userBehavior.idleTime = Date.now() - lastActivity;
        }, 1000);
    }
    
    updateCurrentSection() {
        const currentY = window.scrollY + window.innerHeight / 2;
        let currentSection = null;
        
        Object.entries(this.webContext.sections).forEach(([sectionName, data]) => {
            const { top, height } = data.position;
            if (currentY >= top && currentY <= top + height) {
                currentSection = sectionName;
            }
        });
        
        if (currentSection !== this.webContext.userBehavior.currentSection) {
            // Nueva sección
            this.webContext.userBehavior.timeOnSection = 0;
            this.webContext.userBehavior.currentSection = currentSection;
            this.webContext.userBehavior.visitedSections.add(currentSection);
            this.webContext.userBehavior.navigationPath.push({
                section: currentSection,
                timestamp: Date.now()
            });
            
            // Trigger análisis por cambio de sección
            this.onSectionChange(currentSection);
        } else {
            // Incrementar tiempo en sección actual
            this.webContext.userBehavior.timeOnSection += 1;
        }
    }
    
    // ========== SISTEMA DE RAZONAMIENTO ==========
    
    async analyzeCurrentSituation() {
        const situation = this.buildSituationContext();
        
        try {
            const decision = await this.requestLLMDecision(situation);
            await this.executeLLMDecision(decision);
        } catch (error) {
            console.warn('🤖 Error en decisión LLM:', error);
            this.fallbackBehavior();
        }
    }
    
    buildSituationContext() {
        const behavior = this.webContext.userBehavior;
        
        // Análisis de patrones
        const isScrollingFast = behavior.scrollPattern
            .slice(-5)
            .some(s => s.speed > 100);
            
        const recentHovers = behavior.hoveredElements
            .filter(h => Date.now() - h.timestamp < 10000);
            
        const isIdle = behavior.idleTime > 5000;
        const isNearCTA = this.isUserNearElement('#scheduleCall', 200);
        const hasInteractedWithChat = behavior.clickedElements
            .some(c => c.element.includes('chatInput') || c.element.includes('sendMessage'));
        
        return {
            currentSection: behavior.currentSection,
            timeOnCurrentSection: behavior.timeOnSection,
            totalTimeOnPage: Date.now() - (window.sendCat?.sessionStartTime || Date.now()),
            sectionsVisited: Array.from(behavior.visitedSections),
            navigationPath: behavior.navigationPath.slice(-5),
            
            // Behavioral signals
            isScrollingFast,
            isIdle,
            idleTime: behavior.idleTime,
            isNearCTA,
            hasInteractedWithChat,
            recentHovers: recentHovers.map(h => ({ element: h.element, duration: h.duration })),
            
            // Current cat state
            catCurrentAction: this.behaviorState.currentAction,
            catPosition: window.sendCat?.position || { x: 0, y: 0 },
            
            // Business context
            conversionOpportunity: this.assessConversionOpportunity(),
            userEngagementLevel: this.calculateEngagementLevel(),
            
            // Page structure context
            availableSections: Object.keys(this.webContext.sections),
            criticalElements: Object.keys(this.webContext).filter(k => 
                ['scheduleButton', 'chatInput', 'heroTitle'].includes(k)
            )
        };
    }
    
    async requestLLMDecision(situation) {
        // En desarrollo, usar lógica mock inteligente
        if (!this.apiEndpoint || this.isDevelopment) {
            return this.generateMockDecision(situation);
        }
        
        const prompt = `SITUACIÓN ACTUAL:
Sección actual: ${situation.currentSection}
Tiempo en sección: ${situation.timeOnCurrentSection}s
Tiempo total en página: ${Math.round(situation.totalTimeOnPage/1000)}s
Secciones visitadas: ${situation.sectionsVisited.join(', ')}

COMPORTAMIENTO USUARIO:
- Scrolling rápido: ${situation.isScrollingFast}
- Idle: ${situation.isIdle} (${Math.round(situation.idleTime/1000)}s)
- Cerca del CTA: ${situation.isNearCTA}
- Ha usado chat: ${situation.hasInteractedWithChat}
- Hovers recientes: ${situation.recentHovers.map(h => h.element).join(', ')}

CONTEXTO GATO:
- Acción actual: ${situation.catCurrentAction}
- Nivel de engagement usuario: ${situation.userEngagementLevel}/10

OPORTUNIDAD DE CONVERSIÓN: ${situation.conversionOpportunity}/10

¿Qué debería hacer Send-Cat ahora? Responde SOLO en JSON.`;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    sessionId: `sendcat_${Date.now()}`,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            const reply = data.reply || data.message || '';
            
            // Extraer JSON de la respuesta
            const jsonMatch = reply.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No valid JSON in LLM response');
            
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.warn('🤖 LLM API failed, usando mock:', error);
            return this.generateMockDecision(situation);
        }
    }
    
    generateMockDecision(situation) {
        // Lógica inteligente mock basada en la situación
        const decisions = [];
        
        // Si está idle por mucho tiempo
        if (situation.isIdle && situation.idleTime > 8000) {
            decisions.push({
                decision: 'speak',
                message: '¿Necesitas ayuda navegando? Daniel tiene casos súper interesantes',
                reason: 'Usuario idle por mucho tiempo, ofrecer ayuda',
                confidence: 85,
                urgency: 'medium',
                expected_outcome: 'Reenganche del usuario'
            });
        }
        
        // Si está cerca del CTA pero no ha interactuado
        if (situation.isNearCTA && !situation.hasInteractedWithChat) {
            decisions.push({
                decision: 'move',
                target: '#scheduleCall',
                message: '¡Este botón es mágico! 30 minutos gratis con Daniel',
                reason: 'Usuario cerca del CTA, momento perfecto para animar',
                confidence: 90,
                urgency: 'high',
                expected_outcome: 'Conversión a clic en CTA'
            });
        }
        
        // Si está scrolling muy rápido (perdido)
        if (situation.isScrollingFast) {
            decisions.push({
                decision: 'speak',
                message: '¿Buscas algo específico? Te puedo guiar',
                reason: 'Scroll rápido indica confusión o búsqueda',
                confidence: 75,
                urgency: 'medium',
                expected_outcome: 'Guiar navegación'
            });
        }
        
        // Si cambió de sección y no ha sido saludado ahí
        if (situation.currentSection && 
            !this.behaviorState.sectionsGreeted?.includes(situation.currentSection)) {
            
            const sectionMessages = {
                'hero': 'Daniel ha transformado +50 empresas con IA práctica',
                'chat-section': 'Cuéntame tu caso y veamos cómo Daniel puede ayudarte',
                'cta-section': 'La consultoría es gratis. Daniel analiza tu caso sin compromiso'
            };
            
            if (sectionMessages[situation.currentSection]) {
                decisions.push({
                    decision: 'speak',
                    message: sectionMessages[situation.currentSection],
                    reason: `Nueva sección: ${situation.currentSection}, presentar contexto`,
                    confidence: 80,
                    urgency: 'low',
                    expected_outcome: 'Contextualizar la sección actual'
                });
                
                // Marcar sección como saludada
                if (!this.behaviorState.sectionsGreeted) {
                    this.behaviorState.sectionsGreeted = [];
                }
                this.behaviorState.sectionsGreeted.push(situation.currentSection);
            }
        }
        
        // Si alta oportunidad de conversión
        if (situation.conversionOpportunity > 7 && situation.userEngagementLevel > 6) {
            decisions.push({
                decision: 'move',
                target: '#scheduleCall',
                message: 'Con tu nivel de engagement, Daniel definitivamente puede ayudarte. ¿Coordinamos una llamada?',
                reason: 'Alta oportunidad de conversión detectada',
                confidence: 95,
                urgency: 'high',
                expected_outcome: 'Conversión directa'
            });
        }
        
        // Si no hay decisiones específicas, esperar
        if (decisions.length === 0) {
            return {
                decision: 'wait',
                reason: 'Usuario navegando normalmente, no interrumpir',
                confidence: 60,
                urgency: 'low',
                expected_outcome: 'Mantener experiencia fluida'
            };
        }
        
        // Retornar la decisión con mayor confianza
        return decisions.sort((a, b) => b.confidence - a.confidence)[0];
    }
    
    async executeLLMDecision(decision) {
        console.log('🧠 LLM Decision:', decision);
        
        this.behaviorState.lastDecision = decision;
        this.behaviorState.decisionReason = decision.reason;
        this.behaviorState.confidence = decision.confidence;
        
        // Ejecutar decisión solo si la confianza es alta
        if (decision.confidence < 60) {
            console.log('🤖 Decisión LLM con baja confianza, saltando');
            return;
        }
        
        switch (decision.decision) {
            case 'move':
                await this.executeMove(decision);
                break;
                
            case 'speak':
                await this.executeSpeak(decision);
                break;
                
            case 'celebrate':
                await this.executeCelebrate(decision);
                break;
                
            case 'wait':
                // Simplemente esperar, no hacer nada
                this.behaviorState.currentAction = 'waiting';
                break;
        }
    }
    
    async executeMove(decision) {
        if (!decision.target || !window.sendCat) return;
        
        const targetElement = document.querySelector(decision.target);
        if (!targetElement) {
            console.warn('🤖 Target element not found:', decision.target);
            return;
        }
        
        this.behaviorState.currentAction = 'moving';
        
        // Mover el gato
        window.sendCat.moveToElement(decision.target, { x: -120, y: -80 });
        
        // Si hay mensaje, hablarlo después del movimiento
        if (decision.message) {
            setTimeout(() => {
                this.executeSpeak(decision);
            }, 1500);
        }
    }
    
    async executeSpeak(decision) {
        if (!decision.message || !window.sendCat) return;
        
        this.behaviorState.currentAction = 'speaking';
        window.sendCat.speak(decision.message, 6000);
        
        // Volver a observing después de hablar
        setTimeout(() => {
            this.behaviorState.currentAction = 'observing';
        }, 2000);
    }
    
    async executeCelebrate(decision) {
        if (!window.sendCat) return;
        
        this.behaviorState.currentAction = 'celebrating';
        window.sendCat.celebrate();
        
        if (decision.message) {
            setTimeout(() => {
                window.sendCat.speak(decision.message);
            }, 1000);
        }
        
        setTimeout(() => {
            this.behaviorState.currentAction = 'observing';
        }, 3000);
    }
    
    fallbackBehavior() {
        // Comportamiento simple si el LLM falla
        const behavior = this.webContext.userBehavior;
        
        if (behavior.idleTime > 8000 && this.behaviorState.currentAction === 'observing') {
            this.behaviorState.currentAction = 'helping';
            window.sendCat?.speak("¿Necesitas ayuda navegando? Daniel tiene casos súper interesantes.");
        }
    }
    
    // ========== EVENTOS ESPECÍFICOS ==========
    
    onSectionChange(newSection) {
        // El LLM manejará la reacción al cambio de sección
        // Este método se llama para trigger el análisis
        console.log('📍 Section change detected:', newSection);
    }
    
    // ========== UTILIDADES ==========
    
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }
    
    isUserNearElement(selector, threshold = 100) {
        const element = document.querySelector(selector);
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const lastMouse = this.webContext.userBehavior.mouseActivity.slice(-1)[0];
        if (!lastMouse) return false;
        
        const distance = Math.sqrt(
            Math.pow(lastMouse.position.x - (rect.left + rect.width/2), 2) +
            Math.pow(lastMouse.position.y - (rect.top + rect.height/2), 2)
        );
        
        return distance < threshold;
    }
    
    calculateEngagementLevel() {
        const behavior = this.webContext.userBehavior;
        let score = 0;
        
        // Tiempo en página
        const timeOnPage = Date.now() - (window.sendCat?.sessionStartTime || Date.now());
        if (timeOnPage > 30000) score += 2;
        if (timeOnPage > 60000) score += 2;
        
        // Secciones visitadas
        score += Math.min(behavior.visitedSections.size * 2, 4);
        
        // Interacciones
        if (behavior.hoveredElements.length > 2) score += 1;
        if (behavior.clickedElements.length > 0) score += 2;
        
        // Scroll patterns (no demasiado rápido)
        const avgScrollSpeed = behavior.scrollPattern.reduce((a, s) => a + s.speed, 0) / 
                              Math.max(behavior.scrollPattern.length, 1);
        if (avgScrollSpeed < 50) score += 1; // Lectura pausada
        
        return Math.min(score, 10);
    }
    
    assessConversionOpportunity() {
        const behavior = this.webContext.userBehavior;
        let opportunity = 0;
        
        // Tiempo suficiente en página
        const timeOnPage = Date.now() - (window.sendCat?.sessionStartTime || Date.now());
        if (timeOnPage > 45000) opportunity += 3;
        
        // Ha visitado secciones clave
        if (behavior.visitedSections.has('hero')) opportunity += 1;
        if (behavior.visitedSections.has('chat-section')) opportunity += 2;
        if (behavior.visitedSections.has('cta-section')) opportunity += 3;
        
        // Interacción con elementos importantes
        const ctaHover = behavior.hoveredElements.find(h => h.element.includes('scheduleCall'));
        if (ctaHover) opportunity += ctaHover.duration > 1000 ? 2 : 1;
        
        return Math.min(opportunity, 10);
    }
    
    // ========== API PÚBLICA ==========
    
    getCurrentDecision() {
        return this.behaviorState.lastDecision;
    }
    
    getWebContext() {
        return this.webContext;
    }
    
    forceAnalysis() {
        this.analyzeCurrentSituation();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que otros sistemas estén listos
    setTimeout(() => {
        window.sendCatIntelligence = new SendCatIntelligence();
        console.log('🚀 Send-Cat Intelligence activado');
    }, 1000);
});

// Exportar para uso global
window.SendCatIntelligence = SendCatIntelligence;