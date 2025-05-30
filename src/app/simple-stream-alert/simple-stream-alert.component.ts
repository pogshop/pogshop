import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-simple-stream-alert',
  imports: [CommonModule],
  templateUrl: './simple-stream-alert.component.html',
  styleUrl: './simple-stream-alert.component.scss',
})
export class SimpleStreamAlertComponent {
  @Input() displayImage?: string;
  @Input() displayUsername?: string;
  @Input() displayProductName?: string;
  @Input() displayHandle?: string;
}
