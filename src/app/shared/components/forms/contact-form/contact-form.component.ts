import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GenericService } from '@shared/services/generic.service';
import { POST_CONTACT } from '@config/index';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  public contactForm!: FormGroup;
  public formSubmitted = false;
  public submitting = false;

  constructor(
    private toastrService: ToastrService,
    private genericService: GenericService
  ) {}

  ngOnInit() {
    this.contactForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null),
      subject: new FormControl(null, Validators.required),
      message: new FormControl(null, Validators.required),
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (!this.contactForm.valid || this.submitting) {
      return;
    }

    const { name, email, phone, subject, message } = this.contactForm.value;
    const payload: any = { name, email, subject, message };
    if (phone) {
      payload.phone = phone;
    }

    this.submitting = true;
    this.genericService.postObservable(POST_CONTACT, payload).subscribe({
      next: () => {
        this.toastrService.success(
          'Thanks for reaching out! We will get back to you soon.'
        );
        this.contactForm.reset();
        this.formSubmitted = false;
        this.submitting = false;
      },
      error: (err) => {
        const message =
          err?.error?.message || 'Something went wrong. Please try again.';
        this.toastrService.error(message);
        this.submitting = false;
      },
    });
  }

  get name() {
    return this.contactForm.get('name');
  }
  get email() {
    return this.contactForm.get('email');
  }
  get phone() {
    return this.contactForm.get('phone');
  }
  get subject() {
    return this.contactForm.get('subject');
  }
  get message() {
    return this.contactForm.get('message');
  }
}
