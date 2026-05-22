import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@shared/services/generic.service';
import { POST_REVIEW } from '@config/index';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent {
  @Input() productId!: string;
  @Output() reviewSubmitted = new EventEmitter<void>();

  public reviewForm: FormGroup;
  public formSubmitted = false;
  public hoverRating = 0;
  public stars = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private genericService: GenericService
  ) {
    this.reviewForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: [null, Validators.required],
    });
  }

  get rating(): number {
    return this.reviewForm.get('rating')?.value;
  }

  setRating(value: number) {
    this.reviewForm.patchValue({ rating: value });
  }

  // Clear the form values, validation state and star selection
  resetForm() {
    this.reviewForm.reset({ rating: 0 });
    this.formSubmitted = false;
    this.hoverRating = 0;
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.reviewForm.invalid) {
      if (!this.rating) {
        this.toastrService.warning('Please select a star rating');
      }
      return;
    }

    const formValue = this.reviewForm.value;
    const payload = {
      ProductID: this.productId,
      Rating: formValue.rating,
      Name: formValue.name,
      Email: formValue.email,
      Comment: formValue.comment,
    };

    this.genericService.postObservable(POST_REVIEW, payload).subscribe({
      next: () => {
        this.toastrService.success('Review submitted successfully!');
        this.reviewForm.reset({ rating: 0 });
        this.formSubmitted = false;
        this.reviewSubmitted.emit();
      },
      error: () => {
        this.toastrService.error('Failed to submit review');
      },
    });
  }
}
