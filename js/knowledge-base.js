// ============================================
// Base de Conocimientos de Daniel Castiblanco
// ============================================

const DANIEL_KNOWLEDGE = {
    // Información personal
    profile: {
        name: "Daniel Castiblanco",
        role: "Consultor de IA",
        experience_years: 5,
        approach: "Orquestación de IA práctica con ROI medible",
        location: "Remoto/Global",
        languages: ["Español", "Inglés"]
    },

    // Filosofía de trabajo
    philosophy: {
        core: "Orquestación completa > chatbot simple: sistemas con datos, agentes y MLOps",
        principles: [
            "ROI primero: pilotos cortos con KPIs y SLI-SLO claros",
            "FinOps: costo bajo control, escalar solo lo que funciona",
            "Privacidad: opción de LLMs locales y anonimización",
            "Human-in-the-Loop: la IA potencia al equipo, no lo reemplaza",
            "Flexibilidad: desde chatbots simples hasta orquestación compleja según tu necesidad"
        ],
        diferentiator: "Desde chatbots simples hasta orquestación completa. La solución se adapta a tu caso y presupuesto"
    },

    // Expertise técnica
    expertise: {
        core_skills: [
            "Chatbots inteligentes para atención al cliente",
            "Orquestación de agentes y MCP",
            "RAG con evaluaciones y guardrails",
            "APIs ChatGPT/Claude/Gemini optimizadas",
            "LLMs locales (privacidad) e inferencia híbrida",
            "Automatización de soporte/ventas y analítica con KPIs"
        ],
        
        technologies: {
            llms: ["GPT-4", "Claude 3", "Gemini", "Llama 3", "Mistral", "Mixtral"],
            frameworks: ["LangChain", "LlamaIndex", "CrewAI", "AutoGen", "Semantic Kernel"],
            vector_dbs: ["Pinecone", "Qdrant", "Weaviate", "ChromaDB", "Milvus"],
            orchestration: ["MCP", "Temporal", "Airflow", "Prefect", "Dagster"],
            monitoring: ["Langfuse", "Phoenix", "Helicone", "Weights & Biases"],
            deployment: ["Modal", "Railway", "Supabase", "Vercel", "AWS Lambda"]
        },
        
        specializations: {
            "RAG Systems": "Retrieval-Augmented Generation con evaluación continua y guardrails",
            "Agent Orchestration": "Sistemas multi-agente con memoria y herramientas especializadas",
            "Local LLMs": "Deployment on-premise para máxima privacidad y control de costos",
            "FinOps AI": "Optimización de costos de inferencia y monitoreo de ROI",
            "MLOps": "CI/CD para modelos, evaluación continua y A/B testing"
        }
    },

    // Industrias y casos
    industries: {
        "Educación": {
            experience: "Analítica educativa y sistemas de reporting automático",
            solutions: [
                "Pipeline de datos académicos",
                "Reportes automáticos para decisiones",
                "Análisis de deserción y rendimiento",
                "Asistentes para profesores"
            ]
        },
        "Software/Startups": {
            experience: "Automatización de procesos y copilots de desarrollo",
            solutions: [
                "Copilots de código personalizados",
                "Automatización de QA y testing",
                "Documentación automática",
                "Análisis de logs y debugging"
            ]
        },
        "Retail/Servicios": {
            experience: "Soporte al cliente y optimización de operaciones",
            solutions: [
                "Automatización de soporte L1",
                "Clasificación de tickets",
                "Análisis de sentiment",
                "Optimización de inventario"
            ]
        },
        "Gaming/Comunidades": {
            experience: "Bots inteligentes y experiencias interactivas",
            solutions: [
                "Agentes narrativos en Discord",
                "NPCs con memoria persistente",
                "Moderación inteligente",
                "Generación de contenido dinámico"
            ]
        }
    },

    // Casos de éxito
    success_cases: [
        {
            type: "Soporte Automatizado",
            industry: "SaaS",
            problem: "80% tickets repetitivos, 48h respuesta promedio",
            solution: "RAG + clasificación + respuestas automáticas",
            result: "60% reducción tickets, 5min respuesta promedio",
            roi: "ROI 3.2x en 2 meses"
        },
        {
            type: "Pipeline Educativo",
            industry: "Educación",
            problem: "Reportes manuales tardaban 2 semanas",
            solution: "ETL + LLM para insights + dashboards automáticos",
            result: "Reportes en tiempo real con insights accionables",
            roi: "120 horas/mes ahorradas"
        },
        {
            type: "Agente Gaming",
            industry: "Gaming/Discord",
            problem: "Comunidad necesitaba moderación y engagement 24/7",
            solution: "Agente narrativo con memoria y personalidad",
            result: "40% aumento en engagement, moderación automática",
            roi: "Equivalente a 3 community managers"
        }
    ],

    // Proceso de trabajo
    process: {
        discovery: {
            duration: "30 minutos",
            focus: "Entender el dolor actual y métricas base",
            output: "3 oportunidades priorizadas por impacto"
        },
        pilot: {
            duration: "2-4 semanas",
            focus: "Un caso de uso específico con KPIs claros",
            output: "Sistema funcional con métricas de éxito"
        },
        scale: {
            duration: "Según resultados",
            focus: "Expandir lo que funciona, optimizar costos",
            output: "Sistema en producción con monitoreo"
        }
    },

    // Precios y modelos (interno, no mostrar directamente)
    pricing_model: {
        consultation: "Gratuita - 30 minutos",
        pilot: "Basado en complejidad y valor generado",
        production: "Licencia mensual o por uso",
        support: "Incluido primeros 30 días, luego SLA"
    },

    // Diferenciadores clave
    differentiators: [
        "No vendo tecnología, resuelvo problemas de negocio",
        "Pilotos con ROI medible en 30 días o menos",
        "Opciones on-premise para máxima privacidad",
        "FinOps integrado: sabes exactamente cuánto cuesta cada interacción",
        "Human-in-the-loop: la IA complementa, no reemplaza"
    ],

    // FAQ implícito (para responder naturalmente)
    common_concerns: {
        "¿Reemplazará a mi equipo?": "No, la IA potencia a tu equipo. Automatizamos lo repetitivo para que se enfoquen en lo estratégico.",
        "¿Qué pasa con la privacidad?": "Ofrezco opciones on-premise con LLMs locales. Tus datos nunca salen de tu infraestructura si así lo prefieres.",
        "¿Cuánto cuesta?": "Depende del caso de uso, pero siempre empezamos con un piloto de ROI claro. Si no genera valor, no pagas.",
        "¿Qué tan rápido veo resultados?": "Pilotos funcionales en 2-4 semanas. Primeros resultados medibles en 30 días.",
        "¿Necesito data scientists?": "No, entrego sistemas llave en mano con documentación y capacitación incluida.",
        "¿Qué pasa si no funciona?": "Los pilotos son de bajo riesgo. Si no cumple KPIs acordados, iteramos o pivotamos sin costo adicional."
    }
};

// Función helper para buscar información relevante
function getRelevantKnowledge(topic) {
    // Esta función busca información relevante basada en keywords
    const topicLower = topic.toLowerCase();
    let relevant = [];
    
    // Buscar en industrias
    for (const [industry, data] of Object.entries(DANIEL_KNOWLEDGE.industries)) {
        if (topicLower.includes(industry.toLowerCase())) {
            relevant.push({
                type: 'industry',
                data: data,
                industry: industry
            });
        }
    }
    
    // Buscar en tecnologías
    for (const [category, techs] of Object.entries(DANIEL_KNOWLEDGE.expertise.technologies)) {
        for (const tech of techs) {
            if (topicLower.includes(tech.toLowerCase())) {
                relevant.push({
                    type: 'technology',
                    category: category,
                    technology: tech
                });
            }
        }
    }
    
    // Buscar en casos de éxito
    for (const case_ of DANIEL_KNOWLEDGE.success_cases) {
        if (topicLower.includes(case_.industry.toLowerCase()) || 
            topicLower.includes(case_.type.toLowerCase())) {
            relevant.push({
                type: 'success_case',
                data: case_
            });
        }
    }
    
    return relevant;
}

// Exportar para uso global
window.DANIEL_KNOWLEDGE = DANIEL_KNOWLEDGE;
window.getRelevantKnowledge = getRelevantKnowledge;