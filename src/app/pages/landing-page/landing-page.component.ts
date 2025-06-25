import {
  Component,
  OnInit,
  HostListener,
  DestroyRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { HandleServiceService } from '../../services/handle-service.service';
import { FormControl, Validators } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ShopPageComponent } from '../shop-page/shop-page.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../services/users-service.service';
import { CdnImagePipe } from '../../pipes/cdn-image.pipe';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth-service.service';

enum LOGIN_STATUS {
  LOADING = 'LOADING',
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
}

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavBarComponent,
    ShopPageComponent,
    CdnImagePipe,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  showFloatingEmotes = false;
  isLoggedIn: LOGIN_STATUS = LOGIN_STATUS.LOADING;
  LOGIN_STATUS = LOGIN_STATUS;
  visibleCards = {
    features: false,
    products: false,
    steps: false,
  };
  floatingEmotes: Array<{
    emoji: string;
    left: number;
    delay: number;
    duration: number;
  }> = [];
  handleFormControl: FormControl;

  constructor(
    private router: Router,
    private handleService: HandleServiceService,
    private usersService: UsersService,
    private destroyRef: DestroyRef,
    private changeDetectorRef: ChangeDetectorRef,
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {
    this.handleFormControl = new FormControl<string | null>('', {
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{3,}$/),
      ],
      asyncValidators: [this.validateHandleAvailability.bind(this)],
    });
    this.usersService
      .getAuthUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.isLoggedIn = user
          ? LOGIN_STATUS.LOGGED_IN
          : LOGIN_STATUS.LOGGED_OUT;
        this.changeDetectorRef.markForCheck();
      });
  }

  twitchLogin(): void {
    this.analyticsService.logEvent('landing_page_twitch_login_button_clicked');
    this.authService.twitchLogin();
  }

  ngOnInit() {
    if (this.isLoggedIn === LOGIN_STATUS.LOGGED_IN) {
      return;
    }
    // Initialize floating emotes if needed
    this.generateFloatingEmotes();
    this.handleFormControl.valueChanges.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  private validateHandleAvailability(
    control?: AbstractControl
  ): Observable<ValidationErrors | null> {
    const value = control?.value.toLowerCase();
    if (!value) {
      return of(null);
    }

    this.handleFormControl.markAsPending();
    this.changeDetectorRef.detectChanges();

    return timer(400).pipe(
      switchMap(() => this.handleService.checkHandleAvailability(value)),
      take(1),
      map((isAvailable) => {
        this.changeDetectorRef.detectChanges();
        return isAvailable ? null : { handleTaken: true };
      })
    );
  }

  navigateToLogin() {
    this.router.navigate(['/login'], {
      state: { handle: this.handleFormControl.value || '', isNewUser: true },
    });
  }
  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 100 && !this.showFloatingEmotes) {
      this.showFloatingEmotes = true;
    }

    // Animate cards on scroll
    const featuresSection = document.getElementById('features-section');
    const productsSection = document.getElementById('products-section');
    const stepsSection = document.getElementById('steps-section');

    if (featuresSection) {
      const rect = featuresSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight - 100) {
        this.visibleCards.features = true;
      }
    }

    if (productsSection) {
      const rect = productsSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight - 100) {
        this.visibleCards.products = true;
      }
    }

    if (stepsSection) {
      const rect = stepsSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight - 100) {
        this.visibleCards.steps = true;
      }
    }
  }

  generateFloatingEmotes() {
    const emotes = ['🎉', '🎊', '🎈', '🚀', '✨', '⭐', '💫', '🌟', '🎮', '💎'];
    this.floatingEmotes = [];

    for (let i = 0; i < 15; i++) {
      const emote = emotes[Math.floor(Math.random() * emotes.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 3 + Math.random() * 2;

      this.floatingEmotes.push({
        emoji: emote,
        left: left,
        delay: delay,
        duration: duration,
      });
    }
  }
}
