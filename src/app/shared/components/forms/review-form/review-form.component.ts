import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { GenericService } from '@shared/services/generic.service';
import { POST_REVIEW } from '@config/index';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

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
    private genericService: GenericService,
    private store: Store
  ) {
    this.reviewForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      subject: [null],
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

    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((state: any) => {
        const formValue = this.reviewForm.value;
        const payload = {
          ProductID: this.productId,
          UserID: state?.user?.data?._id ?? null,
          ReviewerName: formValue.name,
          ReviewerEmail: formValue.email,
          Title: formValue.subject,
          Rating: formValue.rating,
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
      });
  }
}
