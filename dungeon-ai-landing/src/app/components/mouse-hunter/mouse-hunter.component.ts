import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';

interface Mouse {
  id: string;
  x: number;
  y: number;
  speed: number;
  direction: { x: number; y: number };
}

@Component({
  selector: 'app-mouse-hunter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mouse-hunter.component.html',
  styleUrl: './mouse-hunter.component.scss'
})
export class MouseHunterComponent implements OnInit, OnDestroy {
  mice: Mouse[] = [];
  private spawnTimer: any;
  private animationFrame: any;
  private illuminatedAreas: Array<{x: number, y: number, radius: number}> = [];

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    this.startSpawning();
    this.animateMice();
    window.addEventListener('torchLit', this.onTorchLit.bind(this));
  }

  private onTorchLit(event: any): void {
    const { x, y, radius } = event.detail;
    this.illuminatedAreas.push({ x, y, radius });
    
    setTimeout(() => {
      const index = this.illuminatedAreas.findIndex(area => area.x === x && area.y === y);
      if (index > -1) this.illuminatedAreas.splice(index, 1);
    }, 5000);
  }

  private startSpawning(): void {
    this.spawnTimer = setInterval(() => {
      if (this.mice.length < 5 && this.illuminatedAreas.length > 0) {
        this.spawnMouse();
      }
    }, 3000);
  }

  private spawnMouse(): void {
    const area = this.illuminatedAreas[Math.floor(Math.random() * this.illuminatedAreas.length)];
    if (!area) return;

    const mouse: Mouse = {
      id: 'mouse-' + Date.now(),
      x: area.x + (Math.random() - 0.5) * area.radius,
      y: area.y + (Math.random() - 0.5) * area.radius,
      speed: 2 + Math.random() * 3,
      direction: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }
    };
    
    this.mice.push(mouse);
    
    setTimeout(() => {
      this.removeMouse(mouse.id);
    }, 15000);
  }

  private animateMice(): void {
    this.animationFrame = requestAnimationFrame(() => {
      this.mice.forEach(mouse => {
        mouse.x += mouse.direction.x * mouse.speed;
        mouse.y += mouse.direction.y * mouse.speed;
        
        if (mouse.x < 0 || mouse.x > window.innerWidth) {
          mouse.direction.x *= -1;
        }
        if (mouse.y < 0 || mouse.y > window.innerHeight) {
          mouse.direction.y *= -1;
        }
        
        mouse.x = Math.max(0, Math.min(window.innerWidth, mouse.x));
        mouse.y = Math.max(0, Math.min(window.innerHeight, mouse.y));
        
        if (Math.random() < 0.02) {
          mouse.direction.x = (Math.random() - 0.5) * 2;
          mouse.direction.y = (Math.random() - 0.5) * 2;
        }
      });
      
      this.animateMice();
    });
  }

  onMouseClick(mouse: Mouse, event: MouseEvent): void {
    this.gameStateService.gameState$.subscribe(state => {
      if (state.cursorMode === 'net') {
        this.catchMouse(mouse.id);
        event.stopPropagation();
      }
    }).unsubscribe();
  }

  private catchMouse(mouseId: string): void {
    this.removeMouse(mouseId);
    this.gameStateService.catchMouse();
  }

  private removeMouse(mouseId: string): void {
    this.mice = this.mice.filter(m => m.id !== mouseId);
  }

  getMouseStyle(mouse: Mouse): any {
    return {
      left: mouse.x + 'px',
      top: mouse.y + 'px',
      transform: 'translate(-50%, -50%)'
    };
  }

  ngOnDestroy(): void {
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('torchLit', this.onTorchLit.bind(this));
  }
}
