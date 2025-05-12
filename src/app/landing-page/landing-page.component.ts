import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { HandleServiceService } from '../services/handle-service.service';
import { FormControl } from '@angular/forms';
import { EMPTY } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  skipWhile,
  switchMap,
  tap,
} from 'rxjs/operators';
import { AuthService } from '../services/auth-service.service';
import { IntegrationsPageComponent } from '../integrations-page/integrations-page.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../services/users-service.service';

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    NavBarComponent,
    IntegrationsPageComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [
    trigger('bubblePop', [
      state(
        'visible',
        style({
          transform: 'scale(1) translateY(0)',
          opacity: 1,
        })
      ),
      state(
        'hidden',
        style({
          transform: 'scale(0.2) translateY(50px)',
          opacity: 0,
        })
      ),
      transition('hidden => visible', [
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'),
      ]),
    ]),
  ],
})
export class LandingPageComponent implements OnInit {
  showFloatingEmotes = false;
  isLoggedIn: 'loading' | 'loggedIn' | 'loggedOut' = 'loading';
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
  handleIsTaken = false;
  handleFormControl = new FormControl('');
  isCheckingHandle = false;
  handleStatus:
    | 'available'
    | 'taken'
    | 'checking'
    | 'invalid'
    | 'reserved'
    | null = null;

  // Needed to auto play video
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;

  constructor(
    private router: Router,
    private handleService: HandleServiceService,
    private usersService: UsersService,
    private destroyRef: DestroyRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.usersService.getCurrentUser()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((user) => {
        this.isLoggedIn = !!user ? 'loggedIn' : 'loggedOut';
        this.changeDetectorRef.detectChanges();
      });
    // Initialize floating emotes if needed
    this.generateFloatingEmotes();

    // Set up handle availability check with debouncing
    this.handleFormControl.valueChanges
      .pipe(
        tap(() => {
          this.handleStatus = 'checking';
        }),
        debounceTime(500), // Wait for 500ms after the user stops typing
        distinctUntilChanged(), // Only check if the value has changed
        switchMap((handle) => {
          if (!handle) {
            this.handleStatus = null;
            return EMPTY; // Return empty Observable
          }

          // Validate handle format
          const isValidFormat = /^[a-zA-Z0-9]{3,}$/.test(handle);
          if (!isValidFormat) {
            this.handleStatus = 'invalid';
            return EMPTY;
          }

          return this.handleService.checkHandleAvailability(handle);
        })
      )
      .subscribe({
        next: (isAvailable) => {
          this.handleStatus = isAvailable ? 'available' : 'taken';
        },
        error: (error) => {
          console.error('Error checking handle availability:', error);
          this.handleStatus = null;
        },
      });
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  navigateToLogin() {
    this.router.navigate(['/login'], {
      state: { handle: this.handleFormControl.value || '', isNewUser: true },
    });
  }

  ngAfterViewInit() {
    if (this.isLoggedIn === 'loggedOut') {
      const video = this.videoPlayer.nativeElement;
      video.muted = true; // Must be muted for autoplay to work
      video.play().catch((err: any) => {
        console.error('Autoplay failed:', err);
        // Handle the error - perhaps show a play button
      });
    }
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
