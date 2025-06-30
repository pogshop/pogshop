import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackService } from '../services/feedback-service.service';

enum FormState {
  FORM,
  SUBMITTED,
}

@Component({
  selector: 'app-seller-referral-form',
  imports: [ReactiveFormsModule],
  templateUrl: './seller-referral-form.component.html',
  styleUrl: './seller-referral-form.component.scss',
})
export class SellerReferralFormComponent {
  @Input() userHandle: string | null = null;
  @Input() imageURL: string | null = null;
  suggestionForm: any;
  isSubmitting = false;
  submitSuccess = false;
  formState = FormState.FORM;
  FormState = FormState;

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private feedbackService: FeedbackService
  ) {
    // Initialize form (you'll need to import ReactiveFormsModule and FormBuilder)
    this.suggestionForm = this.fb.group({
      usernames: [''],
      message: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.suggestionForm.valid) {
      this.isSubmitting = true;
      await this.feedbackService.submitSellerReferral(
        this.suggestionForm.value.usernames,
        this.suggestionForm.value.message
      );
      this.isSubmitting = false;
      this.formState = FormState.SUBMITTED;
      this.cdRef.detectChanges();
    }
  }

  startNewSuggestion() {
    this.formState = FormState.FORM;
    this.suggestionForm.reset();
    this.cdRef.detectChanges();
  }
}
