// ============================================
// Controlador de Mascota - AI Cat
// ============================================

class AICatMascot {
    constructor() {
        this.cat = document.getElementById('aiCat');
        this.currentState = 'idle';
        this.isBlinking = false;
        this.blinkInterval = null;
        this.eyeTrackingEnabled = true;
        this.mousePosition = { x: 0, y: 0 };
        
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.startBlinking();
        this.startIdleAnimations();
    }
    
    // Inicializar elementos del SVG
    initializeElements() {
        if (!this.cat) return {};
        
        return {
            catBody: this.cat.querySelector('.cat-body'),
            ears: this.cat.querySelector('.ears'),
            eyeLeft: this.cat.querySelector('.eye-left'),
            eyeRight: this.cat.querySelector('.eye-right'),
            pupilLeft: this.cat.querySelector('.pupil-left'),
            pupilRight: this.cat.querySelector('.pupil-right'),
            eyelid: this.cat.querySelector('.eyelid'),
            eyesOpen: this.cat.querySelector('.eyes-open'),
            eyesHappy: this.cat.querySelector('.eyes-happy'),
            eyesThinking: this.cat.querySelector('.eyes-thinking'),
            speechIndicator: this.cat.querySelector('.speech-indicator'),
            tail: this.cat.querySelector('.tail')
        };
    }
    
    // Configurar event listeners
    setupEventListeners() {
        if (!this.cat) return;
        
        // Seguimiento del mouse
        document.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
            if (this.eyeTrackingEnabled) {
                this.lookAtMouse(e.clientX, e.clientY);
            }
        });
        
        // Interacciones con el gato
        this.cat.addEventListener('mouseenter', () => {
            this.setState('happy');
            this.showHappyEyes();
        });
        
        this.cat.addEventListener('mouseleave', () => {
            this.setState('idle');
            this.showNormalEyes();
            this.centerEyes();
        });
        
        this.cat.addEventListener('click', () => {
            this.playClickAnimation();
        });
    }
    
    // Cambiar estado del gato
    setState(newState) {
        if (this.currentState === newState) return;
        
        // Remover estado anterior
        this.cat.classList.remove(`state-${this.currentState}`);
        
        // Agregar nuevo estado
        this.currentState = newState;
        this.cat.classList.add(`state-${newState}`);
        
        // Ejecutar animaciones específicas del estado
        this.executeStateAnimations(newState);
    }
    
    // Ejecutar animaciones específicas del estado
    executeStateAnimations(state) {
        const { ears, catBody } = this.elements;
        
        switch (state) {
            case 'listening':
                this.rotateEars(-8);
                this.showNormalEyes();
                this.enableEyeTracking();
                break;
                
            case 'thinking':
                this.rotateHead(-3);
                this.rotateEars(-4);
                this.showThinkingEyes();
                this.lookToSide();
                break;
                
            case 'talking':
                this.showSpeechIndicator(true);
                this.showNormalEyes();
                this.animateTail();
                break;
                
            case 'happy':
                this.rotateEars(8);
                this.rotateHead(3);
                this.showHappyEyes();
                break;
                
            case 'idle':
            default:
                this.resetPositions();
                this.showNormalEyes();
                this.showSpeechIndicator(false);
                this.enableEyeTracking();
                break;
        }
    }
    
    // Seguimiento de ojos al mouse
    lookAtMouse(mouseX, mouseY) {
        if (!this.cat || !this.eyeTrackingEnabled) return;
        
        const catRect = this.cat.getBoundingClientRect();
        const catCenterX = catRect.left + catRect.width / 2;
        const catCenterY = catRect.top + catRect.height / 2;
        
        // Calcular dirección relativa
        const deltaX = (mouseX - catCenterX) / catRect.width;
        const deltaY = (mouseY - catCenterY) / catRect.height;
        
        // Limitar movimiento de pupilas
        const maxMovement = 8;
        const moveX = Math.max(-1, Math.min(1, deltaX)) * maxMovement;
        const moveY = Math.max(-1, Math.min(1, deltaY)) * maxMovement * 0.6;
        
        this.movePupils(moveX, moveY);
    }
    
    // Mover pupilas
    movePupils(x, y) {
        const { eyeLeft, eyeRight } = this.elements;
        if (!eyeLeft || !eyeRight) return;
        
        eyeLeft.setAttribute('transform', `translate(${x}, ${y})`);
        eyeRight.setAttribute('transform', `translate(${x}, ${y})`);
    }
    
    // Centrar ojos
    centerEyes() {
        this.movePupils(0, 0);
    }
    
    // Mirar hacia un lado
    lookToSide() {
        this.disableEyeTracking();
        this.movePupils(12, -3);
    }
    
    // Rotar orejas
    rotateEars(degrees) {
        const { ears } = this.elements;
        if (!ears) return;
        
        ears.style.transform = `rotate(${degrees}deg)`;
        ears.style.transition = 'transform 0.3s ease';
    }
    
    // Rotar cabeza
    rotateHead(degrees) {
        const { catBody } = this.elements;
        if (!catBody) return;
        
        catBody.style.transform = `rotate(${degrees}deg)`;
        catBody.style.transition = 'transform 0.3s ease';
    }
    
    // Mostrar diferentes tipos de ojos
    showNormalEyes() {
        this.setEyeOpacity('open', 1);
        this.setEyeOpacity('happy', 0);
        this.setEyeOpacity('thinking', 0);
    }
    
    showHappyEyes() {
        this.setEyeOpacity('open', 0);
        this.setEyeOpacity('happy', 1);
        this.setEyeOpacity('thinking', 0);
    }
    
    showThinkingEyes() {
        this.setEyeOpacity('open', 0.3);
        this.setEyeOpacity('happy', 0);
        this.setEyeOpacity('thinking', 1);
    }
    
    // Configurar opacidad de ojos
    setEyeOpacity(type, opacity) {
        const element = this.elements[`eyes${type.charAt(0).toUpperCase() + type.slice(1)}`];
        if (element) {
            element.style.opacity = opacity;
            element.style.transition = 'opacity 0.2s ease';
        }
    }
    
    // Mostrar/ocultar indicador de habla
    showSpeechIndicator(show) {
        const { speechIndicator } = this.elements;
        if (!speechIndicator) return;
        
        speechIndicator.style.opacity = show ? '1' : '0';
        speechIndicator.style.transition = 'opacity 0.2s ease';
        
        if (show) {
            speechIndicator.style.animation = 'speechPulse 0.6s ease infinite alternate';
        } else {
            speechIndicator.style.animation = '';
        }
    }
    
    // Animar cola
    animateTail() {
        const { tail } = this.elements;
        if (!tail) return;
        
        tail.style.animation = 'tailSwish 1.5s ease-in-out infinite';
    }
    
    // Resetear posiciones
    resetPositions() {
        const { ears, catBody } = this.elements;
        
        if (ears) {
            ears.style.transform = 'rotate(0deg)';
        }
        
        if (catBody) {
            catBody.style.transform = 'rotate(0deg)';
        }
        
        this.centerEyes();
    }
    
    // Habilitar seguimiento de ojos
    enableEyeTracking() {
        this.eyeTrackingEnabled = true;
    }
    
    // Deshabilitar seguimiento de ojos
    disableEyeTracking() {
        this.eyeTrackingEnabled = false;
    }
    
    // Parpadeo automático
    startBlinking() {
        this.blinkInterval = setInterval(() => {
            if (!this.isBlinking && this.currentState !== 'thinking') {
                this.blink();
            }
        }, 2500 + Math.random() * 2000); // Parpadeo aleatorio cada 2.5-4.5 segundos
    }
    
    // Ejecutar parpadeo
    async blink() {
        const { eyelid } = this.elements;
        if (!eyelid || this.isBlinking) return;
        
        this.isBlinking = true;
        
        // Cerrar ojos
        eyelid.style.transform = 'scaleY(1)';
        eyelid.style.transition = 'transform 0.1s ease';
        
        await this.delay(120);
        
        // Abrir ojos
        eyelid.style.transform = 'scaleY(0)';
        
        await this.delay(100);
        this.isBlinking = false;
    }
    
    // Animación de click
    async playClickAnimation() {
        const originalTransform = this.cat.style.transform;
        
        // Animación de "rebote"
        this.cat.style.transition = 'transform 0.1s ease';
        this.cat.style.transform = 'scale(0.95)';
        
        await this.delay(100);
        
        this.cat.style.transform = 'scale(1.05)';
        
        await this.delay(100);
        
        this.cat.style.transform = originalTransform || 'scale(1)';
        
        // Parpadeo especial
        this.blink();
    }
    
    // Animaciones de idle aleatorias
    startIdleAnimations() {
        setInterval(() => {
            if (this.currentState === 'idle') {
                this.randomIdleAction();
            }
        }, 8000 + Math.random() * 7000); // Cada 8-15 segundos
    }
    
    // Acción aleatoria de idle
    randomIdleAction() {
        const actions = [
            () => this.lookToSide(),
            () => this.subtleEarTwitch(),
            () => this.slowBlink()
        ];
        
        const action = actions[Math.floor(Math.random() * actions.length)];
        action();
        
        // Volver a normal después de un tiempo
        setTimeout(() => {
            if (this.currentState === 'idle') {
                this.centerEyes();
                this.enableEyeTracking();
            }
        }, 1500);
    }
    
    // Movimiento sutil de orejas
    subtleEarTwitch() {
        const { ears } = this.elements;
        if (!ears) return;
        
        ears.style.transform = 'rotate(3deg)';
        setTimeout(() => {
            ears.style.transform = 'rotate(0deg)';
        }, 300);
    }
    
    // Parpadeo lento
    async slowBlink() {
        const { eyelid } = this.elements;
        if (!eyelid || this.isBlinking) return;
        
        this.isBlinking = true;
        
        eyelid.style.transform = 'scaleY(1)';
        eyelid.style.transition = 'transform 0.3s ease';
        
        await this.delay(400);
        
        eyelid.style.transform = 'scaleY(0)';
        eyelid.style.transition = 'transform 0.2s ease';
        
        await this.delay(200);
        this.isBlinking = false;
    }
    
    // Reaccionar a eventos del chat
    onUserTyping() {
        this.setState('listening');
    }
    
    onAIResponding() {
        this.setState('thinking');
        setTimeout(() => {
            this.setState('talking');
        }, 500);
    }
    
    onChatComplete() {
        this.setState('happy');
        setTimeout(() => {
            this.setState('idle');
        }, 2000);
    }
    
    // Destruir mascota
    destroy() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
        }
        
        document.removeEventListener('mousemove', this.lookAtMouse);
    }
    
    // Utilidad para delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.aiCatMascot = new AICatMascot();
});

// Exportar para uso global
window.AICatMascot = AICatMascot;