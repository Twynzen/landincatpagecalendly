import { Component, OnInit, OnDestroy, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService } from '../../services/lighting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface CatState {
  visibility: 'hidden' | 'semi' | 'visible';
  isCaressed: boolean;
  eyesFollowCursor: boolean;
  currentEyePosition: { x: number; y: number };
}

@Component({
  selector: 'app-cat-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cat-guide.component.html',
  styleUrl: './cat-guide.component.scss'
})
export class CatGuideComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private catElement?: HTMLElement;
  private audioElement?: HTMLAudioElement;
  
  catState: CatState = {
    visibility: 'hidden',
    isCaressed: false,
    eyesFollowCursor: false,
    currentEyePosition: { x: 0, y: 0 }
  };

  showHeartEffect = false;
  showTooltip = false;
  tooltipMessage = '';
  currentMousePosition = { x: 0, y: 0 };

  constructor(
    private lightingService: LightingService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initializeCat();
    this.setupLightingSubscription();
    this.loadAudioEffect();
  }

  private initializeCat(): void {
    setTimeout(() => {
      this.catElement = this.elementRef.nativeElement.querySelector('.cat-container');
    }, 100);
  }

  private setupLightingSubscription(): void {
    // Subscribe to illumination changes
    this.lightingService.getIllumination()
      .pipe(takeUntil(this.destroy$))
      .subscribe(illumination => {
        this.updateCatVisibility(illumination);
      });
  }

  private loadAudioEffect(): void {
    this.audioElement = new Audio('/assets/ronroneo.wav');
    this.audioElement.volume = 0.3;
    this.audioElement.preload = 'auto';
  }

  private updateCatVisibility(illumination: number): void {
    const previousVisibility = this.catState.visibility;
    
    if (illumination < 0.1) {
      this.catState.visibility = 'hidden';
      this.catState.eyesFollowCursor = false;
    } else if (illumination < 0.5) {
      this.catState.visibility = 'semi';
      this.catState.eyesFollowCursor = false;
    } else {
      this.catState.visibility = 'visible';
      this.catState.eyesFollowCursor = true;
    }

    // Trigger wake up animation when becoming visible
    if (previousVisibility !== 'visible' && this.catState.visibility === 'visible') {
      this.triggerWakeUpAnimation();
    }
  }

  private triggerWakeUpAnimation(): void {
    if (!this.catElement) return;
    
    this.catElement.classList.add('waking-up');
    setTimeout(() => {
      this.catElement?.classList.remove('waking-up');
    }, 2000);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.currentMousePosition = { x: event.clientX, y: event.clientY };
    
    if (this.catState.eyesFollowCursor && this.catElement) {
      this.updateEyePosition(event.clientX, event.clientY);
    }
  }

  private updateEyePosition(mouseX: number, mouseY: number): void {
    if (!this.catElement) return;

    const catRect = this.catElement.getBoundingClientRect();
    const catCenterX = catRect.left + catRect.width / 2;
    const catCenterY = catRect.top + catRect.height / 2;

    const deltaX = mouseX - catCenterX;
    const deltaY = mouseY - catCenterY;
    
    // Limit eye movement range
    const maxRange = 8;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 100, 1) * maxRange : 0;
    const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 100, 1) * maxRange : 0;

    this.catState.currentEyePosition = {
      x: normalizedX,
      y: normalizedY
    };
  }

  onCatHover(): void {
    if (this.catState.visibility === 'hidden') return;

    this.tooltipMessage = 'Gato IA especializado en consultoría de software';
    this.showTooltip = true;
  }

  onCatLeave(): void {
    this.showTooltip = false;
  }

  onCatClick(): void {
    if (this.catState.visibility === 'hidden') return;

    this.caressCat();
  }

  private caressCat(): void {
    // Play purring sound
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
      this.audioElement.play().catch(error => {
        console.warn('Could not play purring sound:', error);
      });
    }

    // Show heart effect
    this.showHeartEffect = true;
    setTimeout(() => {
      this.showHeartEffect = false;
    }, 2000);

    // Mark as caressed and show feeding message
    if (!this.catState.isCaressed) {
      this.catState.isCaressed = true;
      setTimeout(() => {
        this.tooltipMessage = 'Gracias por alimentarme, ahora si tienes dudas de los servicios del consultor Daniel Castiblanco clickealos y te explicaré lo que quieras';
        this.showTooltip = true;
        
        setTimeout(() => {
          this.showTooltip = false;
        }, 4000);
      }, 1000);
    }

    // Notify lighting service that cat is now caressed (for service tooltips)
    this.lightingService.setCatCaressed(this.catState.isCaressed);
  }

  // Called by service components when clicked
  explainService(serviceId: string): void {
    if (!this.catState.isCaressed) {
      this.tooltipMessage = 'Primero acaríciame para que pueda ayudarte';
      this.showTooltip = true;
      setTimeout(() => {
        this.showTooltip = false;
      }, 3000);
      return;
    }

    const explanations: any = {
      'rag-systems': 'RAG Systems - Daniel Castiblanco implementa sistemas de recuperación de información aumentada con IA para mejorar la precisión de las respuestas',
      'agent-orchestration': 'Agent Orchestration - Coordinación inteligente de múltiples agentes de IA trabajando en conjunto para resolver problemas complejos',
      'process-automation': 'Process Automation - Automatización inteligente de procesos empresariales utilizando IA para optimizar workflows',
      'local-llms': 'Local LLMs - Implementación de modelos de lenguaje privados en tu infraestructura para mayor control y seguridad',
      'finops-ai': 'FinOps AI - Optimización y control de costos en implementaciones de IA, maximizando ROI mientras se minimiza gasto',
      'custom-integrations': 'Custom Integrations - Integraciones personalizadas para conectar IA con tu stack tecnológico existente'
    };

    const explanation = explanations[serviceId];
    if (explanation) {
      this.tooltipMessage = explanation;
      this.showTooltip = true;
      setTimeout(() => {
        this.showTooltip = false;
      }, 6000);
    }
  }

  getTooltipStyle(): any {
    return {
      left: this.currentMousePosition.x + 20 + 'px',
      top: this.currentMousePosition.y - 10 + 'px',
      transform: this.currentMousePosition.x > window.innerWidth - 300 ? 'translateX(-100%)' : 'none'
    };
  }

  getCatClass(): string {
    const classes = ['cat-container'];
    
    classes.push(`visibility-${this.catState.visibility}`);
    
    if (this.catState.eyesFollowCursor) {
      classes.push('eyes-following');
    }
    
    if (this.catState.isCaressed) {
      classes.push('caressed');
    }
    
    return classes.join(' ');
  }

  getEyeStyle(): any {
    return {
      transform: `translate(${this.catState.currentEyePosition.x}px, ${this.catState.currentEyePosition.y}px)`
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
