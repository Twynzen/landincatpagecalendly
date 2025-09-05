import { Injectable } from '@angular/core';
import { Service, ConsultationProcess } from '../models/service.model';

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  features: {
    icon: string;
    iconType?: 'emoji' | 'svg' | 'lucide';
    animation?: string;
    text: string;
  }[];
  technologies: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ServicesDataService {
  private services: Service[] = [
    {
      id: 'rag-systems',
      title: 'RAG Systems',
      shortDescription: 'Sistemas de recuperación de información',
      fullDescription: 'Retrieval-Augmented Generation con evaluación continua y guardrails. Sistemas que combinan bases de conocimiento con IA generativa para respuestas precisas y contextualizadas.',
      features: [
        'Búsqueda semántica avanzada',
        'Evaluación continua de calidad',
        'Guardrails y validación',
        'Integración con múltiples fuentes'
      ]
    },
    {
      id: 'agent-orchestration',
      title: 'Agent Orchestration',
      shortDescription: 'Coordinación de agentes IA',
      fullDescription: 'Sistemas multi-agente con memoria y herramientas especializadas. Orquestación completa de workflows con agentes autónomos que colaboran para resolver problemas complejos.',
      features: [
        'Agentes especializados por tarea',
        'Memoria persistente compartida',
        'Herramientas y APIs integradas',
        'Workflows automatizados'
      ]
    },
    {
      id: 'process-automation',
      title: 'Process Automation',
      shortDescription: 'Automatización de procesos',
      fullDescription: 'Automatización inteligente de procesos repetitivos con IA. Desde clasificación de tickets hasta generación de reportes automáticos.',
      features: [
        'Automatización de soporte L1',
        'Clasificación inteligente',
        'Generación de reportes',
        'Integración con sistemas existentes'
      ]
    },
    {
      id: 'local-llms',
      title: 'Local LLMs',
      shortDescription: 'Modelos privados en tu infraestructura',
      fullDescription: 'Deployment on-premise para máxima privacidad y control de costos. LLMs locales que nunca envían datos fuera de tu infraestructura.',
      features: [
        'Privacidad total de datos',
        'Control completo de costos',
        'Personalización del modelo',
        'Sin dependencias externas'
      ]
    },
    {
      id: 'finops-ai',
      title: 'FinOps AI',
      shortDescription: 'Optimización de costos IA',
      fullDescription: 'Optimización de costos de inferencia y monitoreo de ROI. Control total sobre el gasto en IA con métricas claras de retorno.',
      features: [
        'Monitoreo de costos en tiempo real',
        'Optimización de prompts',
        'ROI por caso de uso',
        'Alertas de presupuesto'
      ]
    },
    {
      id: 'custom-integrations',
      title: 'Custom Integrations',
      shortDescription: 'Integraciones personalizadas',
      fullDescription: 'Conexión de sistemas existentes con capacidades de IA. Integraciones a medida para tu stack tecnológico específico.',
      features: [
        'APIs personalizadas',
        'Webhooks y eventos',
        'Conectores específicos',
        'Migración de datos'
      ]
    }
  ];

  private consultationProcess: ConsultationProcess = {
    discovery: {
      duration: '30 minutos',
      description: 'Sesión gratuita para entender tu caso',
      deliverable: '3 oportunidades de IA priorizadas'
    },
    pilot: {
      duration: '2-4 semanas',
      description: 'Implementación de un caso de uso específico',
      deliverable: 'Sistema funcional con métricas'
    },
    scale: {
      duration: 'Según resultados',
      description: 'Expansión basada en ROI demostrado',
      deliverable: 'Sistema en producción'
    }
  };

  private profileData = {
    name: 'Daniel Castiblanco',
    title: 'Consultor de IA',
    subtitle: 'Orquestación inteligente y automatización'
  };

  private ctaData = {
    buttonText: 'AGENDAR SESIÓN GRATUITA',
    consultationUrl: 'https://calendly.com/danielcastiblanco',
    message: '30 minutos para identificar 3 oportunidades de IA en tu negocio'
  };

  private servicesDetail: ServiceDetail[] = [
    {
      id: 'rag-systems',
      title: 'RAG SYSTEMS',
      description: 'Sistemas de Recuperación y Generación Aumentada que conectan modelos de IA con bases de conocimiento empresarial, permitiendo respuestas contextualizadas y precisas basadas en documentación específica.',
      features: [
        { 
          icon: 'heart',
          iconType: 'lucide',
          animation: 'heartbeat',
          text: 'Indexación vectorial de documentos empresariales' 
        },
        { 
          icon: 'eye',
          iconType: 'lucide',
          animation: 'blink',
          text: 'Búsqueda semántica avanzada con embeddings' 
        },
        { 
          icon: 'brain',
          iconType: 'lucide',
          animation: 'pulse',
          text: 'Integración con LLMs para respuestas contextuales' 
        },
        { 
          icon: 'bar-chart',
          iconType: 'lucide',
          animation: 'bars-move',
          text: 'Analytics de uso y relevancia de información' 
        },
        { 
          icon: 'shield',
          iconType: 'lucide',
          animation: 'glow',
          text: 'Control de acceso granular a información sensible' 
        }
      ],
      technologies: ['LangChain', 'Pinecone', 'ChromaDB', 'OpenAI Embeddings', 'FAISS', 'PostgreSQL pgvector']
    },
    {
      id: 'agent-orchestration',
      title: 'AGENT ORCHESTRATION',
      description: 'Coordinación inteligente de múltiples agentes de IA especializados que trabajan en conjunto para resolver problemas complejos y automatizar flujos de trabajo empresariales.',
      features: [
        { icon: '🤖', iconType: 'emoji', text: 'Diseño de agentes especializados por dominio' },
        { icon: '🔄', iconType: 'emoji', text: 'Orquestación de tareas multi-agente' },
        { icon: '💬', iconType: 'emoji', text: 'Comunicación inter-agente con protocolos definidos' },
        { icon: '📈', iconType: 'emoji', text: 'Monitoreo de rendimiento y optimización continua' },
        { icon: '🎯', iconType: 'emoji', text: 'Routing inteligente basado en capacidades' }
      ],
      technologies: ['AutoGPT', 'LangGraph', 'CrewAI', 'Apache Airflow', 'Temporal', 'Microsoft AutoGen']
    },
    {
      id: 'process-automation',
      title: 'PROCESS AUTOMATION',
      description: 'Automatización end-to-end de procesos empresariales mediante IA, reduciendo trabajo manual y mejorando eficiencia operativa con flujos de trabajo inteligentes.',
      features: [
        { icon: '⚙️', iconType: 'emoji', text: 'Mapeo y digitalización de procesos existentes' },
        { icon: '🚀', iconType: 'emoji', text: 'Automatización con RPA + IA conversacional' },
        { icon: '📋', iconType: 'emoji', text: 'Gestión de excepciones con decisiones inteligentes' },
        { icon: '🔔', iconType: 'emoji', text: 'Alertas proactivas y escalamiento automático' },
        { icon: '📊', iconType: 'emoji', text: 'Dashboard de métricas y KPIs en tiempo real' }
      ],
      technologies: ['UiPath', 'Zapier', 'Make', 'n8n', 'Power Automate', 'Python Automation']
    },
    {
      id: 'local-llms',
      title: 'LOCAL LLMS',
      description: 'Implementación y optimización de modelos de lenguaje ejecutados localmente, garantizando privacidad total de datos y cumplimiento regulatorio sin dependencias cloud.',
      features: [
        { icon: '🖥️', iconType: 'emoji', text: 'Deployment on-premise de modelos open source' },
        { icon: '🔐', iconType: 'emoji', text: 'Privacidad total - datos nunca salen de tu infraestructura' },
        { icon: '⚡', iconType: 'emoji', text: 'Optimización de inferencia con quantization' },
        { icon: '🎛️', iconType: 'emoji', text: 'Fine-tuning con datos propietarios' },
        { icon: '📱', iconType: 'emoji', text: 'Edge deployment para aplicaciones móviles' }
      ],
      technologies: ['Llama 3', 'Mistral', 'Ollama', 'LocalAI', 'vLLM', 'GGUF/GGML', 'TensorRT']
    },
    {
      id: 'finops-ai',
      title: 'FINOPS AI',
      description: 'Optimización financiera de recursos cloud e IA mediante análisis predictivo, identificando oportunidades de ahorro y mejorando el ROI de inversiones tecnológicas.',
      features: [
        { icon: '💰', iconType: 'emoji', text: 'Análisis de costos cloud multi-proveedor' },
        { icon: '📉', iconType: 'emoji', text: 'Detección de recursos subutilizados con ML' },
        { icon: '🎯', iconType: 'emoji', text: 'Recomendaciones de rightsizing automáticas' },
        { icon: '📊', iconType: 'emoji', text: 'Forecasting de gastos con series temporales' },
        { icon: '⚡', iconType: 'emoji', text: 'Optimización de costos de inferencia LLM' }
      ],
      technologies: ['AWS Cost Explorer', 'Azure Cost Management', 'Kubecost', 'CloudHealth', 'Prophet', 'Custom Analytics']
    },
    {
      id: 'custom-integrations',
      title: 'CUSTOM INTEGRATIONS',
      description: 'Desarrollo de integraciones personalizadas que conectan sistemas legacy con tecnologías de IA modernas, creando ecosistemas tecnológicos cohesivos y eficientes.',
      features: [
        { icon: '🔌', iconType: 'emoji', text: 'APIs REST/GraphQL con capacidades IA' },
        { icon: '🔄', iconType: 'emoji', text: 'ETL pipelines inteligentes con validación ML' },
        { icon: '📡', iconType: 'emoji', text: 'Webhooks y event-driven architectures' },
        { icon: '🛡️', iconType: 'emoji', text: 'Middleware de seguridad y autenticación' },
        { icon: '📈', iconType: 'emoji', text: 'Real-time data streaming con procesamiento IA' }
      ],
      technologies: ['FastAPI', 'Apache Kafka', 'Redis', 'RabbitMQ', 'Airbyte', 'Mulesoft', 'Custom Python/Node.js']
    }
  ];

  constructor() { }

  getServices(): Service[] {
    return this.services;
  }

  getService(id: string): Service | undefined {
    return this.services.find(s => s.id === id);
  }

  getConsultationProcess(): ConsultationProcess {
    return this.consultationProcess;
  }

  getProfileData() {
    return this.profileData;
  }

  getCtaData() {
    return this.ctaData;
  }

  getServiceDetail(id: string): ServiceDetail | undefined {
    return this.servicesDetail.find(s => s.id === id);
  }

  getAllServiceDetails(): ServiceDetail[] {
    return this.servicesDetail;
  }
}
