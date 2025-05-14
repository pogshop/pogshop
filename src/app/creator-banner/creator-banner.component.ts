import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ShopNavbarComponent } from "../components/shop-nav-bar/shop-nav-bar.component";
import { CommonModule } from "@angular/common";
import { UsersService } from '../services/users-service.service';
import { HandleServiceService } from '../services/handle-service.service';
import { FormsModule } from '@angular/forms';
import { combineLatest, take, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';


enum HANDLE_STATUS {
  NONE = 'NONE',
  CHECKING = 'CHECKING',
  AVAILABLE = 'AVAILABLE',
  TAKEN = 'TAKEN',
  INVALID = 'INVALID',
  RESERVED = 'RESERVED',
}

enum IMAGE_TYPE {
  BANNER = 'BANNER',
  PROFILE = 'PROFILE',
}

@Component({
  selector: 'app-creator-banner',
  templateUrl: './creator-banner.component.html',
  styleUrls: ['./creator-banner.component.scss'],
  imports: [ShopNavbarComponent, ShopNavbarComponent, CommonModule, FormsModule],
})
export class CreatorBannerComponent {
  displayName: string = 'Display Name';
  handle: string = 'handle';
  bio: string = 'There\'s nothing here yet but they\'ll be here soon!';
  isVerified: boolean = true;
  profilePhotoURL: string = ''; 
  bannerPhotoURL: string = '';

  @ViewChild('profileFileInput') profileFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerFileInput') bannerFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('handleInput') handleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('displayNameInput') displayNameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bioInput') bioInput!: ElementRef<HTMLTextAreaElement>;

  HANDLE_STATUS = HANDLE_STATUS;
  IMAGE_TYPE = IMAGE_TYPE;

  copied: boolean = false;
  isEditingHandle: boolean = false;
  handleStatus = HANDLE_STATUS.CHECKING;
  tempHandle: string = '';
  isEditingDisplayName = false;
  tempDisplayName = '';
  pageLoaded = false;
  isEditingBio = false;
  tempBio = '';
  canEditProfile = false;

  private handleInputSubject = new Subject<string>();

  constructor(
    private usersService: UsersService,
    private handleService: HandleServiceService,
    private router: Router
  ){

    if (this.router.url.split('/')[1] === 'shop') {
      this.usersService.getAuthUser().pipe(take(1)).subscribe((user) => {
        this.initializeProfile(user);
      });
    }
    else {
        combineLatest([
          this.usersService.getUserByHandle(this.router.url.split('/')[1]),
          this.usersService.getAuthUser()
        ]).pipe(take(1)).subscribe(([user]) => {
          this.initializeProfile(user);
        });
      }

    this.handleInputSubject.pipe(debounceTime(300)).subscribe((value) => {
      this._onHandleInput(value);
    });
    
  }

  private initializeProfile(user:any) {
    this.profilePhotoURL = user?.profilePhotoURL || this.profilePhotoURL;
    this.bannerPhotoURL = user?.bannerPhotoURL || this.bannerPhotoURL;
    this.displayName = user?.displayName || this.displayName;
    this.handle = `@${user?.handle || this.handle}`;
    this.bio = user?.bio || this.bio;
    // Check if the current authenticated user is the profile owner
    const authUser = this.usersService.authUser$.value;
    this.canEditProfile = !!authUser && authUser.id === user?.id;
    this.pageLoaded = true;
  }

  handleShare(): void {
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  triggerFileInput(imageType: IMAGE_TYPE) {
    if (!this.canEditProfile) {
      return;
    }
    if(imageType === IMAGE_TYPE.BANNER) {
      this.bannerFileInput.nativeElement.click();
    } else if (imageType === IMAGE_TYPE.PROFILE) {
      this.profileFileInput.nativeElement.click();
    }
  }
  
  onImageSelected(event: Event, imageType: IMAGE_TYPE): void {
    if (!this.canEditProfile) {
      return;
    }
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
        
        let data;
        if (imageType === IMAGE_TYPE.PROFILE) {
          this.profilePhotoURL = base64Image;
          data = {'profilePhotoFile': base64Image}

        } else {
          this.bannerPhotoURL = base64Image;
          data = {'bannerPhotoFile': base64Image}
        }
        
        this.usersService.patchUser(data).pipe(take(1)).subscribe((result)=> {
          if (imageType === IMAGE_TYPE.PROFILE) {
            this.profilePhotoURL = result.profilePhotoURL;
          } else {
            this.bannerPhotoURL = result.bannerPhotoURL;
          }
        });
      };
      
      reader.readAsDataURL(file);
    }
  }

  startEditingHandle() {
    if (!this.canEditProfile) {
      return;
    }
    this.isEditingHandle = true;
    this.tempHandle = this.handle.replace('@', '');
    this.handleStatus = HANDLE_STATUS.NONE;
    setTimeout(() => {
      this.handleInput.nativeElement.focus();
    });
  }

  onHandleInput() {
    this.handleInputSubject.next(this.tempHandle);
  }

  private _onHandleInput(value: string) {
    this.handleStatus = HANDLE_STATUS.CHECKING;
    if (!value) {
      this.handleStatus = HANDLE_STATUS.NONE;
      return;
    }
    // Validate handle format
    const isValidFormat = /^[a-zA-Z0-9]{3,}$/.test(value);
    if (!isValidFormat) {
      this.handleStatus = HANDLE_STATUS.INVALID;
      return;
    }
    this.handleService.checkHandleAvailability(value)
      .pipe(take(1))
      .subscribe({
        next: (isAvailable) => {
          this.handleStatus = isAvailable ? HANDLE_STATUS.AVAILABLE : HANDLE_STATUS.TAKEN;
        },
        error: (error) => {
          console.error('Error checking handle availability:', error);
          this.handleStatus = HANDLE_STATUS.NONE;
        }
      });
  }

  saveHandle() {
    if (this.handleStatus === HANDLE_STATUS.AVAILABLE) {
      const data = { handle: this.tempHandle };
      this.usersService.patchUser(data).pipe(take(1)).subscribe({
        next: () => {
          this.handle = '@' + this.tempHandle;
          window.history.replaceState({}, '', `/${this.tempHandle}`);
          this.isEditingHandle = false;
        },
        error: (error) => {
          console.error('Error updating handle:', error);
          alert('Failed to update handle. Please try again.');
        }
      });
    }
  }

  cancelHandleEdit() {
    this.isEditingHandle = false;
    this.tempHandle = this.handle.replace('@', '');
    this.handleStatus = HANDLE_STATUS.NONE;
  }

  startEditingDisplayName() {
    if (!this.canEditProfile) {
      return;
    }
    this.isEditingDisplayName = true;
    this.tempDisplayName = this.displayName;
    setTimeout(() => {
      this.displayNameInput.nativeElement.focus();
    });
  }

  onDisplayNameBlur() {
    const newName = this.tempDisplayName.trim();
    this.isEditingDisplayName = false;
    if (newName === '' || newName.length > 32 || newName === this.displayName) {
      this.tempDisplayName = this.displayName;
      return;
    }
    this.displayName = newName;
      const data = { displayName: newName };
      this.usersService.patchUser(data).pipe(take(1)).subscribe({
        complete: () => {
          this.displayName = newName;
          this.tempDisplayName = this.displayName;
        }
      });
  }

  startEditingBio() {
    if (!this.canEditProfile) {
      return;
    }
    this.isEditingBio = true;
    this.tempBio = this.bio;
    setTimeout(() => {
      this.bioInput.nativeElement.focus();
    });
  }

  onBioBlur() {
    const newBio = this.tempBio.trim();
    this.isEditingBio = false;
    this.bio = newBio;

    if (newBio === '' || newBio.length > 200 || newBio === this.bio) {
      this.tempBio = this.bio;
      return;
    }
    const data = { bio: newBio };
    this.usersService.patchUser(data).pipe(take(1)).subscribe({
      complete: () => {
        this.tempBio = this.bio;
      }
    });
  }
}
