import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardColor = 'blue' | 'purple' | 'green' | 'red' | 'yellow';

interface ColorMap {
  border: string;
}

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-card.component.html',
})
export class InfoCardComponent {
  @Input() cardTitle: string = '';
  @Input() mainText: string = '';
  @Input() cardColor: CardColor = 'blue';
  @Input() isLoading: boolean = false;

  private colorMap: Record<CardColor, ColorMap> = {
    blue: {
      border: 'border-l-blue-500',
    },
    purple: {
      border: 'border-l-purple-500',
    },
    green: {
      border: 'border-l-green-500',
    },
    red: {
      border: 'border-l-red-500',
    },
    yellow: {
      border: 'border-l-yellow-500',
    },
  };

  // Computed values
  cardBorderClass = computed(() => this.colorMap[this.cardColor].border);
}
