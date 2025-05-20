// sign-up.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../components/nav-bar/nav-bar.component';
import { debounceTime, distinctUntilChanged, tap,  EMPTY, switchMap } from 'rxjs';
import { HandleServiceService } from '../services/handle-service.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent implements OnInit {
  handleStatus: 'available' | 'taken' | 'checking' | 'invalid' | 'reserved' | null = null;
  handleFormControl = new FormControl('');
  constructor(private router: Router, private handleService: HandleServiceService, private changeDetectorRef: ChangeDetectorRef) {
  }
  ngOnInit() {
    // Set up handle availability check with debouncing
    this.handleFormControl.valueChanges.pipe(
      tap(()=> {
        this.handleStatus = 'checking';
      }),
      debounceTime(400), // Wait for 400ms after the user stops typing
      distinctUntilChanged(), // Only check if the value has changed
      switchMap(handle => {
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
    ).subscribe({
      next: (isAvailable) => {
        this.handleStatus = isAvailable ? 'available' : 'taken';
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error checking handle availability:', error);
        this.handleStatus = null;
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login'], { state: { handle: this.handleFormControl.value, isNewUser: true}});
  }


}
