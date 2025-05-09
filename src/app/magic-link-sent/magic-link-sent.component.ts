import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { NavBarComponent } from "../components/nav-bar/nav-bar.component";
import { AuthService } from '../services/auth-service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-magic-link-sent',
  templateUrl: './magic-link-sent.component.html',
  styleUrls: ['./magic-link-sent.component.scss'],
  imports: [NavBarComponent, CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MagicLinkSentComponent  {
  disableMagicLinkButton = false;
  private email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.email = this.router.getCurrentNavigation()?.extras.state?.['email'] || '';
  }
  
  sendMagicLink(): void {
    this.disableMagicLinkButton = true;
    this.cdr.detectChanges();
    
    this.authService.sendMagicLink(this.email)
      .pipe(
        finalize(() => {
          this.disableMagicLinkButton = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  tryDifferentEmail(): void {
    this.router.navigate(['/login']);
  }
}