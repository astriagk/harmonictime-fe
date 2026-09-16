import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { YoutubeVideoService } from 'src/app/shared/services/youtube-video.service';
import {
  IYoutubeVideo,
  IYoutubeVideoPayload,
  YoutubeVideoStatus,
} from 'src/app/shared/types/youtube-video-d-t';
import {
  defaultThumbnail,
  extractVideoId,
} from 'src/app/shared/utils/youtube';

@Component({
  selector: 'app-admin-youtube-video-form',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AdminYoutubeVideoFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  isEditing = false;
  isLoading = false;
  isSubmitting = false;
  formError = '';

  // Joi failures keyed by field, so a 400 lands under the offending input
  // instead of in a single generic toast — same handling as the blog form.
  serverErrors: Record<string, string> = {};
  serverErrorList: { field: string; message: string }[] = [];
  errorSource: 'form' | 'server' | '' = '';
  serverStatus = '';

  videoId: string | null = null;
  // The id parsed out of whatever was pasted; drives the preview and the
  // "we understood this link" line under the URL field.
  parsedVideoId = '';

  statusOptions: { label: string; value: YoutubeVideoStatus }[] = [
    { label: 'Draft — not shown on the site', value: 'draft' },
    { label: 'Published — live on the home page', value: 'published' },
    { label: 'Archived — hidden, kept for reference', value: 'archived' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private youtubeVideoService: YoutubeVideoService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Title: ['', [Validators.required, Validators.maxLength(200)]],
      YoutubeUrl: ['', [Validators.required, this.youtubeUrlValidator]],
      Thumbnail: [''],
      Order: [null],
      Author: ['', [Validators.required, Validators.maxLength(120)]],
      // Required, but pre-filled with today so the common case is one less
      // field to think about.
      PublishedAt: [this.todayInput(), Validators.required],
      Status: ['draft' as YoutubeVideoStatus],
    });

    this.form
      .get('YoutubeUrl')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.parsedVideoId = extractVideoId(value) ?? '';
      });

    this.videoId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.videoId;
    if (this.videoId) this.loadVideo(this.videoId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // The contract has no GET /:id, so the service resolves the block out of the
  // admin list. A miss means the id is stale — send the admin back to the list
  // rather than leaving an empty form that would create a duplicate on save.
  private loadVideo(id: string): void {
    this.isLoading = true;
    this.youtubeVideoService
      .getById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (video) => {
          if (!video) {
            this.toastr.error('Video not found');
            this.router.navigate(['/admin/youtube-videos']);
            return;
          }
          this.patchFrom(video);
        },
        error: (err) => {
          this.toastr.error(err?.error?.message ?? 'Failed to load video');
          this.router.navigate(['/admin/youtube-videos']);
        },
      });
  }

  private patchFrom(video: IYoutubeVideo): void {
    this.form.patchValue({
      Title: video.Title ?? '',
      YoutubeUrl: video.YoutubeUrl ?? '',
      Thumbnail: video.Thumbnail ?? '',
      Order: video.Order ?? null,
      Author: video.Author ?? '',
      // Blocks saved before the date existed have none — fall back to today so
      // a now-required field is not blocking an unrelated edit.
      PublishedAt: this.toDateInput(video.PublishedAt) || this.todayInput(),
      Status: video.Status ?? 'draft',
    });
    this.form.markAsPristine();
    this.parsedVideoId = extractVideoId(video.YoutubeUrl) ?? video.VideoId ?? '';
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  // What the home page grid will show: the override if one is set, otherwise
  // YouTube's own still for the parsed id.
  get previewThumbnail(): string {
    const override = (this.form?.get('Thumbnail')?.value ?? '').trim();
    if (override) return override;
    return defaultThumbnail(this.parsedVideoId);
  }

  clearThumbnail(): void {
    // Blank means "derive it" — the server swaps in the default still.
    this.form.get('Thumbnail')!.setValue('');
    this.form.markAsDirty();
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  save(): void {
    this.clearErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorSource = 'form';
      this.formError = 'Fix the highlighted fields before saving.';
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting = true;

    const request$ = this.isEditing
      ? this.youtubeVideoService.update(this.videoId!, payload)
      : this.youtubeVideoService.create(payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.toastr.success(this.isEditing ? 'Video updated' : 'Video added');
        this.form.markAsPristine();
        this.router.navigate(['/admin/youtube-videos']);
      },
      error: (err: HttpErrorResponse) => {
        this.errorSource = 'server';
        this.serverStatus = this.describeStatus(err);
        this.serverErrors = this.mapValidationErrors(err);
        this.serverErrorList = this.listValidationErrors(err);
        this.formError =
          this.serverErrors['_'] ?? 'The server rejected this video.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/youtube-videos']);
  }

  // Unknown keys are rejected by the API, so the payload is assembled field by
  // field. Blank optional values are left out entirely rather than sent empty:
  // an omitted Thumbnail is auto-derived and an omitted Order appends to the
  // end, which is not what an empty string would do.
  private buildPayload(): IYoutubeVideoPayload {
    const raw = this.form.value;
    const payload: IYoutubeVideoPayload = {
      Title: (raw.Title ?? '').trim(),
      YoutubeUrl: (raw.YoutubeUrl ?? '').trim(),
      Author: (raw.Author ?? '').trim(),
      // The <input type="date"> gives a plain yyyy-mm-dd; the API takes ISO,
      // the same conversion the blog form does.
      PublishedAt: new Date(raw.PublishedAt).toISOString(),
      Status: raw.Status,
    };

    const thumbnail = (raw.Thumbnail ?? '').trim();
    if (thumbnail) payload.Thumbnail = thumbnail;

    // An explicit position is kept even when it is 0; only a blank field hands
    // ordering back to the server.
    if (raw.Order !== null && raw.Order !== '' && !isNaN(Number(raw.Order))) {
      payload.Order = Number(raw.Order);
    }

    return payload;
  }

  // ISO 8601 back to the yyyy-mm-dd an <input type="date"> expects.
  private toDateInput(iso?: string | null): string {
    return iso ? iso.substring(0, 10) : '';
  }

  // Today in the same yyyy-mm-dd shape, built from the local date parts — an
  // ISO string is UTC, which lands on yesterday for anyone east of Greenwich
  // late in the evening.
  private todayInput(): string {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  // ── Validation helpers ────────────────────────────────────────────────────

  // A link we cannot parse is a link the server will reject, so catch it here
  // rather than after the round trip.
  youtubeUrlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // `required` already covers the empty case
    return extractVideoId(control.value) ? null : { youtubeUrl: true };
  }

  invalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return (
      !!control &&
      control.hasError(error) &&
      (control.dirty || control.touched)
    );
  }

  private mapValidationErrors(err: HttpErrorResponse): Record<string, string> {
    if (err.status !== 400 || !Array.isArray(err.error?.data)) {
      return { _: err.error?.message ?? 'Something went wrong' };
    }
    return err.error.data.reduce((acc: Record<string, string>, detail: any) => {
      acc[detail?.path?.[0] ?? '_'] = detail?.message ?? 'Invalid value';
      return acc;
    }, {} as Record<string, string>);
  }

  // The full list, for the banner — the only place a rejection lands when the
  // offending key has no input of its own.
  private listValidationErrors(
    err: HttpErrorResponse,
  ): { field: string; message: string }[] {
    if (err.status !== 400 || !Array.isArray(err.error?.data)) return [];
    return err.error.data.map((detail: any) => ({
      field:
        Array.isArray(detail?.path) && detail.path.length
          ? detail.path.join(' › ')
          : 'Request',
      // Joi quotes the key it is complaining about; the field name is already
      // shown alongside, so the quotes just read as noise.
      message: (detail?.message ?? 'Invalid value').replace(/"/g, ''),
    }));
  }

  private describeStatus(err: HttpErrorResponse): string {
    const message = err.error?.message ?? err.statusText ?? 'Request failed';
    if (err.status === 0) {
      return 'Could not reach the server — check your connection.';
    }
    return `API responded ${err.status} — ${message}`;
  }

  private clearErrors(): void {
    this.serverErrors = {};
    this.serverErrorList = [];
    this.errorSource = '';
    this.serverStatus = '';
    this.formError = '';
  }
}
