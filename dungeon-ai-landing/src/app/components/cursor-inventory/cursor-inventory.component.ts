import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingService } from '../../services/lighting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface CursorSlot {
  type: 'fire' | 'torch' | 'net';
  name: string;
  description: string;
  unlocked: boolean;
  active: boolean;
  icon: string;
}

@Component({
  selector: 'app-cursor-inventory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cursor-inventory.component.html',
  styleUrl: './cursor-inventory.component.scss'
})
export class CursorInventoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isVisible = true; // Always visible to show cursor options
  cursorSlots: CursorSlot[] = [
    {
      type: 'fire',
      name: 'Fuego Matrix',
      description: 'Cursor inicial por defecto',
      unlocked: true,
      active: true,
      icon: 'fire'
    },
    {
      type: 'torch',
      name: 'Antorcha Tech',
      description: 'Se desbloquea al tomar antorcha',
      unlocked: false,
      active: false,
      icon: 'torch'
    },
    {
      type: 'net',
      name: 'Red Futurista',
      description: 'Se desbloquea cuando el gato habla',
      unlocked: false,
      active: false,
      icon: 'net'
    }
  ];

  constructor(private lightingService: LightingService) {}

  ngOnInit(): void {
    this.setupInventorySubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupInventorySubscription(): void {
    this.lightingService.getCursorInventory()
      .pipe(takeUntil(this.destroy$))
      .subscribe(inventory => {
        this.cursorSlots[0].unlocked = inventory.fire.unlocked;
        this.cursorSlots[0].active = inventory.fire.active;
        
        this.cursorSlots[1].unlocked = inventory.torch.unlocked;
        this.cursorSlots[1].active = inventory.torch.active;
        
        this.cursorSlots[2].unlocked = inventory.net.unlocked;
        this.cursorSlots[2].active = inventory.net.active;

        // Inventory is always visible now to show cursor options
        // this.isVisible = inventory.net.unlocked || inventory.torch.unlocked;
      });
  }

  onSlotClick(slot: CursorSlot): void {
    if (!slot.unlocked) return;

    this.lightingService.switchCursor(slot.type);
  }

  showInventory(): void {
    this.isVisible = true;
  }

  hideInventory(): void {
    this.isVisible = false;
  }

  getSlotClass(slot: CursorSlot): string {
    const classes = ['cursor-slot'];
    
    if (slot.active) {
      classes.push('active');
    }
    
    if (!slot.unlocked) {
      classes.push('locked');
    }
    
    if (slot.unlocked && !slot.active) {
      classes.push('available');
    }
    
    return classes.join(' ');
  }
}