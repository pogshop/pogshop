import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { OrdersService } from '../services/orders-service.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payouts-table',
  imports: [DatePipe, CommonModule],
  templateUrl: './payouts-table.component.html',
  styleUrl: './payouts-table.component.scss',
})
export class PayoutsTableComponent {
  @Input() payouts: any[] = [];
  @Input() totalPayoutsCount: number = 0;
  @Output() onLoadNextPage = new EventEmitter<void>();

  currentPage: number = 0;
  pageSize: number = 10;
  renderedPayouts: any[] = [];

  Math = Math;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnChanges() {
    this.refreshPayouts();
  }

  refreshPayouts() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.renderedPayouts = this.payouts.slice(startIndex, endIndex);
    this.cdRef.detectChanges();
  }

  loadPreviousPage(event: MouseEvent) {
    (event.target as HTMLButtonElement).blur();
    const nextPageItemCount = this.currentPage * this.pageSize - this.pageSize;
    if (nextPageItemCount > 0) {
      this.currentPage--;
      this.refreshPayouts();
    }
  }
  loadNextPage(event: MouseEvent) {
    (event.target as HTMLButtonElement).blur();
    const nextPageItemCount = this.currentPage * this.pageSize + this.pageSize;
    if (nextPageItemCount < this.payouts.length) {
      this.currentPage++;
      this.refreshPayouts();
    } else if (nextPageItemCount < this.totalPayoutsCount) {
      this.onLoadNextPage.emit();
      this.currentPage++;
    }
  }
}
