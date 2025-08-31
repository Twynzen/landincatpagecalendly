import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircuitsBackgroundComponent } from './components/circuits-background/circuits-background.component';
import { TorchSystemComponent } from './components/torch-system/torch-system.component';
import { ServiceHieroglyphsComponent } from './components/service-hieroglyphs/service-hieroglyphs.component';
// import { CatGuideComponent } from './components/cat-guide/cat-guide.component'; // DESHABILITADO
import { ConsultationButtonComponent } from './components/consultation-button/consultation-button.component';
// import { CursorInventoryComponent } from './components/cursor-inventory/cursor-inventory.component'; // DESHABILITADO
import { CustomCursorComponent } from './components/custom-cursor/custom-cursor.component';
import { LightingService } from './services/lighting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CircuitsBackgroundComponent,
    TorchSystemComponent,
    ServiceHieroglyphsComponent,
    // CatGuideComponent, // DESHABILITADO
    ConsultationButtonComponent,
    // CursorInventoryComponent, // DESHABILITADO
    CustomCursorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  heroIlluminated = false; // FORZADO: DEBE iniciar en false
  heroAnimated = false; // Público para template - Para evitar animación infinita
  title = 'Daniel Castiblanco - Consultor de IA';

  constructor(private lightingService: LightingService) {}

  ngOnInit(): void {
    // Dar tiempo a que todo se inicialice antes de registrar iluminación
    setTimeout(() => {
      this.setupHeroIllumination();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupHeroIllumination(): void {
    // Registrar hero section para iluminación - ÁREA REALISTA
    const heroElement = {
      id: 'hero-section',
      x: window.innerWidth / 2, // Centro horizontal
      y: 250, // Posición donde están los textos hero
      width: 800, // Área razonable que cubra los textos
      height: 300, // Altura que cubra todo el hero
      requiredIntensity: 0.1, // Fácil de iluminar con fire cursor
      currentIllumination: 0,
      isVisible: false,
      isPermanent: false // CORRECTO: Se vuelve permanente al iluminarse
    };
    
    this.lightingService.registerIlluminatedElement(heroElement);
    
    // DEBUG: Verificar estado INMEDIATAMENTE después de registrar
    console.log('✅ Hero registrado. Estado inicial:', {
      isVisible: heroElement.isVisible,
      currentIllumination: heroElement.currentIllumination
    });

    // Suscribirse a cambios de iluminación
    this.lightingService.getIlluminatedElements()
      .pipe(takeUntil(this.destroy$))
      .subscribe(elements => {
        const heroElementState = elements.find(el => el.id === 'hero-section');
        const wasIlluminated = this.heroIlluminated;
        this.heroIlluminated = heroElementState?.isVisible || false;
        
        // DEBUG SIMPLE: Solo cambios importantes
        if (wasIlluminated !== this.heroIlluminated) {
          console.log(`🎯 Hero cambió: ${wasIlluminated} → ${this.heroIlluminated}`);
          console.log(`📊 Illumination: ${heroElementState?.currentIllumination} / ${heroElementState?.requiredIntensity}`);
        }
        
        // Trigger typing animations SOLO si no ha sido animado antes
        if (this.heroIlluminated && !this.heroAnimated) {
          console.log('🎯 Hero se iluminó por primera vez! Triggering Matrix animations...');
          this.triggerTypingAnimations();
        }
      });
  }

  private triggerTypingAnimations(): void {
    // Buscar elementos con clase typing que estén iluminados
    setTimeout(() => { // Dar tiempo para que Angular actualice las clases
      const typingElements = document.querySelectorAll('.hero-section .typing');
      console.log('🎬 Found typing elements:', typingElements.length);
      console.log('🔍 Hero section classes:', document.querySelector('.hero-section')?.className);
      
      if (typingElements.length === 0) {
        console.log('❌ NO typing elements found! Checking what exists:');
        console.log('Hero section:', document.querySelector('.hero-section'));
        console.log('All elements with data-text:', document.querySelectorAll('[data-text]'));
      }
      
      typingElements.forEach((element, index) => {
        setTimeout(() => {
          console.log(`🎯 Starting Matrix animation for element ${index}:`, element);
          this.typeText(element as HTMLElement);
          
          // Marcar como completamente animado después del último elemento
          if (index === typingElements.length - 1) {
            // Esperar a que termine la última animación (1.5 segundos exactos)
            setTimeout(() => {
              this.heroAnimated = true;
              console.log('✅ Hero animations completed!');
            }, 1500);
          }
        }, index * 250); // Stagger más rápido - 250ms entre cada texto (mitad)
      });
    }, 100); // Pequeño delay para que Angular actualice el DOM
  }

  private typeText(element: HTMLElement): void {
    const text = element.getAttribute('data-text') || '';
    const typingSpan = element.querySelector('.typing-text') as HTMLElement;
    
    if (!typingSpan) return;

    // Matrix magical revelation effect - letras aparecen desordenadas
    this.createMatrixRevelation(typingSpan, text);
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
    element.style.color = '#00ff44';
    element.style.textShadow = '0 0 10px #00ff44, 0 0 20px #00ff44, 0 0 30px rgba(0, 255, 68, 0.8)';
    element.style.fontFamily = "'Glitchy Demo Italic', 'Share Tech Mono', monospace"; // MANTENER fuente durante animación
    
    let revealedCount = 0;
    let changeInterval: any; // Para poder limpiar el interval secundario
    
    // Calcular velocidad para completar en 1.5 segundos máximo
    const maxDuration = 1500; // 1.5 segundos (mitad de 3)
    const intervalSpeed = Math.min(50, Math.floor(maxDuration / totalChars)); // Velocidad más rápida
    
    const revealInterval = setInterval(() => {
      if (revealedCount >= totalChars) {
        clearInterval(revealInterval);
        if (changeInterval) clearInterval(changeInterval); // Limpiar interval secundario
        // Asegurar que el texto final sea el correcto
        element.innerHTML = finalText;
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
      
      // Efecto adicional: cambiar caracteres no revelados más rápido (solo si no terminó)
      if (revealedCount < totalChars) {
        if (changeInterval) clearInterval(changeInterval);
        changeInterval = setTimeout(() => {
          if (revealedCount < totalChars) { // Doble verificación
            const currentDisplay = element.innerHTML.split('');
            for (let i = 0; i < currentDisplay.length; i++) {
              if (!revealedChars[i] && chars[i] !== ' ') {
                currentDisplay[i] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
              }
            }
            element.innerHTML = currentDisplay.join('');
          }
        }, 15); // Más rápido para mejor efecto visual (mitad)
      }
      
    }, intervalSpeed); // Velocidad calculada para 3 segundos total
    
    // Failsafe: Asegurar que termine en 3 segundos máximo
    setTimeout(() => {
      clearInterval(revealInterval);
      if (changeInterval) clearInterval(changeInterval);
      element.innerHTML = finalText;
    }, maxDuration);
  }
}
