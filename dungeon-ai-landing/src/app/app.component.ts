import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonBackgroundComponent } from './components/dungeon-background/dungeon-background.component';
import { TorchSystemComponent } from './components/torch-system/torch-system.component';
import { ServiceHieroglyphsComponent } from './components/service-hieroglyphs/service-hieroglyphs.component';
import { CatGuideComponent } from './components/cat-guide/cat-guide.component';
import { ConsultationButtonComponent } from './components/consultation-button/consultation-button.component';
import { CursorInventoryComponent } from './components/cursor-inventory/cursor-inventory.component';
import { CustomCursorComponent } from './components/custom-cursor/custom-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DungeonBackgroundComponent,
    TorchSystemComponent,
    ServiceHieroglyphsComponent,
    CatGuideComponent,
    ConsultationButtonComponent,
    CursorInventoryComponent,
    CustomCursorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Daniel Castiblanco - Consultor de IA';
}
