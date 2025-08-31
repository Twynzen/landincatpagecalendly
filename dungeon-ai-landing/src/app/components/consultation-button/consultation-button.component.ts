import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService } from '../../services/lighting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface BinaryParticle {
  id: number;
  x: number;
  y: number;
  value: '0' | '1';
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  size: number;
}

@Component({
  selector: 'app-consultation-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-button.component.html',
  styleUrl: './consultation-button.component.scss'
})
export class ConsultationButtonComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isIlluminated = false;
  binaryParticles: BinaryParticle[] = [];
  showParticles = false;
  particleIdCounter = 0;
  buttonLetters: string[] = [];
  originalText = 'AGENDAR SESIÓN GRATUITA';
  matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Solo letras simples para Matrix
  
  consultationUrl = 'https://calendly.com/darmcastiblanco/30min?back=1'; // URL correcta de Calendly

  constructor(
    private lightingService: LightingService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupLightingSubscription();
    this.registerIlluminatedElement();
    this.initializeButtonText();
  }

  private initializeButtonText(): void {
    this.buttonLetters = this.originalText.split('');
  }

  private setupLightingSubscription(): void {
    this.lightingService.getIlluminatedElements()
      .pipe(takeUntil(this.destroy$))
      .subscribe(elements => {
        const buttonElement = elements.find(el => el.id === 'consultation-button');
        const wasIlluminated = this.isIlluminated;
        this.isIlluminated = buttonElement?.isVisible || false;
        
        // Trigger particles and Matrix animation when becoming illuminated
        if (!wasIlluminated && this.isIlluminated) {
          this.triggerIlluminationParticles();
          setTimeout(() => {
            this.triggerButtonTyping();
          }, 200);
        }
      });
  }

  private registerIlluminatedElement(): void {
    const element = {
      id: 'consultation-button',
      x: window.innerWidth * 0.5, // Center horizontally
      y: window.innerHeight * 0.85, // Near bottom
      width: 400, // Mayor área de detección
      height: 100, // Mayor área de detección
      requiredIntensity: 0.2,
      currentIllumination: 0,
      isVisible: false,
      isPermanent: false
    };
    
    this.lightingService.registerIlluminatedElement(element);
  }

  private triggerIlluminationParticles(): void {
    this.createBinaryParticles(30);
    this.showParticles = true;
    this.animateParticles();
  }

  private triggerButtonTyping(): void {
    const buttonElement = this.elementRef.nativeElement.querySelector('.consultation-btn.typing') as HTMLElement;
    if (buttonElement) {
      const text = buttonElement.getAttribute('data-text') || '';
      const typingSpan = buttonElement.querySelector('.typing-text') as HTMLElement;
      
      if (typingSpan && text) {
        this.createMatrixRevelation(typingSpan, text);
      }
    }
  }

  private createMatrixRevelation(element: HTMLElement, finalText: string): void {
    const chars = finalText.split('');
    const totalChars = chars.length;
    const revealedChars: boolean[] = new Array(totalChars).fill(false);
    const matrixChars = 'ABCDEFABCDEFABCDEFABCDEFABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Solo letras limpias para Glitchy Demo Italic
    
    // Crear estructura inicial con caracteres Matrix aleatorios
    element.innerHTML = chars.map(() => 
      matrixChars[Math.floor(Math.random() * matrixChars.length)]
    ).join('');
    
    element.style.borderRight = 'none';
    element.style.color = '#000'; // NEGRO para legibilidad sobre botón verde
    element.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.3)'; // Sombra negra para contraste
    element.style.fontFamily = "'Glitchy Demo Italic', 'Share Tech Mono', monospace"; // MANTENER fuente durante animación
    
    let revealedCount = 0;
    const revealInterval = setInterval(() => {
      if (revealedCount >= totalChars) {
        clearInterval(revealInterval);
        return;
      }
      
      // Elegir posición aleatoria no revelada
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalChars);
      } while (revealedChars[randomIndex]);
      
      // Revelar el carácter correcto
      revealedChars[randomIndex] = true;
      revealedCount++;
      
      // Actualizar display con caracteres revelados
      const displayChars = chars.map((char, index) => {
        if (revealedChars[index]) {
          return char; // Carácter final correcto
        } else if (char === ' ') {
          return ' '; // Mantener espacios
        } else {
          // Carácter Matrix aleatorio que sigue cambiando
          return matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
      });
      
      element.innerHTML = displayChars.join('');
      
      // Efecto adicional: cambiar caracteres no revelados más rápido
      if (revealedCount < totalChars) {
        setTimeout(() => {
          const currentDisplay = element.innerHTML.split('');
          for (let i = 0; i < currentDisplay.length; i++) {
            if (!revealedChars[i] && chars[i] !== ' ') {
              currentDisplay[i] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            }
          }
          element.innerHTML = currentDisplay.join('');
        }, 30);
      }
      
    }, 70); // Revelar una letra cada 70ms - más rápido para botón
  }

  private createBinaryParticles(count: number): void {
    const buttonRect = this.elementRef.nativeElement.querySelector('.consultation-btn')?.getBoundingClientRect();
    if (!buttonRect) return;

    for (let i = 0; i < count; i++) {
      const particle: BinaryParticle = {
        id: this.particleIdCounter++,
        x: buttonRect.left + Math.random() * buttonRect.width,
        y: buttonRect.top + Math.random() * buttonRect.height,
        value: Math.random() > 0.5 ? '1' : '0',
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: -Math.random() * 2 - 1
        },
        life: 1,
        maxLife: 1,
        size: Math.random() * 8 + 8
      };
      
      this.binaryParticles.push(particle);
    }
  }

  private animateParticles(): void {
    const animate = () => {
      if (!this.showParticles || this.binaryParticles.length === 0) {
        return;
      }

      this.binaryParticles.forEach((particle, index) => {
        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // Update life
        particle.life -= 0.02;
        
        // Remove dead particles
        if (particle.life <= 0) {
          this.binaryParticles.splice(index, 1);
        }
      });

      if (this.binaryParticles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        this.showParticles = false;
      }
    };

    requestAnimationFrame(animate);
  }

  onButtonClick(): void {
    // Create disintegration effect
    this.createDisintegrationEffect();
    
    // Open consultation URL after a short delay for effect
    setTimeout(() => {
      window.open(this.consultationUrl, '_blank');
    }, 300);
  }

  private createDisintegrationEffect(): void {
    this.createBinaryParticles(50);
    this.showParticles = true;
    this.animateParticles();
    
    // Add button shake effect
    const buttonElement = this.elementRef.nativeElement.querySelector('.consultation-btn');
    if (buttonElement) {
      buttonElement.classList.add('disintegrating');
      setTimeout(() => {
        buttonElement.classList.remove('disintegrating');
      }, 600);
    }
  }

  getParticleStyle(particle: BinaryParticle): any {
    return {
      left: particle.x + 'px',
      top: particle.y + 'px',
      opacity: particle.life,
      fontSize: particle.size + 'px',
      transform: `scale(${particle.life})`
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.lightingService.unregisterIlluminatedElement('consultation-button');
  }
}
