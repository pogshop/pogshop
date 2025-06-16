import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PayoutInfo {
  amount: number;
  payoutCutoffTime: string;
  payoutDate: string;
}

@Component({
  selector: 'app-payout-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payout-card.component.html',
})
export class PayoutCardComponent {
  @Input() payouts: PayoutInfo[] = [];
  @Input() isLoading: boolean = false;
}
