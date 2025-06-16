import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardColor = 'blue' | 'purple' | 'green' | 'red' | 'yellow';

interface ColorMap {
  text: string;
  border: string;
}

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-card.component.html',
})
export class DashboardCardComponent {
  @Input() cardTitle: string = '';
  @Input() mainText: string | number = '';
  @Input() cardColor: CardColor = 'blue';
  @Input() isLoading: boolean = false;

  private colorMap: Record<CardColor, ColorMap> = {
    blue: {
      text: 'text-blue-400',
      border: 'border-t-blue-500',
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-t-purple-500',
    },
    green: {
      text: 'text-green-400',
      border: 'border-t-green-500',
    },
    red: {
      text: 'text-red-400',
      border: 'border-t-red-500',
    },
    yellow: {
      text: 'text-yellow-400',
      border: 'border-t-yellow-500',
    },
  };

  // Computed values
  cardColorClass = computed(() => this.colorMap[this.cardColor].text);
  cardBorderClass = computed(() => this.colorMap[this.cardColor].border);
}
