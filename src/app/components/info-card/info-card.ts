import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-card.html',
  styleUrl: './info-card.css'
})
export class InfoCard {
  @Input() icon: string = '📊';
  @Input() title: string = 'Título';
  @Input() value: string | number = '';
  @Input() unit: string = '';
  @Input() lastUpdate?: string;
}
