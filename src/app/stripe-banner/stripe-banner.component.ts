// stripe-connection-banner.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { take } from 'rxjs';
import { StripeService } from '../services/stripe-service.service';
import { UsersService } from '../services/users-service.service';

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-stripe-banner',
  templateUrl: './stripe-banner.component.html',
  styleUrls: ['./stripe-banner.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class StripeBannerComponent {
  stripeForm: FormGroup;
  showCountrySelector = true;
  isDropdownOpen = false;
  isLoading = false;
  
  countryOptions: CountryOption[] = [
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'CA', label: 'Canada', flag: '🇨🇦' },
    { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
    { value: 'DE', label: 'Germany', flag: '🇩🇪' },
    { value: 'FR', label: 'France', flag: '🇫🇷' },
    { value: 'JP', label: 'Japan', flag: '🇯🇵' },
    { value: 'BR', label: 'Brazil', flag: '🇧🇷' },
    { value: 'MX', label: 'Mexico', flag: '🇲🇽' },
    { value: 'ES', label: 'Spain', flag: '🇪🇸' }
  ];

  constructor(private fb: FormBuilder, private stripeService: StripeService, private userService: UsersService) {
    this.stripeForm = this.fb.group({
      country: ['US', Validators.required]
    });
    this.userService.authUser$.pipe(take(1)).subscribe((user) => {
      const existingUserCountryCode = user?.stripeMetadata?.countryCode;
      if(existingUserCountryCode) {
        this.stripeForm.get('country')?.setValue(existingUserCountryCode);
      }
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  selectCountry(country: CountryOption): void {
    this.stripeForm.get('country')?.setValue(country.value);
    this.isDropdownOpen = false;
  }

  onContinue(): void {
    this.showCountrySelector = false;
  }

  onChangeCountry(): void {
    this.showCountrySelector = true;
  }

  onConnectStripe(): void {
    if (this.stripeForm.invalid) {
      return;
    }

    this.isLoading = true;
    const authUser = this.userService.authUser$.value;
    const selectedCountry = this.stripeForm.get('country')?.value;
    const currentCountry = authUser?.stripeMetadata?.countryCode;

    if (selectedCountry === currentCountry) {
      this.stripeService.getAccountLink(authUser?.stripeMetadata?.stripeAccountId)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            window.location.href = response.accountLink.url;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      return;
    }

    if (!authUser?.stripeMetadata?.stripeAccountId || selectedCountry !== currentCountry) {
      this.stripeService.createOnboardingLink(this.stripeForm.get('country')?.value)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            window.location.href = response.accountLink.url;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
  }

  getSelectedCountry(): CountryOption {
    const countryValue = this.stripeForm.get('country')?.value;
    return this.countryOptions.find(c => c.value === countryValue) || this.countryOptions[0];
  }
}