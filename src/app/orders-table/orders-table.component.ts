import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ModalService } from '../services/modal-service.service';
import { ViewAddressDialogComponent } from '../components/modals/view-address-dialog.component';

@Component({
  selector: 'app-orders-table',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.scss',
})
export class OrdersTableComponent {
  @Input() lineItems: any[] = [];
  @Input() totalLineItemCount: number = 0;
  @Output() onLoadNextPage = new EventEmitter<void>();
  renderedLineItems: any[] = [];

  currentPage: number = 0;
  pageSize: number = 10;

  Math = Math;

  constructor(
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService
  ) {}

  ngOnChanges() {
    this.refreshLineItems();
  }

  refreshLineItems() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.renderedLineItems = this.lineItems.slice(startIndex, endIndex);
    this.cdRef.detectChanges();
  }

  viewAddress(shippingDetails: any) {
    this.modalService.open(ViewAddressDialogComponent, {
      data: {
        shippingDetails: shippingDetails,
      },
      width: 'fit',
    });
  }

  loadPreviousPage(event: MouseEvent) {
    (event.target as HTMLButtonElement).blur();
    if (this.currentPage > 0) {
      this.currentPage--;
      this.refreshLineItems();
    }
  }

  loadNextPage(event: MouseEvent) {
    (event.target as HTMLButtonElement).blur();
    const nextPageItemCount = this.currentPage * this.pageSize + this.pageSize;
    if (nextPageItemCount < this.lineItems.length) {
      this.currentPage++;
      this.refreshLineItems();
    } else if (nextPageItemCount < this.totalLineItemCount) {
      this.onLoadNextPage.emit();
      this.currentPage++;
    }
  }
}
