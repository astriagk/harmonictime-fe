import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { BlogService } from 'src/app/shared/services/blog.service';
import {
  BlogStatus,
  IBlogDetail,
  IBlogSection,
  ICreateBlogRequest,
} from 'src/app/shared/types/blog-d-t';
import {
  BLOG_CATEGORY_OPTIONS,
  BLOG_TAG_OPTIONS,
} from 'src/app/shared/data/blog-options';
import { reloadAdminBlogs } from 'src/app/store/actions/admin-blogs.actions';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

// Only the optional sections collapse. Anything holding a required field stays
// open — a mandatory input must never be hidden behind a click.
type SectionKey = 'publish' | 'seo';

@Component({
  selector: 'app-admin-blog-form',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AdminBlogFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  // Both pickers accumulate from three sources: the seed lists in
  // blog-options.ts, whatever the API reports as already in use, and anything
  // an editor types into the "Add" box. See `mergeOptions` for how the union is
  // de-duplicated.
  categories: string[] = [...BLOG_CATEGORY_OPTIONS];
  tagOptions: string[] = [...BLOG_TAG_OPTIONS];

  // The free-text boxes, revealed by "＋ Add new".
  showNewCategory = false;
  newCategory = '';
  showNewTag = false;
  newTag = '';

  isEditing = false;
  isLoadingBlog = false;
  isSubmitting = false;
  formError = '';

  // Joi failures mapped onto field names, so a 400 lands under the offending
  // input instead of in a single generic toast. Keyed by the first path
  // segment, which is what the inline spans look up.
  serverErrors: Record<string, string> = {};

  // The same failures as a flat list, keyed by their *full* Joi path. A section
  // error arrives as ["Sections", 1, "Content"] — collapsing that onto
  // "Sections" loses which block is at fault, and a rejected key that has no
  // input of its own (an unknown field, say) has nowhere to render at all.
  serverErrorList: { field: string; message: string }[] = [];

  // Whether the banner is reporting our own validators or the API's, plus the
  // status line for the latter. An admin should never have to guess whether
  // they mistyped something or the server is out of date.
  errorSource: 'form' | 'server' | '' = '';
  serverStatus = '';

  blogId: string | null = null;
  private loadedSlug = '';

  coverUploading = false;
  // Index of the section whose image is currently uploading, or null.
  sectionUploading: number | null = null;

  // Sections run top to bottom: the required ones (Article, Cover, Organise)
  // are always open, and only these two optional ones collapse.
  openSections: Record<SectionKey, boolean> = {
    publish: false,
    seo: false,
  };

  // Which controls live in which collapsible group — used to surface errors on
  // a closed header and to auto-open the offending group on a failed submit.
  private readonly sectionFields: Record<SectionKey, string[]> = {
    publish: ['PublishedAt'],
    seo: ['Seo.MetaTitle', 'Seo.MetaDescription'],
  };

  // Human names for the failure summary. A control the admin cannot see is
  // still a control they have to fix, so the message has to name it.
  private readonly fieldLabels: Record<string, string> = {
    Title: 'Title',
    Slug: 'Slug',
    Excerpt: 'Excerpt',
    Category: 'Category',
    Author: 'Author',
    Image: 'Cover image',
    PublishedAt: 'Publish date',
    'Seo.MetaTitle': 'Meta title',
    'Seo.MetaDescription': 'Meta description',
    Heading: 'Sub-heading',
    Content: 'Text',
    Caption: 'Caption',
  };

  // Fields that are derived or rarely touched stay behind a reveal.
  showSlug = false;
  scheduleEnabled = false;

  private destroy$ = new Subject<void>();

  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  private readonly maxImageBytes = 5 * 1024 * 1024; // 5 MB

  // Text only — no image button. Pictures belong to a section, so they sit in
  // their own field and render in a fixed place relative to that section's
  // text. Inline images used to end up stacked away from the copy they belong
  // to. The rest is limited to the tags the server keeps, so an admin cannot
  // author markup that silently disappears on save.
  quillModules = {
    toolbar: [
      [{ header: [3, 4, false] }],
      ['bold', 'italic'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean'],
    ],
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadTags();

    this.blogId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.blogId;

    if (this.isEditing) {
      this.loadBlog(this.blogId!);
    } else {
      this.prefillAuthor();
    }

    // Mirror the title into the slug until the admin edits the slug themselves.
    // The server never moves a slug on its own once a post exists, so editing
    // must not either — a live URL would break.
    this.form
      .get('Title')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((title: string) => {
        const slugCtrl = this.form.get('Slug')!;
        if (this.isEditing || slugCtrl.dirty) return;
        slugCtrl.setValue(this.slugify(title ?? ''), { emitEvent: false });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Validators mirror the server's Joi schema so a bad field is caught before
  // the round trip. Keep the two in step.
  private initForm(): void {
    this.form = this.fb.group({
      Title: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      ],
      Slug: [
        '',
        [Validators.maxLength(120), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)],
      ],
      Excerpt: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(400)],
      ],
      Category: ['', [Validators.required, Validators.maxLength(120)]],
      Author: ['', [Validators.required, Validators.maxLength(120)]],
      Image: ['', Validators.required],
      Tags: [[] as string[]],
      // At least one section — the article body.
      Sections: this.fb.array([this.newSection()]),
      Status: ['draft' as BlogStatus],
      PublishedAt: [''],
      Seo: this.fb.group({
        MetaTitle: ['', Validators.maxLength(200)],
        MetaDescription: ['', Validators.maxLength(400)],
      }),
    });
  }

  // Defaults first, then anything the API already has — so the list is never
  // empty and never loses a category an older post used.
  private loadCategories(): void {
    this.blogService.categories().subscribe({
      next: (list) => {
        const fromApi = (list ?? []).map((c) => c.Category).filter(Boolean);
        this.categories = this.mergeOptions(BLOG_CATEGORY_OPTIONS, fromApi);
      },
      error: () => {
        // Keep the defaults; the "Add new" box still works either way.
        this.categories = [...BLOG_CATEGORY_OPTIONS];
      },
    });
  }

  // Same accumulation for tags. The endpoint does not exist server-side yet, so
  // a failure here is expected rather than exceptional — it just leaves the
  // seeds in place, and the "Add new" box still covers anything missing.
  private loadTags(): void {
    this.blogService.tags().subscribe({
      next: (list) => {
        this.tagOptions = this.mergeOptions(BLOG_TAG_OPTIONS, list ?? []);
      },
      error: () => {
        this.tagOptions = [...BLOG_TAG_OPTIONS];
      },
    });
  }

  // Union of the seeds and whatever else turned up, compared case- and
  // space-insensitively so an older post's `rolex` does not sit in the list
  // beside the seed's `Rolex`. The seed's casing wins, since that is the one
  // written for display; anything the seeds don't know about keeps the casing
  // it arrived with. Sorted so a long list stays scannable.
  private mergeOptions(seeds: string[], extra: string[]): string[] {
    const byKey = new Map<string, string>();
    [...seeds, ...extra].forEach((value) => {
      const label = (value ?? '').trim();
      if (!label) return;
      const key = label.toLowerCase().replace(/\s+/g, ' ');
      if (!byKey.has(key)) byKey.set(key, label);
    });
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
  }

  // ── Sections ──────────────────────────────────────────────────────────────
  // An article is an ordered list of blocks, each some text plus an optional
  // image shown beneath it.

  get sections(): FormArray {
    return this.form.get('Sections') as FormArray;
  }

  private newSection(section?: IBlogSection): FormGroup {
    return this.fb.group({
      Heading: [section?.Heading ?? '', Validators.maxLength(200)],
      Content: [
        section?.Content ?? '',
        [Validators.required, Validators.minLength(10)],
      ],
      Image: [section?.Image ?? ''],
      Caption: [section?.Caption ?? '', Validators.maxLength(200)],
    });
  }

  addSection(): void {
    this.sections.push(this.newSection());
    this.sections.markAsDirty();
  }

  removeSection(index: number): void {
    if (this.sections.length === 1) return; // an article needs a body
    this.sections.removeAt(index);
    this.sections.markAsDirty();
  }

  moveSection(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= this.sections.length) return;
    const group = this.sections.at(index);
    this.sections.removeAt(index);
    this.sections.insert(target, group);
    this.sections.markAsDirty();
  }

  sectionInvalid(index: number, control: string): boolean {
    const c = this.sections.at(index).get(control);
    return !!c && c.invalid && c.touched;
  }

  onSectionImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.validateImage(file)) return;

    this.sectionUploading = index;
    this.blogService
      .uploadImage(file)
      .pipe(finalize(() => (this.sectionUploading = null)))
      .subscribe({
        next: (url) => {
          if (!url) {
            this.toastr.error('Upload succeeded but no URL was returned');
            return;
          }
          this.sections.at(index).get('Image')!.setValue(url);
          this.sections.markAsDirty();
        },
        error: (err) =>
          this.toastr.error(err?.error?.message ?? 'Image upload failed'),
      });
  }

  clearSectionImage(index: number): void {
    this.sections.at(index).get('Image')!.setValue('');
    this.sections.markAsDirty();
  }

  private prefillAuthor(): void {
    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((state: any) => {
        const user = state?.user?.data;
        const name =
          user?.name ??
          user?.fullName ??
          [user?.firstName, user?.lastName].filter(Boolean).join(' ');
        if (name) this.form.get('Author')!.setValue(name);
      });
  }

  private loadBlog(id: string): void {
    this.isLoadingBlog = true;
    this.blogService
      .getBySlug(id)
      .pipe(finalize(() => (this.isLoadingBlog = false)))
      .subscribe({
        next: (blog) => {
          if (!blog) {
            this.toastr.error('Blog post not found');
            this.router.navigate(['/admin/blogs']);
            return;
          }
          this.patchFrom(blog);
          // Open the reveals that already hold a value, so nothing an existing
          // post carries is hidden from the person editing it.
          this.scheduleEnabled = !!blog.PublishedAt;
          this.openSections.seo = !!(
            blog.Seo?.MetaTitle || blog.Seo?.MetaDescription
          );
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error(
            err?.error?.message ?? 'Failed to load blog post'
          );
          this.router.navigate(['/admin/blogs']);
        },
      });
  }

  private patchFrom(blog: IBlogDetail): void {
    this.loadedSlug = blog.Slug ?? '';

    // A post can carry a category or tags the pickers have not heard of — the
    // API list is built from published posts, so a draft's own values may be
    // missing. Fold them in before patching, or the <select> would find no
    // matching <option> and render blank, silently dropping the value on save.
    if (blog.Category) {
      this.categories = this.mergeOptions(this.categories, [blog.Category]);
    }
    if (blog.Tags?.length) {
      this.tagOptions = this.mergeOptions(this.tagOptions, blog.Tags);
    }

    // Rebuild the FormArray to match the post's section count before patching.
    const incoming = blog.Sections?.length ? blog.Sections : [{ Content: '' }];
    this.sections.clear();
    incoming.forEach((section) => this.sections.push(this.newSection(section)));

    this.form.patchValue({
      Title: blog.Title ?? '',
      Slug: blog.Slug ?? '',
      Excerpt: blog.Excerpt ?? '',
      Category: blog.Category ?? '',
      Author: blog.Author ?? '',
      Image: blog.Image ?? '',
      Tags: blog.Tags ?? [],
      Status: blog.Status ?? 'draft',
      PublishedAt: this.toDateTimeInput(blog.PublishedAt),
      Seo: {
        MetaTitle: blog.Seo?.MetaTitle ?? '',
        MetaDescription: blog.Seo?.MetaDescription ?? '',
      },
    });
    this.form.markAsPristine();
  }

  // ── Images ────────────────────────────────────────────────────────────────

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // let the same file be re-picked after an error
    if (!file || !this.validateImage(file)) return;

    this.coverUploading = true;
    this.blogService
      .uploadImage(file)
      .pipe(finalize(() => (this.coverUploading = false)))
      .subscribe({
        next: (url) => {
          if (!url) {
            this.toastr.error('Upload succeeded but no URL was returned');
            return;
          }
          this.form.get('Image')!.setValue(url);
          this.form.get('Image')!.markAsDirty();
        },
        error: (err) =>
          this.toastr.error(err?.error?.message ?? 'Image upload failed'),
      });
  }

  clearCover(): void {
    this.form.get('Image')!.setValue('');
    this.form.get('Image')!.markAsDirty();
    this.form.get('Image')!.markAsTouched();
  }

  private validateImage(file: File): boolean {
    if (!this.allowedImageTypes.includes(file.type)) {
      this.toastr.error('Only JPG and PNG images are allowed');
      return false;
    }
    if (file.size > this.maxImageBytes) {
      this.toastr.error('Image is too large — 5 MB maximum');
      return false;
    }
    return true;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  // Draft keeps the author on the page so they can carry on writing; Publish
  // returns them to the list.
  saveDraft(): void {
    this.submit('draft', false);
  }

  publish(): void {
    this.submit('published', true);
  }

  private submit(status: BlogStatus, leaveAfterSave: boolean): void {
    this.form.get('Status')!.setValue(status);
    this.clearErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.revealSectionsWithErrors();
      const fields = this.invalidFieldLabels();
      this.errorSource = 'form';
      this.formError = fields.length
        ? `Please fix: ${fields.join(', ')}.`
        : 'Please fix the highlighted fields.';
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    const payload = this.toPayload();
    const request$ = this.isEditing
      ? this.blogService.update(this.blogId!, payload)
      : this.blogService.create(payload);

    request$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: (post) => {
        this.toastr.success(
          status === 'published' ? 'Blog post published' : 'Draft saved'
        );
        this.store.dispatch(reloadAdminBlogs());

        if (leaveAfterSave) {
          this.form.markAsPristine();
          this.router.navigate(['/admin/blogs']);
          return;
        }

        // Stay put, but show exactly what was stored: Content comes back
        // sanitised and Slug may have been generated or de-duplicated.
        this.blogId = post?._id ?? this.blogId;
        this.isEditing = true;
        if (post) this.patchFrom(post);
      },
      error: (err: HttpErrorResponse) => {
        this.errorSource = 'server';
        this.serverStatus = this.describeStatus(err);
        this.serverErrors = this.mapValidationErrors(err);
        this.serverErrorList = this.listValidationErrors(err);
        this.revealSectionsWithErrors();
        this.formError =
          this.serverErrors['_'] ??
          'The server rejected this post — see the details below.';
        this.toastr.error(this.formError, 'Server error');
      },
    });
  }

  // Only send the fields the API declares — unknown keys are rejected — and
  // drop empty optionals so the server applies its own defaults rather than
  // storing blanks.
  private toPayload(): ICreateBlogRequest {
    const v = this.form.getRawValue();

    const payload: ICreateBlogRequest = {
      Title: (v.Title ?? '').trim(),
      Excerpt: (v.Excerpt ?? '').trim(),
      // Drop empty optional keys per section so the server stores nothing blank.
      Sections: (v.Sections ?? []).map((s: any) => ({
        Content: s.Content ?? '',
        ...(s.Heading?.trim() ? { Heading: s.Heading.trim() } : {}),
        ...(s.Image?.trim() ? { Image: s.Image.trim() } : {}),
        ...(s.Caption?.trim() ? { Caption: s.Caption.trim() } : {}),
      })),
      Image: v.Image ?? '',
      Author: (v.Author ?? '').trim(),
      Category: (v.Category ?? '').trim(),
      Status: v.Status as BlogStatus,
    };

    if (v.Slug?.trim()) payload.Slug = v.Slug.trim();
    if (v.Tags?.length) payload.Tags = v.Tags;

    // Only send a date when one was actually chosen — omitting it lets
    // "published" stamp now, and a future date schedules the post.
    if (v.PublishedAt) {
      payload.PublishedAt = new Date(v.PublishedAt).toISOString();
    }

    const metaTitle = v.Seo?.MetaTitle?.trim();
    const metaDescription = v.Seo?.MetaDescription?.trim();
    if (metaTitle || metaDescription) {
      payload.Seo = {
        ...(metaTitle ? { MetaTitle: metaTitle } : {}),
        ...(metaDescription ? { MetaDescription: metaDescription } : {}),
      };
    }

    return payload;
  }

  // A 400 carries Joi details in the envelope's `data` array.
  private mapValidationErrors(err: HttpErrorResponse): Record<string, string> {
    if (err.status !== 400 || !Array.isArray(err.error?.data)) {
      return { _: err.error?.message ?? 'Something went wrong' };
    }
    return err.error.data.reduce(
      (acc: Record<string, string>, detail: any) => {
        acc[detail?.path?.[0] ?? '_'] = detail?.message ?? 'Invalid value';
        return acc;
      },
      {} as Record<string, string>
    );
  }

  // The full list, with the whole Joi path preserved, for the banner. This is
  // the only place a rejection lands when the offending key has no input of its
  // own — an unknown field the server refuses outright, for instance.
  private listValidationErrors(
    err: HttpErrorResponse
  ): { field: string; message: string }[] {
    if (err.status !== 400 || !Array.isArray(err.error?.data)) return [];
    return err.error.data.map((detail: any) => ({
      field: this.describePath(detail?.path),
      // Joi quotes the key it is complaining about; the field name is already
      // shown alongside, so the quotes just read as noise.
      message: (detail?.message ?? 'Invalid value').replace(/"/g, ''),
    }));
  }

  // ["Sections", 1, "Content"] → "Sections › Section 2 › Text"
  private describePath(path: unknown[] | undefined): string {
    if (!Array.isArray(path) || !path.length) return 'Request';
    return path
      .map((part) =>
        typeof part === 'number'
          ? `Section ${part + 1}`
          : this.fieldLabels[String(part)] ?? String(part)
      )
      .join(' › ');
  }

  // Says plainly where the failure came from, so a schema mismatch does not
  // look like something the author typed.
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

  cancel(): void {
    this.router.navigate(['/admin/blogs']);
  }

  // ── Helpers used by the template ──────────────────────────────────────────

  get excerptLength(): number {
    return (this.form.get('Excerpt')!.value ?? '').length;
  }

  get slugChanged(): boolean {
    return (
      this.isEditing &&
      !!this.loadedSlug &&
      this.form.get('Slug')!.value !== this.loadedSlug
    );
  }

  invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && c.touched;
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  // A native <select> only carries one value, so the control holds the array
  // and the dropdown just appends to it.

  get selectedTags(): string[] {
    return this.form.get('Tags')!.value ?? [];
  }

  // Hide what's already chosen so the list can't offer a duplicate.
  get availableTags(): string[] {
    const chosen = this.selectedTags.map((t) => t.toLowerCase());
    return this.tagOptions.filter((t) => !chosen.includes(t.toLowerCase()));
  }

  addTag(tag: string): void {
    const label = (tag ?? '').trim();
    if (!label) return;
    // Case-insensitive, so picking "Rolex" after an older post left "rolex" on
    // the form does not tag the post twice.
    if (this.selectedTags.some((t) => t.toLowerCase() === label.toLowerCase())) {
      return;
    }
    this.setTags([...this.selectedTags, label]);
  }

  // ── Free text ─────────────────────────────────────────────────────────────
  // The dropdowns can only offer what has been seen before, so both fields keep
  // an escape hatch. A value added here is stored on the post like any other,
  // which is what puts it in the API's list for everyone else next time.

  addNewCategory(): void {
    const label = this.newCategory.trim();
    if (!label) return;
    this.categories = this.mergeOptions(this.categories, [label]);
    // Select the match from the merged list, so an existing category typed in a
    // different case selects that one rather than adding a near-duplicate.
    const chosen =
      this.categories.find((c) => c.toLowerCase() === label.toLowerCase()) ??
      label;
    this.form.get('Category')!.setValue(chosen);
    this.form.get('Category')!.markAsDirty();
    this.newCategory = '';
    this.showNewCategory = false;
  }

  addNewTag(): void {
    const label = this.newTag.trim();
    if (!label) return;
    this.tagOptions = this.mergeOptions(this.tagOptions, [label]);
    const chosen =
      this.tagOptions.find((t) => t.toLowerCase() === label.toLowerCase()) ??
      label;
    this.addTag(chosen);
    this.newTag = '';
    this.showNewTag = false;
  }

  removeTag(tag: string): void {
    this.setTags(this.selectedTags.filter((t) => t !== tag));
  }

  private setTags(tags: string[]): void {
    const control = this.form.get('Tags')!;
    control.setValue(tags);
    control.markAsDirty();
  }

  // ── Section disclosure ────────────────────────────────────────────────────

  toggleSection(section: SectionKey): void {
    this.openSections[section] = !this.openSections[section];
  }

  // A collapsed group must still admit it is holding a problem.
  sectionHasError(section: SectionKey): boolean {
    return this.sectionFields[section].some(
      (field) => this.invalid(field) || !!this.serverErrors[field.split('.')[0]]
    );
  }

  // Never let a validation message hide inside a closed group — or behind one
  // of the inline reveals, which is how an auto-generated slug could fail
  // submission with nothing on screen to show for it.
  private revealSectionsWithErrors(): void {
    (Object.keys(this.sectionFields) as SectionKey[]).forEach((section) => {
      if (this.sectionHasError(section)) this.openSections[section] = true;
    });

    if (this.form.get('Slug')!.invalid || this.serverErrors['Slug']) {
      this.showSlug = true;
    }
    // The date input only exists while the schedule box is ticked.
    if (this.form.get('PublishedAt')!.invalid) {
      this.scheduleEnabled = true;
    }
  }

  // Every invalid control, named — including the ones with no error span of
  // their own, so the summary is never a dead end.
  private invalidFieldLabels(): string[] {
    const labels: string[] = [];

    Object.keys(this.form.controls)
      .filter((key) => key !== 'Sections' && key !== 'Seo')
      .forEach((key) => {
        if (this.form.get(key)!.invalid) {
          labels.push(this.fieldLabels[key] ?? key);
        }
      });

    const seo = this.form.get('Seo') as FormGroup;
    Object.keys(seo.controls).forEach((key) => {
      if (seo.get(key)!.invalid) {
        labels.push(this.fieldLabels[`Seo.${key}`] ?? key);
      }
    });

    this.sections.controls.forEach((group, i) => {
      const controls = (group as FormGroup).controls;
      Object.keys(controls).forEach((key) => {
        if (controls[key].invalid) {
          labels.push(`Section ${i + 1} ${this.fieldLabels[key] ?? key}`);
        }
      });
    });

    return labels;
  }

  // Angular stamps `.ng-invalid` on the control itself, so the first one in
  // document order is the first problem the admin should see. Waits a tick for
  // the reveals opened above to render.
  private scrollToFirstError(): void {
    setTimeout(() => {
      const el = document.querySelector(
        '.blog-form .ng-invalid:not(form):not([formGroupName]):not([formArrayName])'
      );
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // One-line summaries so a closed group still tells you where things stand.
  get publishSummary(): string {
    const scheduled = this.form.get('PublishedAt')!.value;
    if (this.scheduleEnabled && scheduled) {
      return `Scheduled — ${new Date(scheduled).toLocaleString()}`;
    }
    const status = this.form.get('Status')!.value;
    if (status === 'published') return 'Published';
    if (status === 'archived') return 'Archived';
    return 'Draft — not visible on the site';
  }

  get seoSummary(): string {
    const seo = this.form.get('Seo')!.value ?? {};
    return seo.MetaTitle || seo.MetaDescription
      ? 'Custom title / description'
      : 'Using the post title and excerpt';
  }

  // Clearing the checkbox must clear the date too, or a stale value would be
  // sent and silently schedule the post.
  toggleSchedule(): void {
    this.scheduleEnabled = !this.scheduleEnabled;
    if (!this.scheduleEnabled) {
      this.form.get('PublishedAt')!.setValue('');
      this.form.get('PublishedAt')!.markAsDirty();
    }
  }


  private slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // The control caps at 120, so a long title has to be cut here — otherwise
    // it silently generates a slug that fails validation and the admin is left
    // fixing a field they never typed in. Trim back to a word boundary.
    if (slug.length <= 120) return slug;
    return slug.substring(0, 120).replace(/-[^-]*$/, '').replace(/-$/, '');
  }

  // <input type="date"> wants yyyy-MM-dd, matching how the offers admin form
  // feeds its date fields.
  private toDateTimeInput(iso?: string): string {
    return iso ? iso.substring(0, 10) : '';
  }
}
