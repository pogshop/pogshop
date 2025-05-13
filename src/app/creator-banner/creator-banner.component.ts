// creator-banner.component.ts
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ShopNavbarComponent } from "../components/shop-nav-bar/shop-nav-bar.component";
import { CommonModule } from "@angular/common";
import { UsersService } from '../services/users-service.service';
import { take } from 'rxjs';
@Component({
  selector: 'app-creator-banner',
  templateUrl: './creator-banner.component.html',
  styleUrls: ['./creator-banner.component.scss'],
  imports: [ShopNavbarComponent, ShopNavbarComponent, CommonModule],
})
export class CreatorBannerComponent {
  @Input() creatorName: string = 'Display Name';
  @Input() username: string = '@joannemilktea';
  @Input() bio: string =
    'Gaming, cooking, and IRL adventures! Get your interactive alerts here and help support the stream 💜';
  @Input() isVerified: boolean = true;
  profilePhotoURL: string = ''; // Default or fetched from backend

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  copied: boolean = false;

  constructor(private usersService: UsersService) {
 
  }

  ngOnInit(): void {
    this.usersService.authUser$.subscribe((user) => {
      this.profilePhotoURL = user?.profilePhotoURL;
    });
  }

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
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        // Check file size before uploading
        const base64String = base64Image.toString();
        const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 5) {
          alert('Profile photo must be less than 5MB');
          return;
        }
        
        const data = {'profilePhotoFile': base64Image};
        this.usersService.patchUser(data).pipe(take(1)).subscribe();
      };
      
      reader.readAsDataURL(file);
    }
  }
}
