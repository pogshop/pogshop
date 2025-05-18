import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ShopNavbarComponent } from '../components/shop-nav-bar/shop-nav-bar.component';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users-service.service';
import { HandleServiceService } from '../services/handle-service.service';
import { FormControl, ReactiveFormsModule, FormsModule, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { combineLatest, take, Observable, timer, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { CdnImagePipe } from '../pipes/cdn-image.pipe';

enum IMAGE_TYPE {
  BANNER = 'BANNER',
  PROFILE = 'PROFILE',
}

@Component({
  selector: 'app-creator-banner',
  templateUrl: './creator-banner.component.html',
  styleUrls: ['./creator-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ShopNavbarComponent,
    CommonModule,
    FormsModule,
    CdnImagePipe,
    ReactiveFormsModule,
  ],
})
export class CreatorBannerComponent {
  displayName: string = 'Display Name';
  bio: string = "There's nothing here yet but they'll be here soon!";
  isVerified: boolean = true;
  profilePhotoURL: string = '';
  bannerPhotoURL: string = '';

  @ViewChild('profileFileInput')
  profileFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerFileInput') bannerFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('handleInput') handleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('displayNameInput')
  displayNameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bioInput') bioInput!: ElementRef<HTMLTextAreaElement>;

  IMAGE_TYPE = IMAGE_TYPE;

  copied: boolean = false;
  isEditingHandle: boolean = false;
  tempHandle: string = '';
  isEditingDisplayName = false;
  tempDisplayName = '';
  pageLoaded = false;
  isEditingBio = false;
  tempBio = '';
  canEditProfile = false;

  handleFormControl!: FormControl<string | null>;

  constructor(
    private usersService: UsersService,
    private handleService: HandleServiceService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    // Query params are used to view a profile if a handle has not been set
    const userId = this.route.snapshot.queryParams['userId'];
    if (userId) {
      combineLatest([
        this.usersService.getUserById(userId),
        this.usersService.getAuthUser(),
      ])
        .pipe(take(1))
        .subscribe(([user, authUser]) => {
          this.initializeProfile(user, authUser);
        });
    } else {
      combineLatest([
        this.usersService.getUserByHandle(this.router.url.split('/')[1]),
        this.usersService.getAuthUser(),
      ])
        .pipe(take(1))
        .subscribe(([user, authUser]) => {
          this.initializeProfile(user, authUser);
        });
    }
  }

  private validateHandleAvailability(control?: AbstractControl): Observable<ValidationErrors | null> {
    const value = control?.value.toLowerCase();
    if (!value) {
      return of(null);
    }

    if (value === this.usersService.authUser$.value?.handle) {
      return of({isSameAsCurrentHandle: true});
    }
    
    return timer(700)
      .pipe(switchMap(() => this.handleService.checkHandleAvailability(value)),
        take(1),
        map(isAvailable => {
          this.cdRef.detectChanges();
          return isAvailable ? null : { handleTaken: true };
        })
      );
  }

  private initializeProfile(user: any, authUser: any) {
    this.profilePhotoURL = user?.profilePhotoURL || this.profilePhotoURL;
    this.bannerPhotoURL = user?.bannerPhotoURL || this.bannerPhotoURL;
    this.displayName = user?.displayName || this.displayName;
    this.bio = user?.bio || this.bio;
    
    // Check if the current authenticated user is the profile owner
    this.canEditProfile = !!authUser && authUser.id === user?.id;
    this.pageLoaded = true;
    
    if(!this.canEditProfile) {
      this.handleFormControl = new FormControl(`${user?.handle}`);
      this.handleFormControl.disable();
      this.cdRef.detectChanges();
      return;
    }
    
    this.handleFormControl = new FormControl(`${user?.handle}` || 'Set your handle here', {
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{3,}$/)
      ],
      asyncValidators: [
        this.validateHandleAvailability.bind(this)
      ]
    });
    this.handleFormControl.valueChanges.pipe(
      tap(value => {
        if (value && value !== value.toLowerCase()) {
          this.handleFormControl.setValue(value.toLowerCase(), { emitEvent: false });
        }
      })
    ).subscribe();

    this.cdRef.detectChanges();
  }

  handleShare(): void {
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  triggerFileInput(imageType: IMAGE_TYPE) {
    if (!this.canEditProfile) {
      return;
    }
    if (imageType === IMAGE_TYPE.BANNER) {
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
          data = { profilePhotoFile: base64Image };
        } else {
          this.bannerPhotoURL = base64Image;
          data = { bannerPhotoFile: base64Image };
        }
        this.cdRef.detectChanges();
        
        this.usersService
          .patchUser(data)
          .pipe(take(1))
          .subscribe((result) => {
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
    this.handleFormControl.setValue(this.usersService.authUser$.value?.handle);
    setTimeout(() => {
      this.handleInput.nativeElement.focus();
    });
  }

  saveHandle() {
    if (this.handleFormControl.valid) {
      this.isEditingHandle = false;
      const data = { handle: this.handleFormControl.value };
      this.usersService
        .patchUser(data)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.handleFormControl.setErrors(null, {emitEvent: true});
            window.history.replaceState({}, '', `/${this.handleFormControl.value}`);
            this.cdRef.detectChanges();
          },
          error: (error) => {
            console.error('Error updating handle:', error);
            alert('Failed to update handle. Please try again.');
          },
        });
    }
  }

  cancelHandleEdit() {
    this.isEditingHandle = false;
    this.handleFormControl.setValue(this.usersService.authUser$.value?.handle);
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
    this.usersService
      .patchUser(data)
      .pipe(take(1))
      .subscribe({
        complete: () => {
          this.displayName = newName;
          this.tempDisplayName = this.displayName;
        },
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
    this.usersService
      .patchUser(data)
      .pipe(take(1))
      .subscribe({
        complete: () => {
          this.tempBio = this.bio;
        },
      });
  }
}
