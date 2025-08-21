// ============================================
// Configuración Minimalista
// ============================================

const CONFIG = {
    // Calendly
    CALENDLY_URL: 'https://calendly.com/darmcastiblanco/30min',
    
    // Supabase (para producción)
    SUPABASE_URL: window.SUPABASE_URL || 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'your-anon-key',
    
    // Modo de desarrollo
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:',
    
    // Chat
    TYPING_DELAY: 800,
    MESSAGE_DELAY: 300,
    AUTO_FOCUS: true,
    
    // Analytics (opcional)
    ANALYTICS_ENABLED: false,
    GA_ID: ''
};

// Detectar modo y configurar
if (CONFIG.IS_DEVELOPMENT) {
    console.log('🔧 Modo desarrollo - Usando mock API');
} else {
    console.log('🚀 Modo producción');
}

window.CONFIG = CONFIG;