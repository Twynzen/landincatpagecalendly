import { Component, OnInit, OnDestroy, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService } from '../../services/lighting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface TechTorch {
  id: string;
  x: number;
  y: number;
  isLit: boolean;
  isPermanent: boolean;
  element?: HTMLElement;
  hintVisible: boolean;
}

@Component({
  selector: 'app-torch-system',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torch-system.component.html',
  styleUrl: './torch-system.component.scss'
})
export class TorchSystemComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  torches: TechTorch[] = [];
  private hoveredTorch: string | null = null;
  private currentCursor$ = this.lightingService.getCurrentCursor();

  constructor(
    private lightingService: LightingService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initializeTechTorches();
    this.setupCursorSubscription();
    this.showInitialHints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTechTorches(): void {
    // 6 antorchas en las esquinas exactas - posicionamiento simétrico
    const torchPositions = [
      { x: 5, y: 10 },    // Top-left esquina
      { x: 95, y: 10 },   // Top-right esquina
      { x: 5, y: 50 },    // Middle-left
      { x: 95, y: 50 },   // Middle-right
      { x: 5, y: 90 },    // Bottom-left esquina
      { x: 95, y: 90 },   // Bottom-right esquina
    ];

    this.torches = torchPositions.map((pos, index) => ({
      id: `tech-torch-${index}`,
      x: pos.x,
      y: pos.y,
      isLit: false,
      isPermanent: false,
      hintVisible: index < 2 // Only show hints on first 2 torches
    }));
  }

  private setupCursorSubscription(): void {
    this.currentCursor$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cursor => {
        // Update body cursor class for custom cursors
        document.body.className = document.body.className.replace(/cursor-\w+/g, '');
        document.body.classList.add(`cursor-${cursor}`);
      });
  }

  private showInitialHints(): void {
    // Show subtle hints on first 2 torches for 10 seconds
    setTimeout(() => {
      this.torches.forEach(torch => {
        torch.hintVisible = false;
      });
    }, 10000);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.checkTorchHover(event.clientX, event.clientY);
    this.updateCustomCursorPosition(event.clientX, event.clientY);
  }

  private updateCustomCursorPosition(x: number, y: number): void {
    // Update custom cursor position
    const cursorElement = document.querySelector('.custom-cursor') as HTMLElement;
    if (cursorElement) {
      cursorElement.style.left = x + 'px';
      cursorElement.style.top = y + 'px';
    }
  }

  private checkTorchHover(mouseX: number, mouseY: number): void {
    let foundHover = false;

    this.torches.forEach(torch => {
      const torchX = (torch.x / 100) * window.innerWidth;
      const torchY = (torch.y / 100) * window.innerHeight;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - torchX, 2) + Math.pow(mouseY - torchY, 2)
      );

      // Proximity detection - Mostrar antorcha cuando cursor está cerca
      const proximityRadius = 150; // Área más amplia para revelar antorcha
      const hoverRadius = 80; // Área más pequeña para encenderla

      if (distance < proximityRadius || torch.isLit) {
        // Mostrar antorcha con proximidad O si ya está encendida permanentemente
        this.showTorchProximity(torch.id, true);
      } else {
        // Ocultar antorcha solo si cursor está lejos Y no está encendida
        this.showTorchProximity(torch.id, false);
      }

      // Hover detection para encender
      if (distance < hoverRadius && !torch.isLit) {
        if (this.hoveredTorch !== torch.id) {
          this.hoveredTorch = torch.id;
          foundHover = true;
          
          // Light torch permanently on hover
          this.lightTorchPermanently(torch, torchX, torchY);
        }
      }
    });

    if (!foundHover) {
      this.hoveredTorch = null;
    }
  }

  private showTorchProximity(torchId: string, show: boolean): void {
    const torchElement = document.querySelector(`[data-torch-id="${torchId}"]`);
    if (torchElement) {
      if (show) {
        this.renderer.addClass(torchElement, 'proximity-detected');
      } else {
        this.renderer.removeClass(torchElement, 'proximity-detected');
      }
    }
  }

  private lightTorchPermanently(torch: TechTorch, x: number, y: number): void {
    if (torch.isLit) return;

    torch.isLit = true;
    torch.isPermanent = true;
    torch.hintVisible = false;

    // Add light source to lighting service
    this.lightingService.lightTorch(torch.id, x, y);

    // Create lighting effect animation
    this.createTorchIgnitionEffect(torch);
  }

  private createTorchIgnitionEffect(torch: TechTorch): void {
    // Create ignition particles and effects
    const torchElement = document.getElementById(torch.id);
    if (!torchElement) return;

    // Add ignition class for CSS animation
    torchElement.classList.add('igniting');
    
    setTimeout(() => {
      torchElement.classList.remove('igniting');
      torchElement.classList.add('lit');
    }, 500);
  }

  onTorchClick(torch: TechTorch): void {
    if (!torch.isLit) return;

    // Only allow taking torch if it's already lit
    this.lightingService.takeTorch();
    
    // Add visual feedback for taking torch
    const torchElement = document.getElementById(torch.id);
    if (torchElement) {
      torchElement.classList.add('taken');
      
      setTimeout(() => {
        torchElement.classList.remove('taken');
      }, 300);
    }
  }

  getTorchStyle(torch: TechTorch): any {
    return {
      left: torch.x + '%',
      top: torch.y + '%',
      transform: 'translate(-50%, -50%)',
      zIndex: torch.isLit ? 100 : 50
    };
  }

  getTorchClass(torch: TechTorch): string {
    const classes = ['tech-torch'];
    
    if (torch.isLit) {
      classes.push('lit');
    }
    
    if (torch.hintVisible) {
      classes.push('hint-visible');
    }
    
    if (this.hoveredTorch === torch.id && !torch.isLit) {
      classes.push('hover');
    }
    
    return classes.join(' ');
  }
}