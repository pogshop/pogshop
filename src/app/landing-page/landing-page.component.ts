import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NavBarComponent],
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

  // Needed to auto play video
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize floating emotes if needed
    this.generateFloatingEmotes();
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  ngAfterViewInit() {
    const video = this.videoPlayer.nativeElement;
    video.muted = true; // Must be muted for autoplay to work
    video.play().catch((err: any) => {
      console.error('Autoplay failed:', err);
      // Handle the error - perhaps show a play button
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
