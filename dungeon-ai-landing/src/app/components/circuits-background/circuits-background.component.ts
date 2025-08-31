import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService, LightSource } from '../../services/lighting.service';
import { Subscription, interval } from 'rxjs';

// Mismas interfaces pero adaptadas para CSS approach
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

interface MatrixChar {
  symbol: string;
  delay: number;
}

interface ExclusionZone {
  x: number;
  y: number;
  width: number;
  height: number;
  element: string; // Para debug
}

@Component({
  selector: 'app-circuits-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circuits-background.component.html',
  styleUrl: './circuits-background.component.scss'
})
export class CircuitsBackgroundComponent implements OnInit, OnDestroy {
  // Circuit system
  fixedCircuits: FixedCircuit[] = [];
  dynamicConnections: DynamicConnection[] = [];
  
  // Window dimensions for SVG viewBox
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  
  // Subscriptions
  private lightingSubscription!: Subscription;
  private animationSubscription!: Subscription;
  
  // Matrix rain cache
  private matrixCharsCache: Map<number, MatrixChar[]> = new Map();
  
  // Debug mode flag
  debugMode = false; // Set to true para ver circuitos siempre

  constructor(private lightingService: LightingService) {}

  ngOnInit(): void {
    this.generateFixedCircuits();
    this.generateDynamicConnections();
    this.setupLightingSubscription();
    this.startAnimationLoop();
    
    // Debug: hacer algunos circuitos visibles inicialmente
    if (this.debugMode) {
      this.fixedCircuits.forEach((circuit, i) => {
        if (i % 3 === 0) circuit.isLit = true;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.lightingSubscription) {
      this.lightingSubscription.unsubscribe();
    }
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  private generateFixedCircuits(): void {
    // Patrones de circuitos Matrix binarios
    const patterns = ['-', '|', '+', '0', '1', '0', '0', '1', '1'];
    
    // PASO 1: Detectar UI elements automáticamente
    const exclusionZones = this.detectUIExclusionZones();
    
    // Generate fixed circuits in a balanced grid pattern
    const rows = 10; // Menos rows para mejor performance CSS
    const cols = 16; // Menos cols para mejor performance CSS
    const cellWidth = this.windowWidth / cols;
    const cellHeight = this.windowHeight / rows;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Skip some cells to avoid oversaturation
        if (Math.random() < 0.4) continue; // Más circuitos visibles
        
        const circuitX = j * cellWidth + (cellWidth / 2) + (Math.random() - 0.5) * 30;
        const circuitY = i * cellHeight + (cellHeight / 2) + (Math.random() - 0.5) * 30;
        
        // PASO 2: Verificar si colisiona con exclusion zone
        if (this.collidesWithExclusionZones(circuitX, circuitY, exclusionZones)) {
          continue; // Skip este circuito si está en zona prohibida
        }
        
        const circuit: FixedCircuit = {
          x: circuitX,
          y: circuitY,
          pattern: patterns[Math.floor(Math.random() * patterns.length)],
          baseOpacity: 0.3 + Math.random() * 0.2, // Más visible base
          litOpacity: 0.9 + Math.random() * 0.1,
          isLit: false
        };
        
        this.fixedCircuits.push(circuit);
      }
    }
  }

  private generateDynamicConnections(): void {
    // Create potential connections between fixed circuits
    const maxConnections = Math.floor(this.fixedCircuits.length * 0.2); // Menos conexiones para performance
    
    for (let i = 0; i < maxConnections; i++) {
      const startCircuit = this.fixedCircuits[Math.floor(Math.random() * this.fixedCircuits.length)];
      const nearbyCircuits = this.fixedCircuits.filter(circuit => {
        const distance = Math.sqrt(
          Math.pow(circuit.x - startCircuit.x, 2) + 
          Math.pow(circuit.y - startCircuit.y, 2)
        );
        return distance > 50 && distance < 250 && circuit !== startCircuit;
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

  private updateCircuitIllumination(lightSources: LightSource[]): void {
    // Update fixed circuits
    this.fixedCircuits.forEach(circuit => {
      let isNowLit = false;
      
      lightSources.forEach(light => {
        const distance = Math.sqrt(
          Math.pow(circuit.x - light.x, 2) + 
          Math.pow(circuit.y - light.y, 2)
        );
        
        if (distance <= light.radius) {
          isNowLit = true;
        }
      });
      
      // Una vez iluminado, permanece iluminado (como pidió Daniel)
      if (isNowLit && !circuit.isLit) {
        circuit.isLit = true;
      }
    });
    
    // Update dynamic connections
    this.dynamicConnections.forEach(connection => {
      const allConnectedLit = connection.connectedCircuits.every(circuit => circuit.isLit);
      
      if (allConnectedLit && !connection.isActive) {
        connection.isActive = true;
        connection.progress = 0;
      }
    });
  }

  private startAnimationLoop(): void {
    // CSS animations handle most of the animation
    // Solo necesitamos actualizar progress de connections
    this.animationSubscription = interval(50).subscribe(() => {
      this.dynamicConnections.forEach(connection => {
        if (connection.isActive && connection.progress < 1) {
          connection.progress += 0.02;
          if (connection.progress >= 1) {
            connection.progress = 0; // Loop animation
          }
        }
      });
    });
  }

  // Helper para generar caracteres Matrix rain
  getMatrixChars(circuitIndex: number): MatrixChar[] {
    if (!this.matrixCharsCache.has(circuitIndex)) {
      const chars: MatrixChar[] = [];
      const charCount = 3 + Math.floor(Math.random() * 3);
      const symbols = ['-', '|', '+', '0', '1', '0', '0', '1', '1']; // Solo símbolos básicos + binario Matrix
      
      for (let i = 0; i < charCount; i++) {
        chars.push({
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          delay: i * 200 + Math.random() * 100
        });
      }
      
      this.matrixCharsCache.set(circuitIndex, chars);
    }
    
    return this.matrixCharsCache.get(circuitIndex) || [];
  }

  // 🚫 EXCLUSION ZONES SYSTEM - Detectar UI elements automáticamente
  private detectUIExclusionZones(): ExclusionZone[] {
    const exclusionZones: ExclusionZone[] = [];
    const margin = 40; // Margin más grande para mejor separación
    
    try {
      // Detectar elementos UI automáticamente por clases
      const uiSelectors = [
        '.service-card',           // Cards de servicios
        '.service-item',           // Items individuales de servicios
        '.services-grid',          // Grid container completo
        '.consultation-btn',       // Botón de consulta  
        '.consultation-button',    // Botón alternativo
        '.hero-section',          // Sección hero
        '.cursor-inventory',      // Inventario cursors
        '.cat-container',         // Container del gato
        '.services-header'        // Header de servicios
      ];
      
      uiSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          
          // Solo crear zona si el elemento es visible
          if (rect.width > 0 && rect.height > 0) {
            exclusionZones.push({
              x: rect.left - margin,
              y: rect.top - margin,
              width: rect.width + (margin * 2),
              height: rect.height + (margin * 2),
              element: selector
            });
          }
        });
      });
      
      console.log(`🚫 CircuitsBackground: Detected ${exclusionZones.length} exclusion zones`);
      
    } catch (error) {
      console.warn('CircuitsBackground: Error detecting exclusion zones:', error);
    }
    
    return exclusionZones;
  }

  private collidesWithExclusionZones(x: number, y: number, exclusionZones: ExclusionZone[]): boolean {
    return exclusionZones.some(zone => {
      return x >= zone.x && 
             x <= zone.x + zone.width && 
             y >= zone.y && 
             y <= zone.y + zone.height;
    });
  }
}