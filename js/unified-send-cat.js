// ============================================
// UNIFIED SEND-CAT - Sistema Unificado Gato + Chat + IA
// ============================================

class UnifiedSendCat {
    constructor() {
        // Elementos DOM
        this.catElement = document.getElementById('floatingCat');
        this.catSvg = document.getElementById('aiCat');
        this.purringSound = document.getElementById('purringSound');
        
        // Estado del gato físico
        this.position = { x: 30, y: 30 };
        this.targetPosition = null;
        this.isMoving = false;
        this.isPurring = false;
        this.isBlinking = false;
        
        // Chat y conversación
        this.messages = [];
        this.isProcessing = false;
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.lastLLMCall = 0;
        this.rateLimitMs = 1000; // 1 segundo entre llamadas LLM
        
        // Awareness y contexto
        this.awareness = {
            currentSection: null,
            mousePosition: { x: 0, y: 0 },
            lastActivity: Date.now(),
            idleTime: 0,
            scrollPosition: 0,
            timeOnSections: {},
            hoveredElement: null,
            visitedSections: new Set(),
            userBehavior: []
        };
        
        // Memoria del usuario
        this.memory = {
            hasGreeted: false,
            conversationStage: 0, // 0=inicial, 1=descubrimiento, 2=cualificación, 3=cierre
            leadData: {
                industry: null,
                painPoints: [],
                urgency: null,
                budget: null,
                techLevel: null,
                qualification_score: 0
            },
            preferences: {
                responseSpeed: 'normal', // slow, normal, fast
                interactionStyle: 'friendly' // professional, friendly, casual
            }
        };
        
        // Estado de la conversación
        this.conversationState = {
            isActive: false,
            currentBubble: null,
            waitingForResponse: false,
            questionCount: 0,
            maxQuestions: 10
        };
        
        // Límites de pantalla (se actualizarán en init)
        this.boundaries = {
            minX: 50,
            maxX: window.innerWidth - 150,
            minY: 50,
            maxY: window.innerHeight - 150
        };
        
        // Configuración
        this.config = {
            moveSpeed: 1.5,
            idleThreshold: 8000,
            bubbleTimeout: 8000,
            bounceIntensity: 0.8,
            maxBubbleWidth: 280,
            catSize: 100
        };
        
        this.init();
    }
    
    // ========== INICIALIZACIÓN ==========
    
    init() {
        console.log('🤖 Unified Send-Cat System iniciado');
        
        this.updateBoundaries();
        this.setupEventListeners();
        this.startContextTracking();
        this.startBehaviorLoop();
        this.setupFloatingBehavior();
        
        // Posición inicial segura
        this.setPositionSafe(this.boundaries.maxX - 50, this.boundaries.maxY - 50);
        
        // Saludar después de 2 segundos
        setTimeout(() => this.greet(), 2000);
    }
    
    setupEventListeners() {
        // Eventos del gato físico
        this.catElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startPurring();
        });
        
        this.catElement.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.stopPurring();
        });
        
        this.catElement.addEventListener('mouseleave', () => {
            if (this.isPurring) this.stopPurring();
        });
        
        // Click para iniciar chat
        this.catElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.onCatClick();
        });
        
        // Eventos de ventana
        window.addEventListener('resize', () => {
            this.updateBoundaries();
            this.ensureInBounds();
        });
        
        // Audio setup
        if (this.purringSound) {
            this.purringSound.loop = true;
            this.purringSound.volume = 0.3;
        }
        
        // Prevent context menu
        this.catElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    updateBoundaries() {
        this.boundaries = {
            minX: 50,
            maxX: Math.max(200, window.innerWidth - 150),
            minY: 50,
            maxY: Math.max(200, window.innerHeight - 150)
        };
    }
    
    // ========== MOVIMIENTO CON BOUNDARY DETECTION ==========
    
    setPositionSafe(x, y) {
        // Asegurar que está dentro de los límites
        x = Math.max(this.boundaries.minX, Math.min(this.boundaries.maxX, x));
        y = Math.max(this.boundaries.minY, Math.min(this.boundaries.maxY, y));
        
        this.position.x = x;
        this.position.y = y;
        
        this.catElement.style.position = 'fixed';
        this.catElement.style.left = `${x}px`;
        this.catElement.style.top = `${y}px`;
        this.catElement.style.right = 'auto';
        this.catElement.style.bottom = 'auto';
    }
    
    moveToPositionSafe(x, y, callback) {
        if (this.isMoving) return;
        
        // Verificar límites del destino
        const targetX = Math.max(this.boundaries.minX, Math.min(this.boundaries.maxX, x));
        const targetY = Math.max(this.boundaries.minY, Math.min(this.boundaries.maxY, y));
        
        // Detectar si necesita rebote
        const needsBounceX = x !== targetX;
        const needsBounceY = y !== targetY;
        
        if (needsBounceX || needsBounceY) {
            this.performBounce(x, y, targetX, targetY, callback);
            return;
        }
        
        // Movimiento normal
        this.animateMovement(targetX, targetY, callback);
    }
    
    performBounce(originalX, originalY, safeX, safeY, callback) {
        this.isMoving = true;
        
        // Calcular rebote
        let bounceX = safeX;
        let bounceY = safeY;
        
        // Rebote horizontal
        if (originalX !== safeX) {
            const bounceDistance = 50 * this.config.bounceIntensity;
            if (originalX < this.boundaries.minX) {
                bounceX = this.boundaries.minX + bounceDistance;
            } else {
                bounceX = this.boundaries.maxX - bounceDistance;
            }
        }
        
        // Rebote vertical
        if (originalY !== safeY) {
            const bounceDistance = 30 * this.config.bounceIntensity;
            if (originalY < this.boundaries.minY) {
                bounceY = this.boundaries.minY + bounceDistance;
            } else {
                bounceY = this.boundaries.maxY - bounceDistance;
            }
        }
        
        // Agregar clase de rebote para efectos visuales
        this.catSvg.classList.add('bouncing');
        
        // Realizar movimiento de rebote
        this.animateMovement(bounceX, bounceY, () => {
            this.catSvg.classList.remove('bouncing');
            
            // Mostrar mensaje de rebote
            this.speak("¡Ups! No puedo salirme de la página 😸", 3000);
            
            if (callback) callback();
        });
    }
    
    animateMovement(targetX, targetY, callback) {
        this.isMoving = true;
        this.targetPosition = { x: targetX, y: targetY };
        
        const distance = Math.sqrt(
            Math.pow(targetX - this.position.x, 2) + 
            Math.pow(targetY - this.position.y, 2)
        );
        
        const duration = Math.max(500, (distance / 300) * this.config.moveSpeed * 1000);
        
        const startX = this.position.x;
        const startY = this.position.y;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing suave
            const easeProgress = this.easeInOutCubic(progress);
            
            const currentX = startX + (targetX - startX) * easeProgress;
            const currentY = startY + (targetY - startY) * easeProgress;
            
            this.setPositionSafe(currentX, currentY);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isMoving = false;
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    ensureInBounds() {
        if (this.position.x < this.boundaries.minX || 
            this.position.x > this.boundaries.maxX ||
            this.position.y < this.boundaries.minY || 
            this.position.y > this.boundaries.maxY) {
            
            this.setPositionSafe(this.position.x, this.position.y);
        }
    }
    
    // ========== COMPORTAMIENTO FLOTANTE ==========
    
    setupFloatingBehavior() {
        // Eye tracking
        document.addEventListener('mousemove', (e) => {
            if (!this.isBlinking && !this.isPurring) {
                requestAnimationFrame(() => this.updateEyePosition(e.clientX, e.clientY));
            }
        });
        
        // Flotación sutil cuando está idle
        setInterval(() => {
            if (!this.isMoving && !this.conversationState.isActive && this.awareness.idleTime > 10000) {
                this.subtleFloat();
            }
        }, 8000);
    }
    
    subtleFloat() {
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 40;
        
        const newX = this.position.x + offsetX;
        const newY = this.position.y + offsetY;
        
        this.moveToPositionSafe(newX, newY);
    }
    
    updateEyePosition(mouseX, mouseY) {
        const catRect = this.catElement.getBoundingClientRect();
        const catCenterX = catRect.left + catRect.width / 2;
        const catCenterY = catRect.top + catRect.height / 2;
        
        const deltaX = mouseX - catCenterX;
        const deltaY = mouseY - catCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance === 0) return;
        
        const maxMovement = 8;
        const eyeMovementX = Math.max(-maxMovement, Math.min(maxMovement, (deltaX / distance) * maxMovement));
        const eyeMovementY = Math.max(-maxMovement, Math.min(maxMovement, (deltaY / distance) * maxMovement));
        
        const leftPupil = this.catSvg.querySelector('.pupil-left');
        const rightPupil = this.catSvg.querySelector('.pupil-right');
        
        if (leftPupil && rightPupil) {
            leftPupil.style.transition = 'all 0.1s ease';
            rightPupil.style.transition = 'all 0.1s ease';
            
            leftPupil.setAttribute('cx', 160 + eyeMovementX);
            leftPupil.setAttribute('cy', 200 + eyeMovementY);
            rightPupil.setAttribute('cx', 240 + eyeMovementX);
            rightPupil.setAttribute('cy', 200 + eyeMovementY);
        }
    }
    
    // ========== SISTEMA DE RONRONEO ==========
    
    startPurring() {
        if (this.isPurring) return;
        
        this.isPurring = true;
        this.closeEyes();
        this.catSvg.classList.add('purring');
        
        if (this.purringSound) {
            try {
                this.purringSound.currentTime = 0;
                this.purringSound.play().catch(error => {
                    console.warn('🔇 No se pudo reproducir ronroneo:', error);
                });
            } catch (error) {
                console.warn('🔇 Error con el audio:', error);
            }
        }
        
        this.trackInteraction('cat_purr_start');
    }
    
    stopPurring() {
        if (!this.isPurring) return;
        
        this.isPurring = false;
        this.openEyes();
        this.catSvg.classList.remove('purring');
        
        if (this.purringSound) {
            try {
                this.purringSound.pause();
                this.purringSound.currentTime = 0;
            } catch (error) {
                console.warn('Error deteniendo audio:', error);
            }
        }
        
        this.trackInteraction('cat_purr_stop');
    }
    
    closeEyes() {
        const eyelid = this.catSvg.querySelector('.eyelid');
        if (!eyelid) return;
        
        this.isBlinking = true;
        
        // Centrar pupilas antes de cerrar
        const leftPupil = this.catSvg.querySelector('.pupil-left');
        const rightPupil = this.catSvg.querySelector('.pupil-right');
        if (leftPupil && rightPupil) {
            leftPupil.setAttribute('cx', '160');
            leftPupil.setAttribute('cy', '200');
            rightPupil.setAttribute('cx', '240');
            rightPupil.setAttribute('cy', '200');
        }
        
        eyelid.style.transition = 'transform 0.15s ease';
        eyelid.style.transform = 'scaleY(1)';
    }
    
    openEyes() {
        const eyelid = this.catSvg.querySelector('.eyelid');
        if (!eyelid) return;
        
        eyelid.style.transition = 'transform 0.15s ease';
        eyelid.style.transform = 'scaleY(0)';
        
        setTimeout(() => {
            this.isBlinking = false;
        }, 150);
    }
    
    // ========== SISTEMA DE CHAT INTELIGENTE ==========
    
    onCatClick() {
        if (this.conversationState.isActive) {
            // Si ya hay conversación activa, continuar
            this.promptUserInput();
        } else {
            // Iniciar nueva conversación
            this.startConversation();
        }
    }
    
    startConversation() {
        this.conversationState.isActive = true;
        this.memory.conversationStage = 1;
        
        // Mover a posición de conversación
        const centerX = window.innerWidth / 2 - 200;
        const centerY = window.innerHeight / 2;
        
        this.moveToPositionSafe(centerX, centerY, () => {
            this.speak("¡Hola! Soy Send-Cat 🤖 ¿En qué puedo ayudarte con IA?", 0, true);
        });
    }
    
    async promptUserInput() {
        // Remover burbuja existente
        this.removeBubble();
        
        // Crear input bubble
        const inputBubble = this.createInputBubble();
        document.body.appendChild(inputBubble);
        
        // Focus en el input
        const input = inputBubble.querySelector('.chat-input');
        setTimeout(() => input.focus(), 100);
    }
    
    createInputBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'send-cat-bubble input-bubble';
        bubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-name">Send-Cat:</span>
                <div class="input-container">
                    <input type="text" class="chat-input" placeholder="Escribe tu pregunta..." maxlength="200">
                    <button class="send-btn" disabled>Enviar</button>
                </div>
                <div class="input-help">Enter para enviar • Esc para cerrar</div>
            </div>
            <div class="bubble-tail"></div>
        `;
        
        this.positionBubble(bubble);
        this.conversationState.currentBubble = bubble;
        
        // Event listeners para el input
        const input = bubble.querySelector('.chat-input');
        const sendBtn = bubble.querySelector('.send-btn');
        
        input.addEventListener('input', () => {
            sendBtn.disabled = input.value.trim().length === 0;
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.processUserMessage(input.value.trim());
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeConversation();
            }
        });
        
        sendBtn.addEventListener('click', () => {
            if (input.value.trim()) {
                this.processUserMessage(input.value.trim());
            }
        });
        
        return bubble;
    }
    
    async processUserMessage(message) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.removeBubble();
        
        // Mostrar mensaje del usuario
        this.speak(`Tú: "${message}"`, 2000);
        
        // Guardar en memoria
        this.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Mostrar typing indicator
        await this.showTypingIndicator();
        
        // Generar respuesta inteligente
        const response = await this.generateIntelligentResponse(message);
        
        // Mostrar respuesta
        await this.speak(response, 0, true);
        
        this.conversationState.questionCount++;
        
        // Continuar conversación o finalizar
        if (this.conversationState.questionCount >= this.config.maxQuestions || 
            this.memory.conversationStage >= 3) {
            setTimeout(() => this.completeConversation(), 3000);
        } else {
            setTimeout(() => this.promptUserInput(), 2000);
        }
        
        this.isProcessing = false;
    }
    
    async generateIntelligentResponse(message) {
        // Implementar rate limiting
        const now = Date.now();
        const timeSinceLastCall = now - this.lastLLMCall;
        
        if (timeSinceLastCall < this.rateLimitMs) {
            await this.delay(this.rateLimitMs - timeSinceLastCall);
        }
        
        this.lastLLMCall = Date.now();
        
        // Análisis contextual del mensaje
        const analysis = this.analyzeMessage(message);
        this.updateLeadQualification(analysis);
        
        try {
            // Intentar llamada real a LLM si tenemos configuración
            if (window.envConfig && !window.envConfig.get('IS_DEVELOPMENT')) {
                return await this.callRealLLM(message, analysis);
            }
        } catch (error) {
            console.warn('LLM call failed, using fallback:', error);
        }
        
        // Fallback a respuestas inteligentes locales
        return this.generateContextualResponse(message, analysis);
    }
    
    async callRealLLM(message, analysis) {
        const apiEndpoint = window.envConfig?.get('SUPABASE_URL') + '/functions/v1/chat';
        const apiKey = window.envConfig?.get('SUPABASE_ANON_KEY');
        
        if (!apiEndpoint || !apiKey) {
            throw new Error('Missing API configuration');
        }
        
        const context = {
            sessionId: this.sessionId,
            conversationStage: this.memory.conversationStage,
            leadData: this.memory.leadData,
            awareness: {
                currentSection: this.awareness.currentSection,
                timeOnPage: Date.now() - this.sessionStartTime
            },
            analysis: analysis
        };
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                message: message,
                context: context,
                session_id: this.sessionId
            })
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Guardar mensaje en memoria
        this.messages.push({
            role: 'assistant',
            content: data.response,
            timestamp: new Date()
        });
        
        return data.response;
    }
    
    generateContextualResponse(message, analysis) {
        const { intent, industry, painPoint, urgency } = analysis;
        
        // Respuestas basadas en el stage de conversación
        const stageResponses = {
            1: this.getDiscoveryResponse(intent, industry, painPoint),
            2: this.getQualificationResponse(urgency, this.memory.leadData),
            3: this.getClosingResponse()
        };
        
        let response = stageResponses[this.memory.conversationStage] || 
                      "Interesante. ¿Podrías contarme más detalles?";
        
        // Avanzar stage si es apropiado
        if (this.memory.conversationStage === 1 && (industry || painPoint)) {
            this.memory.conversationStage = 2;
        } else if (this.memory.conversationStage === 2 && urgency) {
            this.memory.conversationStage = 3;
        }
        
        return response;
    }
    
    getDiscoveryResponse(intent, industry, painPoint) {
        if (industry) {
            const industryResponses = {
                'educacion': "¡Genial! Daniel ha ayudado universidades a automatizar admisiones con IA. ¿Qué procesos consumen más tiempo en tu institución?",
                'software': "Perfecto! Daniel especializa en integrar IA en productos SaaS. ¿Qué funcionalidad quieres potenciar con IA?",
                'retail': "¡Excelente! Daniel ha implementado chatbots de soporte que redujeron tickets 70%. ¿Tu dolor principal es soporte al cliente?",
                'gaming': "¡Wow! Daniel creó bots de moderación para Discord. ¿Necesitas automatizar moderación o algo más específico?"
            };
            
            return industryResponses[industry] || "Interesante sector. ¿Qué procesos te gustaría automatizar con IA?";
        }
        
        if (painPoint) {
            const painResponses = {
                'manual_processes': "Entiendo el dolor de los procesos manuales. Daniel ha automatizado desde emails hasta análisis de datos. ¿Qué tarea específica te consume más tiempo?",
                'customer_support': "¡El soporte es perfecto para IA! Daniel ha creado sistemas que responden consultas 24/7. ¿Recibes muchas preguntas repetitivas?",
                'data_analysis': "¡Los reportes automáticos son una maravilla! Daniel puede crear dashboards que se actualizan solos. ¿Qué métricas necesitas trackear?"
            };
            
            return painResponses[painPoint] || "Veo que tienes un proceso que optimizar. Cuéntame más detalles.";
        }
        
        return "¿En qué industria trabajas? Así puedo sugerirte casos específicos que Daniel ha resuelto.";
    }
    
    getQualificationResponse(urgency, leadData) {
        if (urgency === 'high') {
            return "¡Perfecto! Daniel tiene disponibilidad esta semana para casos urgentes. ¿Hay alguna fecha límite específica?";
        }
        
        if (leadData.industry && leadData.painPoints.length > 0) {
            return "Con base en lo que me cuentas, Daniel podría tener tu solución lista en 2-3 semanas. ¿Te interesa una consultoría gratuita de 30 min?";
        }
        
        return "¿Qué tan prioritario es esto para tu equipo? ¿Hay algún deadline específico?";
    }
    
    getClosingResponse() {
        const closingMessages = [
            "¡Perfecto! Tienes un caso ideal para Daniel. ¿Agendamos 30 minutos esta semana?",
            "Con esta información, Daniel puede preparar una demo específica para ti. ¿Te parece bien agendar?",
            "¡Excelente! Daniel ha resuelto casos similares con ROI de 300%+. ¿Coordinamos una llamada?"
        ];
        
        return closingMessages[Math.floor(Math.random() * closingMessages.length)];
    }
    
    // ========== ANÁLISIS INTELIGENTE ==========
    
    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        return {
            intent: this.detectIntent(lowerMessage),
            industry: this.detectIndustry(lowerMessage),
            painPoint: this.detectPainPoint(lowerMessage),
            urgency: this.detectUrgency(lowerMessage),
            budget: this.detectBudget(lowerMessage)
        };
    }
    
    detectIntent(message) {
        const intents = {
            greeting: /hola|buenos|hi|hello|hey/,
            pricing: /precio|costo|cuanto|presupuesto|barato|caro/,
            demo: /demo|ejemplo|caso|muestra|ver/,
            schedule: /agendar|reunion|cita|llamada|consulta|calendario/,
            problem: /problema|dolor|dificultad|ayuda|solucion/,
            technical: /rag|llm|ai|gpt|integracion|api/
        };
        
        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(message)) return intent;
        }
        
        return 'general';
    }
    
    detectIndustry(message) {
        const industries = {
            'educacion': /educacion|universidad|colegio|estudiante|profesor|academia/,
            'software': /software|desarrollo|app|saas|startup|tech/,
            'retail': /retail|ventas|ecommerce|tienda|cliente/,
            'gaming': /gaming|juego|discord|comunidad|streamer/,
            'salud': /salud|medico|hospital|paciente|clinica/,
            'finanzas': /banco|finanzas|credito|inversion/
        };
        
        for (const [industry, pattern] of Object.entries(industries)) {
            if (pattern.test(message)) return industry;
        }
        
        return null;
    }
    
    detectPainPoint(message) {
        const painPoints = {
            'manual_processes': /manual|repetitivo|tiempo|tedioso/,
            'customer_support': /soporte|tickets|consultas|atencion/,
            'data_analysis': /datos|reportes|dashboard|metricas/,
            'automation': /automatizar|optimizar|eficiencia/
        };
        
        for (const [pain, pattern] of Object.entries(painPoints)) {
            if (pattern.test(message)) return pain;
        }
        
        return null;
    }
    
    detectUrgency(message) {
        if (/urgente|ya|ahora|rapido|inmediato/.test(message)) return 'high';
        if (/semana|mes|pronto/.test(message)) return 'medium';
        if (/futuro|algun|momento|evaluar/.test(message)) return 'low';
        return null;
    }
    
    detectBudget(message) {
        if (/presupuesto|budget|dinero|inversion/.test(message)) {
            if (/poco|barato|limitado/.test(message)) return 'low';
            if (/amplio|suficiente|bueno/.test(message)) return 'high';
            return 'medium';
        }
        return null;
    }
    
    updateLeadQualification(analysis) {
        const { industry, painPoint, urgency, budget } = analysis;
        
        if (industry) {
            this.memory.leadData.industry = industry;
            this.memory.leadData.qualification_score += 2;
        }
        
        if (painPoint && !this.memory.leadData.painPoints.includes(painPoint)) {
            this.memory.leadData.painPoints.push(painPoint);
            this.memory.leadData.qualification_score += 3;
        }
        
        if (urgency) {
            this.memory.leadData.urgency = urgency;
            const urgencyScores = { low: 1, medium: 2, high: 4 };
            this.memory.leadData.qualification_score += urgencyScores[urgency];
        }
        
        if (budget) {
            this.memory.leadData.budget = budget;
            this.memory.leadData.qualification_score += 2;
        }
    }
    
    // ========== UI y BURBUJAS ==========
    
    speak(message, duration = 6000, showInput = false) {
        this.removeBubble();
        
        const bubble = document.createElement('div');
        bubble.className = 'send-cat-bubble';
        bubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-name">Send-Cat:</span>
                <p>${this.escapeHtml(message)}</p>
            </div>
            <div class="bubble-tail"></div>
        `;
        
        this.positionBubble(bubble);
        this.conversationState.currentBubble = bubble;
        document.body.appendChild(bubble);
        
        // Animación de entrada
        bubble.style.opacity = '0';
        bubble.style.transform = 'scale(0.8)';
        setTimeout(() => {
            bubble.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1)';
        }, 10);
        
        // Auto-remover si no es interactiva
        if (!showInput && duration > 0) {
            setTimeout(() => {
                if (this.conversationState.currentBubble === bubble) {
                    this.removeBubble();
                }
            }, duration);
        }
        
        return new Promise(resolve => {
            if (showInput) {
                setTimeout(() => {
                    this.promptUserInput();
                    resolve();
                }, 1500);
            } else {
                resolve();
            }
        });
    }
    
    positionBubble(bubble) {
        const bubbleWidth = this.config.maxBubbleWidth;
        const bubbleHeight = 100; // Estimado
        
        // Posicionar a la izquierda del gato si hay espacio, sino a la derecha
        let bubbleX = this.position.x - bubbleWidth - 20;
        let bubbleY = this.position.y - 20;
        
        // Verificar límites y ajustar
        if (bubbleX < 20) {
            bubbleX = this.position.x + this.config.catSize + 20;
            bubble.classList.add('right-side');
        }
        
        if (bubbleY < 20) bubbleY = 20;
        if (bubbleY + bubbleHeight > window.innerHeight - 20) {
            bubbleY = window.innerHeight - bubbleHeight - 20;
        }
        
        bubble.style.position = 'fixed';
        bubble.style.left = `${bubbleX}px`;
        bubble.style.top = `${bubbleY}px`;
        bubble.style.zIndex = '10000';
        bubble.style.maxWidth = `${bubbleWidth}px`;
    }
    
    removeBubble() {
        if (this.conversationState.currentBubble) {
            this.conversationState.currentBubble.remove();
            this.conversationState.currentBubble = null;
        }
    }
    
    async showTypingIndicator() {
        const typingBubble = document.createElement('div');
        typingBubble.className = 'send-cat-bubble typing';
        typingBubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-name">Send-Cat:</span>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="bubble-tail"></div>
        `;
        
        this.positionBubble(typingBubble);
        document.body.appendChild(typingBubble);
        
        // Tiempo de typing realista (1-3 segundos)
        const typingTime = 1000 + Math.random() * 2000;
        await this.delay(typingTime);
        
        typingBubble.remove();
    }
    
    // ========== CONTEXTO Y AWARENESS ==========
    
    startContextTracking() {
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.awareness.mousePosition = { x: e.clientX, y: e.clientY };
            this.awareness.lastActivity = Date.now();
        });
        
        // Scroll tracking
        document.addEventListener('scroll', () => {
            this.awareness.scrollPosition = window.scrollY;
            this.awareness.lastActivity = Date.now();
            this.detectCurrentSection();
        });
        
        // Idle tracking
        setInterval(() => {
            this.awareness.idleTime = Date.now() - this.awareness.lastActivity;
        }, 1000);
        
        this.detectCurrentSection();
    }
    
    detectCurrentSection() {
        const sections = document.querySelectorAll('section, .hero, .chat-section, .cta-section');
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = section.className || section.tagName.toLowerCase();
            }
        });
        
        if (currentSection !== this.awareness.currentSection) {
            this.onSectionChange(currentSection);
            this.awareness.currentSection = currentSection;
        }
    }
    
    onSectionChange(section) {
        if (!this.awareness.visitedSections.has(section)) {
            this.awareness.visitedSections.add(section);
            
            // Solo hablar si no hay conversación activa
            if (!this.conversationState.isActive && !this.memory.hasGreeted) {
                const sectionMessages = {
                    'hero': "¡Bienvenido! Daniel ha automatizado procesos para +50 empresas 🚀",
                    'chat-section': "¿Tienes algún proceso repetitivo que te consume tiempo?",
                    'cta-section': "¡30 minutos gratuitos! Daniel analizará tu caso específico"
                };
                
                const message = sectionMessages[section];
                if (message) {
                    setTimeout(() => this.speak(message, 5000), 1000);
                }
            }
        }
    }
    
    startBehaviorLoop() {
        setInterval(() => {
            this.analyzeBehavior();
        }, 3000);
    }
    
    analyzeBehavior() {
        // Solo actuar si no hay conversación activa
        if (this.conversationState.isActive || this.isMoving) return;
        
        // Usuario idle por mucho tiempo
        if (this.awareness.idleTime > 15000 && Date.now() - (this.lastIdleHelp || 0) > 30000) {
            this.offerHelp();
            this.lastIdleHelp = Date.now();
        }
    }
    
    offerHelp() {
        const helpMessages = [
            "¿Tienes alguna pregunta sobre IA para tu negocio?",
            "¿Te gustaría ver casos de éxito similares al tuyo?",
            "¿Necesitas ayuda? Daniel tiene experiencia en tu sector"
        ];
        
        const message = helpMessages[Math.floor(Math.random() * helpMessages.length)];
        this.speak(message, 6000);
        
        // Movimiento sutil para llamar atención
        const wiggleX = this.position.x + (Math.random() - 0.5) * 80;
        const wiggleY = this.position.y + (Math.random() - 0.5) * 40;
        this.moveToPositionSafe(wiggleX, wiggleY);
    }
    
    // ========== SALUDO Y CICLO DE VIDA ==========
    
    greet() {
        if (this.memory.hasGreeted) return;
        
        this.memory.hasGreeted = true;
        
        // Mover al centro para saludo
        const centerX = window.innerWidth / 2 - 100;
        const centerY = window.innerHeight / 2 - 50;
        
        this.moveToPositionSafe(centerX, centerY, () => {
            this.speak("¡Hola! Soy Send-Cat 🤖 Asistente IA de Daniel Castiblanco. Haz click en mí para comenzar", 8000);
        });
    }
    
    completeConversation() {
        this.speak("¡Perfecto! Daniel tiene toda la info para preparar una propuesta. ¿Agendamos 30 minutos?", 0, false);
        
        // Mostrar CTA después de 3 segundos
        setTimeout(() => {
            this.showSchedulingCTA();
        }, 3000);
    }
    
    showSchedulingCTA() {
        this.removeBubble();
        
        const ctaBubble = document.createElement('div');
        ctaBubble.className = 'send-cat-bubble cta-bubble';
        ctaBubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-name">Send-Cat:</span>
                <p><strong>¡Listo para dar el siguiente paso!</strong></p>
                <a href="${window.CONFIG?.CALENDLY_URL || 'https://calendly.com/daniel-castiblanco/30min'}" 
                   target="_blank" class="cta-button">
                   📅 Agendar Consultoría Gratuita
                </a>
                <p class="cta-subtitle">30 min • Sin compromiso • Esta semana</p>
            </div>
            <div class="bubble-tail"></div>
        `;
        
        this.positionBubble(ctaBubble);
        this.conversationState.currentBubble = ctaBubble;
        document.body.appendChild(ctaBubble);
        
        // Guardar lead
        this.saveLead();
    }
    
    async saveLead() {
        const leadData = {
            session_id: this.sessionId,
            messages: this.messages,
            lead_data: this.memory.leadData,
            awareness_data: {
                sections_visited: Array.from(this.awareness.visitedSections),
                time_on_page: Date.now() - this.sessionStartTime,
                total_interactions: this.messages.length
            },
            completed_at: new Date().toISOString(),
            user_agent: navigator.userAgent
        };
        
        console.log('💾 Lead data collected:', leadData);
        
        try {
            // Intentar guardar en Supabase si está configurado
            if (window.envConfig && !window.envConfig.get('IS_DEVELOPMENT')) {
                await this.saveLeadToSupabase(leadData);
            }
        } catch (error) {
            console.warn('Could not save to Supabase:', error);
        }
        
        // Guardar localmente también
        localStorage.setItem(`lead_${this.sessionId}`, JSON.stringify(leadData));
    }
    
    async saveLeadToSupabase(leadData) {
        const apiEndpoint = window.envConfig?.get('SUPABASE_URL') + '/functions/v1/lead';
        const apiKey = window.envConfig?.get('SUPABASE_ANON_KEY');
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(leadData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save lead: ${response.status}`);
        }
        
        console.log('✅ Lead saved to Supabase');
    }
    
    closeConversation() {
        this.removeBubble();
        this.conversationState.isActive = false;
        this.conversationState.questionCount = 0;
        this.memory.conversationStage = 0;
        
        this.speak("¡Nos vemos! Estaré aquí si necesitas algo más 😸", 4000);
        
        // Volver a posición original
        setTimeout(() => {
            this.moveToPositionSafe(this.boundaries.maxX - 50, this.boundaries.maxY - 50);
        }, 2000);
    }
    
    // ========== UTILIDADES ==========
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ========== ESTILOS CSS ==========
const unifiedStyles = document.createElement('style');
unifiedStyles.textContent = `
    .send-cat-bubble {
        background: linear-gradient(135deg, rgba(13, 17, 23, 0.98), rgba(22, 27, 34, 0.95));
        border: 1px solid var(--matrix-green-dim, #238636);
        border-radius: 16px;
        padding: 16px 20px;
        max-width: 280px;
        box-shadow: 
            0 8px 32px rgba(0, 212, 85, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(0, 212, 85, 0.1);
        font-family: 'Share Tech Mono', monospace;
        color: var(--matrix-green-text, #7ee787);
        font-size: 14px;
        line-height: 1.5;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        position: relative;
        z-index: 10000;
    }
    
    .send-cat-bubble::before {
        content: '';
        position: absolute;
        top: -1px;
        left: -1px;
        right: -1px;
        bottom: -1px;
        background: linear-gradient(45deg, transparent 40%, rgba(0, 212, 85, 0.3) 50%, transparent 60%);
        border-radius: 16px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .send-cat-bubble:hover::before {
        opacity: 1;
    }
    
    .send-cat-bubble .bubble-name {
        color: var(--matrix-green-bright, #26d467);
        font-weight: bold;
        display: block;
        margin-bottom: 6px;
        font-size: 12px;
        text-shadow: 0 0 4px rgba(38, 212, 103, 0.4);
    }
    
    .send-cat-bubble p {
        margin: 0;
        text-shadow: 0 0 2px rgba(126, 231, 135, 0.3);
    }
    
    .send-cat-bubble .bubble-tail {
        position: absolute;
        bottom: 20px;
        left: -8px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px 8px 8px 0;
        border-color: transparent rgba(13, 17, 23, 0.98) transparent transparent;
        filter: drop-shadow(-1px 0 0 var(--matrix-green-dim, #238636));
    }
    
    .send-cat-bubble.right-side .bubble-tail {
        left: auto;
        right: -8px;
        border-width: 8px 0 8px 8px;
        border-color: transparent transparent transparent rgba(13, 17, 23, 0.98);
        filter: drop-shadow(1px 0 0 var(--matrix-green-dim, #238636));
    }
    
    .input-bubble .input-container {
        margin: 8px 0;
        display: flex;
        gap: 8px;
        align-items: center;
    }
    
    .input-bubble .chat-input {
        flex: 1;
        background: rgba(0, 0, 0, 0.6);
        border: 1px solid var(--matrix-green-dim, #238636);
        border-radius: 8px;
        padding: 8px 12px;
        color: var(--matrix-green-text, #7ee787);
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        outline: none;
        transition: all 0.2s ease;
    }
    
    .input-bubble .chat-input:focus {
        border-color: var(--matrix-green-bright, #26d467);
        box-shadow: 0 0 0 2px rgba(38, 212, 103, 0.2);
    }
    
    .input-bubble .send-btn {
        background: linear-gradient(45deg, var(--matrix-green-dim, #238636), var(--matrix-green, #00d455));
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        color: var(--bg-dark, #0d1117);
        font-family: 'Share Tech Mono', monospace;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .input-bubble .send-btn:hover:not(:disabled) {
        background: linear-gradient(45deg, var(--matrix-green, #00d455), var(--matrix-green-bright, #26d467));
        transform: translateY(-1px);
    }
    
    .input-bubble .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .input-bubble .input-help {
        font-size: 11px;
        color: var(--matrix-green-dim, #238636);
        margin-top: 4px;
        text-align: center;
    }
    
    .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 8px 0;
    }
    
    .typing-indicator span {
        width: 6px;
        height: 6px;
        background: var(--matrix-green, #00d455);
        border-radius: 50%;
        animation: typing-bounce 1.4s ease-in-out infinite;
    }
    
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    .cta-bubble .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, var(--matrix-green, #00d455), var(--matrix-green-bright, #26d467));
        color: var(--bg-dark, #0d1117);
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: bold;
        margin: 12px 0 8px 0;
        transition: all 0.3s ease;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 212, 85, 0.3);
    }
    
    .cta-bubble .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 212, 85, 0.4);
    }
    
    .cta-bubble .cta-subtitle {
        font-size: 12px;
        color: var(--matrix-green-dim, #238636);
        text-align: center;
        margin: 4px 0 0 0;
    }
    
    #floatingCat.bouncing {
        animation: bounce-hit 0.6s ease-out;
    }
    
    @keyframes typing-bounce {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-8px);
        }
    }
    
    @keyframes bounce-hit {
        0% { transform: scale(1); }
        20% { transform: scale(1.1); }
        40% { transform: scale(0.95); }
        60% { transform: scale(1.05); }
        80% { transform: scale(0.98); }
        100% { transform: scale(1); }
    }
`;

document.head.appendChild(unifiedStyles);

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que otros sistemas estén listos
    setTimeout(() => {
        window.unifiedSendCat = new UnifiedSendCat();
        console.log('🚀 Unified Send-Cat System activated!');
    }, 500);
});

// Exportar para uso global
window.UnifiedSendCat = UnifiedSendCat;