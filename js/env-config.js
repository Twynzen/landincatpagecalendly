// ============================================
// ENV CONFIG - Carga segura de variables de entorno
// ============================================

class EnvConfig {
    constructor() {
        this.config = {};
        this.loadEnvVars();
    }
    
    loadEnvVars() {
        // En desarrollo, intentar cargar desde .env
        if (this.isDevelopment()) {
            this.loadFromEnvFile();
        }
        
        // Configuración con valores por defecto
        this.config = {
            // Supabase (solo las públicas)
            SUPABASE_URL: this.getEnvVar('VITE_SUPABASE_URL') || 'https://your-project.supabase.co',
            SUPABASE_ANON_KEY: this.getEnvVar('VITE_SUPABASE_ANON_KEY') || 'your-anon-key',
            
            // Calendly
            CALENDLY_URL: this.getEnvVar('VITE_CALENDLY_URL') || 'https://calendly.com/darmcastiblanco/30min',
            
            // Analytics
            ANALYTICS_ENABLED: this.getEnvVar('VITE_ANALYTICS_ENABLED') === 'true',
            GA_ID: this.getEnvVar('VITE_GA_ID') || '',
            
            // Development
            IS_DEVELOPMENT: this.isDevelopment(),
            API_ENDPOINT: this.getApiEndpoint(),
            
            // Chat
            TYPING_DELAY: 800,
            MESSAGE_DELAY: 300,
            AUTO_FOCUS: true
        };
        
        // Log de configuración (sin datos sensibles)
        console.log('🔧 Config loaded:', {
            isDevelopment: this.config.IS_DEVELOPMENT,
            hasSupabaseUrl: !!this.config.SUPABASE_URL,
            hasAnonKey: !!this.config.SUPABASE_ANON_KEY,
            apiEndpoint: this.config.API_ENDPOINT
        });
    }
    
    async loadFromEnvFile() {
        try {
            // En desarrollo, intentar cargar .env desde el servidor local
            const response = await fetch('/.env');
            if (response.ok) {
                const envText = await response.text();
                this.parseEnvText(envText);
            }
        } catch (error) {
            console.log('📝 No .env file found, using defaults');
        }
    }
    
    parseEnvText(envText) {
        const lines = envText.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) {
                    // Simular process.env para compatibilidad
                    window.process = window.process || { env: {} };
                    window.process.env[key] = value;
                }
            }
        });
    }
    
    getEnvVar(key) {
        // Intentar obtener de diferentes fuentes
        return window.process?.env?.[key] || 
               window[key] || 
               localStorage.getItem(key) ||
               null;
    }
    
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:' ||
               window.location.port === '8000';
    }
    
    getApiEndpoint() {
        if (this.isDevelopment()) {
            return null; // Usar mock en desarrollo
        }
        
        const supabaseUrl = this.getEnvVar('VITE_SUPABASE_URL');
        return supabaseUrl ? `${supabaseUrl}/functions/v1/chat` : null;
    }
    
    // Método público para obtener configuración
    get(key) {
        return this.config[key];
    }
    
    // Método para obtener toda la configuración
    getAll() {
        return { ...this.config };
    }
    
    // Método para verificar si tiene las credenciales necesarias
    hasValidCredentials() {
        return this.config.SUPABASE_URL && 
               this.config.SUPABASE_URL !== 'https://your-project.supabase.co' &&
               this.config.SUPABASE_ANON_KEY &&
               this.config.SUPABASE_ANON_KEY !== 'your-anon-key';
    }
    
    // Método para configurar variables en runtime (para testing)
    set(key, value) {
        this.config[key] = value;
    }
}

// Inicializar configuración
const envConfig = new EnvConfig();

// Exportar para compatibilidad con el código existente
window.CONFIG = envConfig.getAll();

// Exportar clase para uso avanzado
window.EnvConfig = EnvConfig;
window.envConfig = envConfig;

console.log('✅ EnvConfig initialized');