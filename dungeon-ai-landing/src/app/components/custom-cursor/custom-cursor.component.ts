import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService } from '../../services/lighting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-cursor.component.html',
  styleUrl: './custom-cursor.component.scss'
})
export class CustomCursorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentCursor: 'fire' | 'torch' | 'net' = 'fire';
  cursorX = 0;
  cursorY = 0;
  isVisible = true;
  isTouchDevice = false;

  constructor(private lightingService: LightingService) {}

  ngOnInit(): void {
    // Detect touch devices
    this.isTouchDevice = this.detectTouchDevice();
    
    // Don't show custom cursor on touch devices
    if (this.isTouchDevice) {
      this.isVisible = false;
      return;
    }

    // Subscribe to cursor type changes
    this.lightingService.getCurrentCursor()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cursor => {
        this.currentCursor = cursor;
      });

    // Hide default cursor only on non-touch devices
    document.body.style.cursor = 'none';
    
    // Add global styles for hiding cursor
    const style = document.createElement('style');
    style.setAttribute('data-cursor-hide', 'true');
    style.textContent = `
      * { cursor: none !important; }
      body { cursor: none !important; }
    `;
    document.head.appendChild(style);
  }

  private detectTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
  }

  @HostListener('window:mouseenter')
  onMouseEnter(): void {
    this.isVisible = true;
  }

  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    this.isVisible = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Restore default cursor only if it was hidden
    if (!this.isTouchDevice) {
      document.body.style.cursor = 'auto';
      
      // Remove the style element if it exists
      const existingStyle = document.head.querySelector('style[data-cursor-hide]');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }
}