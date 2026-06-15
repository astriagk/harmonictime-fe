import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import {
  GST_CREATE_WITH_DOCS,
  GST_UPDATE_WITH_DOCS,
} from 'src/app/config';
import { INDIAN_STATES } from 'src/app/shared/constants/indian-states';
import { GenericService } from 'src/app/shared/services/generic.service';
import { loadUser } from 'src/app/store/actions/user.actions';
import { loadGst } from 'src/app/store/actions/gst.actions';
import { selectGstData, selectGstLoading } from 'src/app/store/selectors/gst.selectors';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;
const MAX_DOC_SIZE = 5 * 1024 * 1024;

export type DocumentType =
  | 'GSTCertificate'
  | 'AddressProof'
  | 'PANCard'
  | 'Other';

export interface DocSlot {
  label: string;
  documentType: DocumentType;
  // from server (prefilled)
  existingUrl: string | null;
  existingKey: string | null;
  // newly selected file
  newFile: File | null;
}

@Component({
  selector: 'app-gst-onboarding',
  templateUrl: './gst-onboarding.component.html',
  styleUrls: ['./gst-onboarding.component.scss'],
})
export class GstOnboardingComponent implements OnInit, OnDestroy {
  gstForm!: FormGroup;
  formSubmitted = false;
  isSubmitting = false;
  isLoading = true;

  readonly businessTypes = [
    'Proprietorship',
    'Partnership',
    'Private Limited',
    'LLP',
    'Other',
  ];
  readonly indianStates = INDIAN_STATES;

  docSlots: DocSlot[] = [
    {
      label: 'GST Certificate',
      documentType: 'GSTCertificate',
      existingUrl: null,
      existingKey: null,
      newFile: null,
    },
    {
      label: 'PAN Card',
      documentType: 'PANCard',
      existingUrl: null,
      existingKey: null,
      newFile: null,
    },
    {
      label: 'Address Proof',
      documentType: 'AddressProof',
      existingUrl: null,
      existingKey: null,
      newFile: null,
    },
    {
      label: 'Cancelled Cheque / Bank Statement',
      documentType: 'Other',
      existingUrl: null,
      existingKey: null,
      newFile: null,
    },
  ];

  existingGstId: string | null = null;
  removedKeys: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private genericService: GenericService,
    private toastrService: ToastrService,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit() {
    this.gstForm = new FormGroup({
      GSTIN: new FormControl(null, [
        Validators.required,
        Validators.pattern(GSTIN_PATTERN),
      ]),
      LegalBusinessName: new FormControl(null, [Validators.required]),
      TradeName: new FormControl(null, [Validators.required]),
      BusinessType: new FormControl(null, [Validators.required]),
      RegisteredAddress: new FormControl(null, [Validators.required]),
      PinCode: new FormControl(null, [
        Validators.required,
        Validators.pattern(PINCODE_PATTERN),
      ]),
      State: new FormControl(null, [Validators.required]),
    });

    this.store.dispatch(loadGst({}));

    this.store.select(selectGstLoading).pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoading = loading;
    });

    this.store.select(selectGstData).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.existingGstId = data._id ?? null;
        this.gstForm.patchValue({
          GSTIN: data.GSTIN ?? null,
          LegalBusinessName: data.LegalBusinessName ?? null,
          TradeName: data.TradeName ?? null,
          BusinessType: data.BusinessType ?? null,
          RegisteredAddress: data.RegisteredAddress ?? null,
          PinCode: data.PinCode ?? null,
          State: data.State ?? null,
        });
        this.prefillDocSlots(data.Documents ?? []);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get GSTIN() {
    return this.gstForm.get('GSTIN');
  }
  get LegalBusinessName() {
    return this.gstForm.get('LegalBusinessName');
  }
  get TradeName() {
    return this.gstForm.get('TradeName');
  }
  get BusinessType() {
    return this.gstForm.get('BusinessType');
  }
  get RegisteredAddress() {
    return this.gstForm.get('RegisteredAddress');
  }
  get PinCode() {
    return this.gstForm.get('PinCode');
  }
  get State() {
    return this.gstForm.get('State');
  }

  private prefillDocSlots(
    docs: { url: string; key: string; documentType: DocumentType }[],
  ): void {
    // Map each server doc into the matching slot (first match wins for each type)
    const used = new Set<number>();
    docs.forEach((doc) => {
      const idx = this.docSlots.findIndex(
        (s, i) => s.documentType === doc.documentType && !used.has(i),
      );
      if (idx !== -1) {
        used.add(idx);
        this.docSlots[idx] = {
          ...this.docSlots[idx],
          existingUrl: doc.url,
          existingKey: doc.key,
        };
      }
    });
  }

  onDocUpload(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';
    if (file.size > MAX_DOC_SIZE) {
      this.toastrService.error(
        `${this.docSlots[index].label} must be under 5 MB.`,
      );
      return;
    }
    // If replacing an existing doc, schedule it for deletion after successful save
    const slot = this.docSlots[index];
    if (slot.existingKey && !this.removedKeys.includes(slot.existingKey)) {
      this.removedKeys.push(slot.existingKey);
    }
    this.docSlots[index] = {
      ...slot,
      newFile: file,
      existingUrl: null,
      existingKey: null,
    };
  }

  removeDoc(index: number): void {
    const slot = this.docSlots[index];
    if (slot.existingKey && !this.removedKeys.includes(slot.existingKey)) {
      this.removedKeys.push(slot.existingKey);
    }
    this.docSlots[index] = {
      ...slot,
      newFile: null,
      existingUrl: null,
      existingKey: null,
    };
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted = true;
    this.gstForm.markAllAsTouched();

    const allDocsPresent = this.docSlots.every(
      (s) => !!s.existingUrl || !!s.newFile,
    );
    if (!this.gstForm.valid || !allDocsPresent) return;

    this.isSubmitting = true;

    try {
      const v = this.gstForm.value;
      const formData = new FormData();

      // Append form fields (skip nulls)
      const fields: Record<string, string | null> = {
        GSTIN: v.GSTIN,
        LegalBusinessName: v.LegalBusinessName,
        TradeName: v.TradeName,
        BusinessType: v.BusinessType,
        RegisteredAddress: v.RegisteredAddress,
        PinCode: v.PinCode,
        State: v.State,
      };
      Object.entries(fields).forEach(([k, val]) => {
        if (val !== null && val !== '') formData.append(k, val);
      });

      // New files + their types (index-matched)
      const newSlots = this.docSlots.filter((s) => !!s.newFile);
      newSlots.forEach((s) => formData.append('documents', s.newFile!));
      if (newSlots.length) {
        formData.append(
          'documentTypes',
          JSON.stringify(newSlots.map((s) => s.documentType)),
        );
      }

      if (this.existingGstId) {
        // Kept existing docs
        const keptDocs = this.docSlots
          .filter((s) => !!s.existingUrl && !!s.existingKey)
          .map((s) => ({
            url: s.existingUrl!,
            key: s.existingKey!,
            documentType: s.documentType,
          }));
        formData.append('existingDocs', JSON.stringify(keptDocs));

        // Keys of removed docs (backend deletes from S3)
        formData.append('removedDocKeys', JSON.stringify(this.removedKeys));

        await firstValueFrom(
          this.genericService.putFormDataToken(
            GST_UPDATE_WITH_DOCS(this.existingGstId),
            formData,
          ),
        );
      } else {
        await firstValueFrom(
          this.genericService.uploadFormDataToken(
            GST_CREATE_WITH_DOCS,
            formData,
          ),
        );
      }

      this.isSubmitting = false;
      this.toastrService.success(
        this.existingGstId
          ? 'GST details updated.'
          : 'GST details submitted. Pending admin verification.',
      );
      this.store.dispatch(loadUser({ skipNavigation: true }));
      this.router.navigate(['/pages/sell']);
    } catch (err: any) {
      this.isSubmitting = false;
      this.toastrService.error(
        err?.error?.message ||
          err?.message ||
          'Failed to submit GST details. Please try again.',
      );
    }
  }
}
