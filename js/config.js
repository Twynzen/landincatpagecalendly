// ============================================
// Configuración de la aplicación
// ============================================

const CONFIG = {
    // Supabase
    SUPABASE_URL: window.SUPABASE_URL || 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'your-anon-key',
    
    // Calendly
    CALENDLY_URL: window.CALENDLY_URL || 'https://calendly.com/darmcastiblanco/30min',
    
    // API Endpoints (Supabase Edge Functions)
    API_BASE_URL: window.API_BASE_URL || '',
    
    // Chat Configuration
    CHAT: {
        MAX_MESSAGES: 12, // 6 turnos máximo (6 usuario + 6 asistente)
        TYPING_DELAY: 1000, // Delay para simular typing
        MESSAGE_DELAY: 500, // Delay entre mensajes
        SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutos
    },
    
    // Lead Classification
    LEAD_TYPES: {
        KNOWS_WHAT_WANTS: 'SABE',
        WANTS_TO_START: 'NO_SABE'
    },
    
    // Analytics (opcional)
    ANALYTICS: {
        enabled: false,
        GA_ID: '' // Google Analytics ID si lo usas
    }
};

// Mensaje inicial del chat
const INITIAL_MESSAGE = `Hola 👋 Soy el asistente de Daniel.

En menos de 2 minutos entenderé tu caso y prepararemos tu consultoría gratuita.

¿Qué proceso o tarea te está quitando más tiempo hoy? (ventas, soporte al cliente, análisis de datos, back-office...)`;

// Preguntas predefinidas para guiar la conversación
const CHAT_QUESTIONS = {
    initial: "¿Qué proceso o tarea te está quitando más tiempo hoy?",
    measurement: "¿Cómo mides actualmente ese problema? (tiempo por tarea, casos por mes, costo por operación...)",
    goal: "Si pudiéramos resolver esto en 30-45 días, ¿qué resultado sería un éxito para ti?",
    data: "¿Dónde están los datos de este proceso? (CRM, Excel, base de datos, emails...)",
    constraints: "¿Hay restricciones importantes? (datos sensibles, debe ser on-premise, compliance específico...)",
    timeline: "¿Para cuándo necesitas ver resultados? ¿Quién toma la decisión final?"
};

// Exportar configuración
window.CONFIG = CONFIG;
window.INITIAL_MESSAGE = INITIAL_MESSAGE;
window.CHAT_QUESTIONS = CHAT_QUESTIONS;