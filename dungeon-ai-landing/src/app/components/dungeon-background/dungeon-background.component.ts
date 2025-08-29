import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService, LightSource } from '../../services/lighting.service';
import { Subscription } from 'rxjs';

interface FixedCircuit {
  x: number;
  y: number;
  pattern: string;
  baseOpacity: number;
  litOpacity: number;
  isLit: boolean;
}

interface DynamicConnection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  isActive: boolean;
  connectedCircuits: FixedCircuit[];
}

@Component({
  selector: 'app-dungeon-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dungeon-background.component.html',
  styleUrl: './dungeon-background.component.scss'
})
export class DungeonBackgroundComponent implements OnInit, OnDestroy {
  private canvasElement!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private wallGradient!: CanvasGradient;
  
  // Circuit system
  private fixedCircuits: FixedCircuit[] = [];
  private dynamicConnections: DynamicConnection[] = [];
  private animationFrameId!: number;
  
  private lightingSubscription!: Subscription;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private lightingService: LightingService
  ) {}

  ngOnInit(): void {
    this.setupCanvas();
    this.generateFixedCircuits();
    this.generateDynamicConnections();
    this.setupLightingSubscription();
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    if (this.lightingSubscription) {
      this.lightingSubscription.unsubscribe();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private generateFixedCircuits(): void {
    // Patrones de circuitos según design-preview.html
    const patterns = ['-', '|', '+', '◉', '□', '○'];
    
    // Generate fixed circuits in a balanced grid pattern
    const rows = 12;
    const cols = 20;
    const cellWidth = window.innerWidth / cols;
    const cellHeight = window.innerHeight / rows;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Skip some cells to avoid oversaturation (más visible para debug)
        if (Math.random() < 0.6) continue;
        
        const circuit: FixedCircuit = {
          x: j * cellWidth + (cellWidth / 2) + (Math.random() - 0.5) * 30,
          y: i * cellHeight + (cellHeight / 2) + (Math.random() - 0.5) * 30,
          pattern: patterns[Math.floor(Math.random() * patterns.length)],
          baseOpacity: 0.15 + Math.random() * 0.1, // Más visible inicialmente
          litOpacity: 0.8 + Math.random() * 0.2,
          isLit: false
        };
        
        this.fixedCircuits.push(circuit);
      }
    }
  }

  private generateDynamicConnections(): void {
    // Create potential connections between fixed circuits
    const maxConnections = Math.floor(this.fixedCircuits.length * 0.3);
    
    for (let i = 0; i < maxConnections; i++) {
      const startCircuit = this.fixedCircuits[Math.floor(Math.random() * this.fixedCircuits.length)];
      const nearbyCircuits = this.fixedCircuits.filter(circuit => {
        const distance = Math.sqrt(
          Math.pow(circuit.x - startCircuit.x, 2) + Math.pow(circuit.y - startCircuit.y, 2)
        );
        return distance > 50 && distance < 200 && circuit !== startCircuit;
      });
      
      if (nearbyCircuits.length > 0) {
        const endCircuit = nearbyCircuits[Math.floor(Math.random() * nearbyCircuits.length)];
        
        const connection: DynamicConnection = {
          startX: startCircuit.x,
          startY: startCircuit.y,
          endX: endCircuit.x,
          endY: endCircuit.y,
          progress: 0,
          isActive: false,
          connectedCircuits: [startCircuit, endCircuit]
        };
        
        this.dynamicConnections.push(connection);
      }
    }
  }

  private setupLightingSubscription(): void {
    this.lightingSubscription = this.lightingService.getLightSources().subscribe(lightSources => {
      this.updateCircuitIllumination(lightSources);
    });
  }

  private setupCanvas(): void {
    const canvas = this.renderer.createElement('canvas');
    this.renderer.addClass(canvas, 'dungeon-canvas');
    this.renderer.appendChild(this.elementRef.nativeElement, canvas);
    
    this.canvasElement = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;
    this.createGradients();
  }

  private createGradients(): void {
    // Create wall gradient - dark stone with subtle green circuit glow
    this.wallGradient = this.ctx.createLinearGradient(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.wallGradient.addColorStop(0, '#0a0a0a');
    this.wallGradient.addColorStop(0.3, '#141414');
    this.wallGradient.addColorStop(0.6, '#0d0f0d');
    this.wallGradient.addColorStop(1, '#080808');
  }

  private drawDungeonWalls(): void {
    // Debug: Fill with subtle green to verify Canvas renders
    this.ctx.fillStyle = '#0f1f0f'; // Muy sutil verde para debug
    this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    
    // Add wall gradient on top
    this.ctx.fillStyle = this.wallGradient;
    this.ctx.globalAlpha = 0.8; // Semi-transparent to see debug
    this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.ctx.globalAlpha = 1;
    
    // Add stone texture
    this.drawStoneTexture();
    
    // Circuit patterns are handled by fixed and dynamic circuits
  }

  private drawStoneTexture(): void {
    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.canvasElement.width;
      const y = Math.random() * this.canvasElement.height;
      const width = Math.random() * 100 + 50;
      const height = Math.random() * 80 + 40;
      
      this.ctx.strokeStyle = '#333';
      this.ctx.strokeRect(x, y, width, height);
    }
    this.ctx.globalAlpha = 1;
  }

  private updateCircuitIllumination(lightSources: LightSource[]): void {
    // Update fixed circuits
    this.fixedCircuits.forEach(circuit => {
      let isNowLit = false;
      
      lightSources.forEach(light => {
        const distance = Math.sqrt(
          Math.pow(circuit.x - light.x, 2) + Math.pow(circuit.y - light.y, 2)
        );
        
        if (distance <= light.radius) {
          isNowLit = true;
        }
      });
      
      circuit.isLit = isNowLit;
    });
    
    // Update dynamic connections
    this.dynamicConnections.forEach(connection => {
      const allConnectedLit = connection.connectedCircuits.every(circuit => circuit.isLit);
      
      if (allConnectedLit && !connection.isActive) {
        connection.isActive = true;
        connection.progress = 0;
        this.animateConnection(connection);
      }
    });
  }

  private animateConnection(connection: DynamicConnection): void {
    const animate = () => {
      if (connection.progress < 1) {
        connection.progress += 0.02;
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    animate();
  }

  private startAnimationLoop(): void {
    const loop = () => {
      this.clearCanvas();
      this.drawDungeonWalls();
      this.drawFixedCircuits();
      this.drawDynamicConnections();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  private drawFixedCircuits(): void {
    this.ctx.font = '20px monospace'; // Aún más grande
    this.ctx.textAlign = 'center';
    
    this.fixedCircuits.forEach(circuit => {
      const opacity = circuit.isLit ? circuit.litOpacity : 0.6; // MUY visible para debug
      const color = circuit.isLit ? '#00ff44' : '#00aa22'; // Verde visible incluso apagado
      
      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = color;
      
      if (circuit.isLit) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ff44';
      } else {
        this.ctx.shadowBlur = 3; // Sombra sutil incluso apagado
        this.ctx.shadowColor = '#00aa22';
      }
      
      this.ctx.fillText(circuit.pattern, circuit.x, circuit.y);
      
      // Debug: Círculo siempre visible
      this.ctx.beginPath();
      this.ctx.arc(circuit.x, circuit.y - 15, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = circuit.isLit ? '#00ff44' : '#666';
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
  }

  private drawDynamicConnections(): void {
    this.dynamicConnections.forEach(connection => {
      if (!connection.isActive || connection.progress === 0) return;
      
      const currentX = connection.startX + (connection.endX - connection.startX) * connection.progress;
      const currentY = connection.startY + (connection.endY - connection.startY) * connection.progress;
      
      this.ctx.strokeStyle = '#00cc33';
      this.ctx.lineWidth = 1.5;
      this.ctx.globalAlpha = 0.7;
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = '#00cc33';
      
      this.ctx.beginPath();
      this.ctx.moveTo(connection.startX, connection.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      
      // Draw connection pulse at the end
      if (connection.progress > 0.1) {
        this.ctx.fillStyle = '#00ff44';
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
  }
}
