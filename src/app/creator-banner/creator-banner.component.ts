// creator-banner.component.ts
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ShopNavbarComponent } from "../components/shop-nav-bar/shop-nav-bar.component";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-creator-banner',
  templateUrl: './creator-banner.component.html',
  styleUrls: ['./creator-banner.component.scss'],
  imports: [ShopNavbarComponent, ShopNavbarComponent, CommonModule],
})
export class CreatorBannerComponent {
  @Input() creatorName: string = 'Jennifer Milk';
  @Input() username: string = '@joannemilktea';
  @Input() bio: string =
    'Gaming, cooking, and IRL adventures! Get your interactive alerts here and help support the stream 💜';
  @Input() isVerified: boolean = true;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  profilePhotoUrl = '/api/placeholder/200/200'; // Default or fetched from backend

  copied: boolean = false;

  handleShare(): void {
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  
  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Selected file:', file.name);
      // Process the file (upload to server, display preview, etc.)
    }
  }
}
