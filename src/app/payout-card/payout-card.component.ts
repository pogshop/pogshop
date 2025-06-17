import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';

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
  userCurrency: string = 'USD';

  constructor(private usersService: UsersService) {
    this.userCurrency =
      this.usersService.authUser$.value?.currency.toUpperCase() ?? 'USD';
  }
}
