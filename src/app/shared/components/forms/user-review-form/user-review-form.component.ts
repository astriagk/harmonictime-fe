import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GenericService } from '@shared/services/generic.service';
import { POST_USER_REVIEW } from '@config/index';

@Component({
  selector: 'app-user-review-form',
  templateUrl: './user-review-form.component.html',
  styleUrls: ['./user-review-form.component.scss'],
})
export class UserReviewFormComponent implements OnChanges {
  @Input() products: any[] = [];
  @Input() userEmail: string = '';
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
      productId: ['', Validators.required],
      subject: ['', Validators.required],
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userEmail']?.currentValue) {
      this.reviewForm.patchValue({ email: changes['userEmail'].currentValue });
    }
    if (changes['products']?.currentValue?.length === 1) {
      this.reviewForm.patchValue({ productId: changes['products'].currentValue[0].ProductID });
    }
  }

  get rating(): number {
    return this.reviewForm.get('rating')?.value;
  }

  setRating(value: number) {
    this.reviewForm.patchValue({ rating: value });
  }

  resetForm() {
    const autoProductId = this.products.length === 1 ? this.products[0].ProductID : '';
    this.reviewForm.reset({ productId: autoProductId, rating: 0, email: this.userEmail });
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

    const { productId, subject, name, email, rating, comment } = this.reviewForm.value;
    const payload: any = {
      ProductID: productId,
      Rating: rating,
      Subject: subject,
      Email: email,
      Comment: comment,
    };
    if (name) {
      payload.Name = name;
    }

    this.genericService.postObservable(POST_USER_REVIEW, payload).subscribe({
      next: () => {
        this.toastrService.success('Review submitted successfully!');
        this.resetForm();
        this.reviewSubmitted.emit();
      },
      error: () => {
        this.toastrService.error('Failed to submit review');
      },
    });
  }
}
