// ============================================
// Main Application Controller
// ============================================

(function() {
    'use strict';
    
    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', initializeApp);
    
    function initializeApp() {
        console.log('🚀 Initializing AI Consulting Landing...');
        
        // Inicializar smooth scroll
        initSmoothScroll();
        
        // Inicializar animaciones de scroll
        initScrollAnimations();
        
        // Inicializar botones de chat
        initChatButtons();
        
        // Inicializar enlaces de Calendly
        initCalendlyLinks();
        
        // Inicializar analytics si está habilitado
        if (CONFIG.ANALYTICS.enabled) {
            initAnalytics();
        }
        
        // Verificar estado del sistema
        checkSystemStatus();
    }
    
    // Smooth scroll para enlaces internos
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header-nav').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Animaciones al hacer scroll
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animar elementos hijos con delay
                    const children = entry.target.querySelectorAll('.animate-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);
        
        // Observar secciones
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('animate-on-scroll');
            observer.observe(section);
        });
        
        // Observar cards
        const cards = document.querySelectorAll('.path-card, .process-step');
        cards.forEach(card => {
            card.classList.add('animate-child');
        });
    }
    
    // Inicializar botones que abren el chat
    function initChatButtons() {
        const chatTriggers = [
            '#startChat',
            '#openChat',
            '#ctaChat'
        ];
        
        chatTriggers.forEach(selector => {
            const button = document.querySelector(selector);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    openChat();
                });
            }
        });
    }
    
    // Inicializar enlaces de Calendly
    function initCalendlyLinks() {
        const calendlyLinks = [
            '#scheduleCall',
            '#ctaSchedule',
            '#scheduleFromChat'
        ];
        
        calendlyLinks.forEach(selector => {
            const link = document.querySelector(selector);
            if (link) {
                link.href = CONFIG.CALENDLY_URL;
                link.target = '_blank';
                link.addEventListener('click', () => {
                    trackEvent('schedule_click', {
                        source: selector.replace('#', '')
                    });
                });
            }
        });
    }
    
    // Abrir chat
    function openChat() {
        if (window.chatManager) {
            window.chatManager.open();
            trackEvent('chat_opened');
        } else {
            console.error('Chat manager not initialized');
        }
    }
    
    // Inicializar Google Analytics
    function initAnalytics() {
        if (!CONFIG.ANALYTICS.GA_ID) return;
        
        // Cargar gtag
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ANALYTICS.GA_ID}`;
        document.head.appendChild(script);
        
        // Configurar gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', CONFIG.ANALYTICS.GA_ID);
    }
    
    // Trackear eventos
    function trackEvent(eventName, parameters = {}) {
        if (CONFIG.ANALYTICS.enabled && window.gtag) {
            window.gtag('event', eventName, {
                event_category: 'engagement',
                ...parameters
            });
        }
        
        // Log para desarrollo
        if (IS_DEVELOPMENT) {
            console.log('📊 Track event:', eventName, parameters);
        }
    }
    
    // Verificar estado del sistema
    async function checkSystemStatus() {
        // Solo en producción
        if (IS_DEVELOPMENT) {
            console.log('🔧 Running in development mode with mock API');
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/health`, {
                headers: {
                    'apikey': CONFIG.SUPABASE_ANON_KEY
                }
            });
            
            if (response.ok) {
                console.log('✅ System is operational');
            } else {
                console.warn('⚠️ System check failed:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ Could not check system status:', error.message);
        }
    }
    
    // Manejar errores globales
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        
        // Trackear errores críticos
        if (!IS_DEVELOPMENT && CONFIG.ANALYTICS.enabled) {
            trackEvent('javascript_error', {
                error_message: e.error?.message || 'Unknown error',
                error_stack: e.error?.stack?.substring(0, 500)
            });
        }
    });
    
    // Exportar funciones útiles globalmente
    window.app = {
        openChat,
        trackEvent,
        reset: () => {
            if (window.chatManager) {
                window.chatManager.reset();
            }
        }
    };
    
    // Agregar clase para detectar JS habilitado
    document.documentElement.classList.add('js-enabled');
    
    // Log de versión
    console.log('%c🤖 AI Consulting Platform v1.0.0', 'color: #6ee7ff; font-size: 14px; font-weight: bold;');
    console.log('%cCreated with passion by Daniel Castiblanco', 'color: #a8a8b8; font-size: 12px;');
})();