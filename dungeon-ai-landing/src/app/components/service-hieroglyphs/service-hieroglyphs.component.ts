import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService } from '../../services/lighting.service';
import { CatGuideComponent } from '../cat-guide/cat-guide.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ServiceCard {
  id: string;
  title: string;
  iconSVG: string; // SVG content for the icon
  illuminated: boolean;
}

@Component({
  selector: 'app-service-hieroglyphs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-hieroglyphs.component.html',
  styleUrl: './service-hieroglyphs.component.scss'
})
export class ServiceHieroglyphsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  headerIlluminated = false;
  
  services: ServiceCard[] = [
    {
      id: 'rag-systems',
      title: 'RAG SYSTEMS',
      // WiFi/señal icon - barras verticales crecientes
      iconSVG: '<rect x="4" y="20" width="3" height="4" fill="currentColor"/><rect x="9" y="16" width="3" height="8" fill="currentColor"/><rect x="14" y="12" width="3" height="12" fill="currentColor"/><rect x="19" y="8" width="3" height="16" fill="currentColor"/><circle cx="26" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/>',
      illuminated: false
    },
    {
      id: 'agent-orchestration', 
      title: 'AGENT ORCHESTRATION',
      // Red de nodos conectados - más simple
      iconSVG: '<circle cx="16" cy="8" r="2.5" fill="currentColor"/><circle cx="8" cy="20" r="2.5" fill="currentColor"/><circle cx="24" cy="20" r="2.5" fill="currentColor"/><line x1="14" y1="10" x2="10" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="18" y1="10" x2="22" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="20" x2="24" y2="20" stroke="currentColor" stroke-width="1.5"/>',
      illuminated: false
    },
    {
      id: 'process-automation',
      title: 'PROCESS AUTOMATION', 
      // Engranajes simples
      iconSVG: '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><rect x="11" y="4" width="2" height="4" fill="currentColor"/><rect x="11" y="24" width="2" height="4" fill="currentColor"/><rect x="4" y="11" width="4" height="2" fill="currentColor"/><rect x="24" y="11" width="4" height="2" fill="currentColor"/>',
      illuminated: false
    },
    {
      id: 'local-llms',
      title: 'LOCAL LLMS',
      // Servidor/base datos - rectángulo con indicadores
      iconSVG: '<rect x="6" y="8" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="12" r="1.5" fill="currentColor"/><circle cx="10" cy="16" r="1.5" fill="currentColor"/><circle cx="10" cy="20" r="1.5" fill="currentColor"/><rect x="14" y="11" width="8" height="2" fill="currentColor"/><rect x="14" y="15" width="6" height="2" fill="currentColor"/><rect x="14" y="19" width="10" height="2" fill="currentColor"/>',
      illuminated: false
    },
    {
      id: 'finops-ai',
      title: 'FINOPS AI',
      // Gráfico con flecha hacia arriba - más simple
      iconSVG: '<polyline points="4,20 8,16 12,18 16,14 20,10 24,6" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="20,6 24,6 24,10" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/><circle cx="20" cy="10" r="1.5" fill="currentColor"/>',
      illuminated: false
    },
    {
      id: 'custom-integrations',
      title: 'CUSTOM INTEGRATIONS',
      // Red de conexiones múltiples - nodos con conexiones cruzadas
      iconSVG: '<circle cx="8" cy="8" r="2" fill="currentColor"/><circle cx="24" cy="8" r="2" fill="currentColor"/><circle cx="16" cy="16" r="2" fill="currentColor"/><circle cx="8" cy="24" r="2" fill="currentColor"/><circle cx="24" cy="24" r="2" fill="currentColor"/><line x1="8" y1="8" x2="24" y2="8" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="24" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="16" x2="8" y2="24" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="16" x2="24" y2="24" stroke="currentColor" stroke-width="1.5"/>',
      illuminated: false
    }
  ];

  @ViewChild('catGuide') catGuide?: CatGuideComponent;

  constructor(private lightingService: LightingService) {}

  ngOnInit(): void {
    this.setupLightingSubscription();
    this.registerIlluminatedElements();
  }

  private setupLightingSubscription(): void {
    this.lightingService.getIlluminatedElements()
      .pipe(takeUntil(this.destroy$))
      .subscribe(elements => {
        // Update header illumination
        const headerElement = elements.find(el => el.id === 'services-header');
        this.headerIlluminated = headerElement?.isVisible || false;
        
        // Update services illumination
        this.services.forEach(service => {
          const illuminatedElement = elements.find(el => el.id === `service-${service.id}`);
          service.illuminated = illuminatedElement?.isVisible || false;
        });
      });
  }

  private registerIlluminatedElements(): void {
    // Register header
    const headerElement = {
      id: 'services-header',
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.35,
      width: 600, // Mayor área de detección
      height: 80,  // Mayor área de detección
      requiredIntensity: 0.2, // Más fácil de iluminar
      currentIllumination: 0,
      isVisible: false,
      isPermanent: false
    };
    this.lightingService.registerIlluminatedElement(headerElement);
    
    // Register each service card in grid positions
    const gridPositions = [
      { x: 0.25, y: 0.55 }, // RAG Systems
      { x: 0.5, y: 0.55 },  // Agent Orchestration  
      { x: 0.75, y: 0.55 }, // Process Automation
      { x: 0.25, y: 0.75 }, // Local LLMs
      { x: 0.5, y: 0.75 },  // FinOps AI
      { x: 0.75, y: 0.75 }  // Custom Integrations
    ];
    
    this.services.forEach((service, index) => {
      const pos = gridPositions[index];
      const element = {
        id: `service-${service.id}`,
        x: window.innerWidth * pos.x,
        y: window.innerHeight * pos.y,
        width: 300, // Mayor área de detección
        height: 180, // Mayor área de detección  
        requiredIntensity: 0.2, // Más fácil de iluminar
        currentIllumination: 0,
        isVisible: false,
        isPermanent: false
      };
      
      this.lightingService.registerIlluminatedElement(element);
    });
  }

  onServiceClick(service: ServiceCard): void {
    if (!service.illuminated) {
      return; // Can't click on dark services
    }
    
    // Trigger cat explanation through ViewChild or service injection
    if (this.catGuide) {
      this.catGuide.explainService(service.id);
    } else {
      // Fallback: Find cat component and call method
      setTimeout(() => {
        const catComponent = document.querySelector('app-cat-guide') as any;
        if (catComponent && catComponent.__ngContext__) {
          const catInstance = catComponent.__ngContext__[0];
          if (catInstance && catInstance.explainService) {
            catInstance.explainService(service.id);
          }
        }
      }, 100);
    }
    
    // Visual feedback
    this.createClickEffect(service.id);
  }

  private createClickEffect(serviceId: string): void {
    const element = document.getElementById(`service-${serviceId}`);
    if (element) {
      element.classList.add('clicked');
      setTimeout(() => {
        element.classList.remove('clicked');
      }, 500);
    }
  }

  // Métodos helper removidos - CSS maneja estilos directamente

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Unregister illuminated elements
    this.services.forEach(service => {
      this.lightingService.unregisterIlluminatedElement(`service-${service.id}`);
    });
  }
}
