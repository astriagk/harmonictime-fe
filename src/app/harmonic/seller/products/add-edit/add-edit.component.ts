// add-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserService } from '@shared/services/user.service';
import {
  GET_BRANDS,
  GET_CASE_MATERIALS,
  GET_CATEGORIES,
  GET_COLLECTIONS,
  GET_DELIVERY_OPTIONS,
  GET_DIAL_COLORS,
  GET_MOVEMENTS,
  GET_PRODUCT_BY_ID,
  GET_RECIPIENTS,
  GET_STRAP_MATERIALS,
  GET_WATCH_MARKERS,
  POST_PRODUCT,
  POST_PRODUCT_DESCRIPTION,
  POST_PRODUCT_DETAILS,
  POST_PRODUCT_RETURN_POLICY,
  PRODUCT,
  UPDATE_PRODUCT_DETAILS,
  POST_UPLOAD_IMAGES,
  POST_PRODUCT_IMAGES,
  UPDATE_PRODUCT_IMAGE,
  CREATE_BRAND,
  CREATE_CATEGORY,
  CREATE_COLLECTION,
  CREATE_RECIPIENT,
  CREATE_DIAL_COLOR,
  CREATE_MOVEMENT,
  CREATE_STRAP_MATERIAL,
  CREATE_CASE_MATERIAL,
  CREATE_WATCH_MARKER,
  CREATE_DELIVERY_OPTION,
} from 'src/app/config';
import { GenericService } from 'src/app/shared/services/generic.service';
import {
  Brand,
  CaseMaterial,
  Category,
  Collection,
  DeliveryOption,
  DialColor,
  Movement,
  Recipient,
  StrapMaterial,
  WatchMarker,
} from 'src/app/shared/types/product-d-t';
import { AppState } from 'src/app/store/app.state';
import { selectUserData } from 'src/app/store/selectors/user.selectors';
import { catchError, concatMap, finalize, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, of } from 'rxjs';

interface SelectOption {
  id: number;
  name: string;
}

interface UploadedImage {
  file?: File;
  url: string;
  isPrimary?: boolean;
}

interface LookupConfig {
  label: string; // e.g. 'Brand' -> modal title "Add Brand"
  url: string; // collection endpoint (CREATE_* alias)
  nameField: string; // payload + display field, e.g. 'BrandName'
  arrayKey:
    | 'brands'
    | 'categories'
    | 'collections'
    | 'recipients'
    | 'dialColors'
    | 'movements'
    | 'strapMaterials'
    | 'caseMaterials'
    | 'watchMarkers'
    | 'deliveryOptions';
  formGroup: 'basicProductInformation' | 'productInformation';
  controlName: string; // e.g. 'brandId'
  // Optional extra payload (Collection needs BrandID). Return value: null to
  // block the save and show `error` in the modal.
  extraPayload?: () => { value: Record<string, any> | null; error?: string };
}

@Component({
  selector: 'app-add-edit-product',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit {
  // Form groups
  basicProductInformation!: FormGroup;
  productInformation!: FormGroup;
  productDescription!: FormGroup;
  deliveryAndReturns!: FormGroup;
  media!: FormGroup;

  // Component state
  isLinear = true;
  isEditing = false;
  // True while an existing product is being fetched in edit mode, so the form
  // shows skeletons instead of an empty stepper.
  isLoadingProduct = false;
  productId?: string;
  uploadedImages: UploadedImage[] = [];
  // IDs of already-saved images the seller removed; sent on update so the
  // backend deletes them. New (unsaved) images just drop from the array.
  removedImageIds: string[] = [];
  errorMessage = '';

  // Dropdown options
  brands: Brand[] = [];
  categories: Category[] = [];
  collections: Collection[] = [];
  recipients: Recipient[] = [];
  dialColors: DialColor[] = [];
  waterResistant: any = [
    { id: 'Yes', name: 'Yes' },
    { id: 'No', name: 'No' },
    { id: 'Both', name: 'Both' },
  ];
  movements: Movement[] = [];
  strapMaterials: StrapMaterial[] = [];
  caseMaterials: CaseMaterial[] = [];
  watchMarkers: WatchMarker[] = [];
  deliveryOptions: DeliveryOption[] = [];

  // Image upload configuration
  readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  readonly maxImages = 5;
  readonly minImages = 2;
  currentIndex = 0;
  userData: any;

  CREATE_PRODUCT_URL = POST_PRODUCT;
  CREATE_PRODUCT_DETAILS_URL = POST_PRODUCT_DETAILS;
  CREATE_PRODUCT_DESCRIPTION_URL = POST_PRODUCT_DESCRIPTION;
  CREATE_PRODUCT_RETURN_POLICY_URL = POST_PRODUCT_RETURN_POLICY;
  POST_UPLOAD_IMAGES = POST_UPLOAD_IMAGES;
  productData: any;

  // Inline "add new lookup" modal state
  isAddLookupModalOpen = false;
  activeLookupKey: string | null = null;
  newLookupName = '';
  // Brand chosen inside the "Add Collection" modal (a collection needs a brand).
  newLookupBrandId = '';
  isSavingLookup = false;
  lookupError = '';

  // Drives the reusable "Add new" modal for every lookup dropdown.
  lookupConfigs: Record<string, LookupConfig> = {
    brand: {
      label: 'Brand',
      url: CREATE_BRAND,
      nameField: 'BrandName',
      arrayKey: 'brands',
      formGroup: 'basicProductInformation',
      controlName: 'brandId',
    },
    category: {
      label: 'Category',
      url: CREATE_CATEGORY,
      nameField: 'CategoryName',
      arrayKey: 'categories',
      formGroup: 'basicProductInformation',
      controlName: 'categoryId',
    },
    collection: {
      label: 'Collection',
      url: CREATE_COLLECTION,
      nameField: 'CollectionName',
      arrayKey: 'collections',
      formGroup: 'basicProductInformation',
      controlName: 'collectionId',
      // A collection belongs to a brand. The brand is chosen in the modal
      // (pre-filled from the form's selected brand when available).
      extraPayload: () => {
        const brandId = this.newLookupBrandId;
        return brandId
          ? { value: { BrandID: brandId } }
          : { value: null, error: 'Please select a Brand' };
      },
    },
    recipient: {
      label: 'Recipient',
      url: CREATE_RECIPIENT,
      nameField: 'RecipientName',
      arrayKey: 'recipients',
      formGroup: 'basicProductInformation',
      controlName: 'recipientId',
    },
    dialColor: {
      label: 'Dial Color',
      url: CREATE_DIAL_COLOR,
      nameField: 'DialColorName',
      arrayKey: 'dialColors',
      formGroup: 'productInformation',
      controlName: 'dialColorId',
    },
    movement: {
      label: 'Movement',
      url: CREATE_MOVEMENT,
      nameField: 'MovementName',
      arrayKey: 'movements',
      formGroup: 'productInformation',
      controlName: 'movementId',
    },
    strapMaterial: {
      label: 'Strap Material',
      url: CREATE_STRAP_MATERIAL,
      nameField: 'StrapMaterialName',
      arrayKey: 'strapMaterials',
      formGroup: 'productInformation',
      controlName: 'strapMaterialId',
    },
    caseMaterial: {
      label: 'Case Material',
      url: CREATE_CASE_MATERIAL,
      nameField: 'CaseMaterialName',
      arrayKey: 'caseMaterials',
      formGroup: 'productInformation',
      controlName: 'caseMaterialId',
    },
    watchMarker: {
      label: 'Watch Markers',
      url: CREATE_WATCH_MARKER,
      nameField: 'WatchMarkerName',
      arrayKey: 'watchMarkers',
      formGroup: 'productInformation',
      controlName: 'watchMarkersId',
    },
    deliveryOption: {
      label: 'Delivery Option',
      url: CREATE_DELIVERY_OPTION,
      nameField: 'DeliveryOptionName',
      arrayKey: 'deliveryOptions',
      formGroup: 'productInformation',
      controlName: 'deliveryOptionId',
    },
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private genericService: GenericService,
    private toastrService: ToastrService,
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.checkForEditMode();
    this.initialApiCalls();
    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;
    });
  }

  private initializeForms(): void {
    this.basicProductInformation = this.fb.group({
      productName: ['', Validators.required],
      brandId: ['', Validators.required],
      categoryId: ['', Validators.required],
      collectionId: ['', Validators.required],
      price: ['', Validators.required],
      recipientId: ['', Validators.required],
    });

    this.productInformation = this.fb.group({
      dialColorId: ['', Validators.required],
      diameter: ['', Validators.required],
      waterResistant: [''],
      movementId: ['', Validators.required],
      strapMaterialId: ['', Validators.required],
      caseMaterialId: ['', Validators.required],
      watchMarkersId: ['', Validators.required],
      manufacturerProductNumber: [''],
      guarantee: [''],
      deliveryOptionId: [''],
    });

    this.productDescription = this.fb.group({
      shortTitle: [''],
      detailedDescription: [''],
      additionalDescription: [''],
    });

    this.deliveryAndReturns = this.fb.group({
      deliveryInfo: [''],
      returnsPolicy: [''],
    });

    this.media = this.fb.group({});
  }

  private checkForEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.productId = id;
      this.loadProductData();
    }
  }

  private initialApiCalls(): void {
    // Define a type for the target properties
    type TargetKeys =
      | 'brands'
      | 'categories'
      | 'collections'
      | 'dialColors'
      | 'movements'
      | 'strapMaterials'
      | 'caseMaterials'
      | 'watchMarkers'
      | 'deliveryOptions'
      | 'recipients';

    // Define mapping of URLs to variables
    const apiMapping: { url: string; target: TargetKeys }[] = [
      { url: GET_BRANDS, target: 'brands' },
      { url: GET_CATEGORIES, target: 'categories' },
      { url: GET_COLLECTIONS, target: 'collections' },
      { url: GET_DIAL_COLORS, target: 'dialColors' },
      { url: GET_MOVEMENTS, target: 'movements' },
      { url: GET_STRAP_MATERIALS, target: 'strapMaterials' },
      { url: GET_CASE_MATERIALS, target: 'caseMaterials' },
      { url: GET_WATCH_MARKERS, target: 'watchMarkers' },
      { url: GET_DELIVERY_OPTIONS, target: 'deliveryOptions' },
      { url: GET_RECIPIENTS, target: 'recipients' },
    ];

    // Iterate over the mapping to make API calls
    apiMapping.forEach(({ url, target }) => {
      this.genericService.getObservable(url).subscribe({
        next: (response) => {
          (this[target] as any) = response?.data; // If the type is fully known, this cast might not even be necessary
        },
        error: (err) => {
          console.error(`Error fetching data for ${target}:`, err);
        },
      });
    });
  }

  private async loadProductData(): Promise<void> {
    if (!this.productId) return;
    try {
      this.isLoadingProduct = true;
      const url = GET_PRODUCT_BY_ID + `${this.productId}`;
      this.genericService.getObservable(url).subscribe({
        next: (response) => {
        const data = response?.data[0];
        this.productData = response?.data[0];
        this.basicProductInformation.setValue({
          productName: data.ProductName,
          brandId: data.Details.BrandId,
          categoryId: data.Details.CategoryId,
          collectionId: data.Details.CollectionId,
          price: data.Price,
          recipientId: data.Details.RecipientId,
        });

        this.productInformation.setValue({
          dialColorId: data.Details.DialColorId,
          diameter: data.Details.Diameter,
          waterResistant: data.Details.WaterResistant,
          movementId: data.Details.MovementId,
          strapMaterialId: data.Details.StrapMaterialId,
          caseMaterialId: data.Details.CaseMaterialId,
          watchMarkersId: data.Details.WatchMarkerId,
          manufacturerProductNumber: data.Details.ManufacturerProductNumber,
          guarantee: data.Details.Guarantee,
          deliveryOptionId: data.Details.DeliveryOptionID,
        });

        this.productDescription.setValue({
          shortTitle: data.Description.Title,
          detailedDescription: data.Description.Content,
          additionalDescription: data.Description.AdditionalDetails,
        });

        this.deliveryAndReturns.setValue({
          deliveryInfo: data.DeliveryAndReturns.DeliveryInformation,
          returnsPolicy: data.DeliveryAndReturns.ReturnsPolicy,
        });

        this.uploadedImages = data.Images.map((el: any) => {
          return { url: el.ImageURL, isPrimary: !!el.IsPrimary, ...el };
        });
        this.ensurePrimaryImage();
          this.isLoadingProduct = false;
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.isLoadingProduct = false;
        },
      });
      // Example of loading product data
      // const product = await this.productService.getProduct(this.productId);
      // this.patchFormValues(product);
    } catch (error) {
      this.isLoadingProduct = false;
      console.error('Error loading product:', error);
      // Handle error appropriately
    }
  }

  private patchFormValues(product: any): void {
    this.basicProductInformation.patchValue({
      productName: product.productName,
      brandId: product.brandId,
      categoryId: product.categoryId,
      collectionId: product.collectionId,
      price: product.price,
    });

    // Patch other form groups similarly
  }

  // Form getters for template access
  get productName() {
    return this.basicProductInformation.get('productName');
  }
  get brandId() {
    return this.basicProductInformation.get('brandId');
  }
  get categoryId() {
    return this.basicProductInformation.get('categoryId');
  }
  get collectionId() {
    return this.basicProductInformation.get('collectionId');
  }
  get price() {
    return this.basicProductInformation.get('price');
  }
  get recipientId() {
    return this.basicProductInformation.get('recipientId');
  }

  get dialColorId() {
    return this.productInformation.get('dialColorId');
  }
  get diameter() {
    return this.productInformation.get('diameter');
  }
  get movementId() {
    return this.productInformation.get('movementId');
  }
  get strapMaterialId() {
    return this.productInformation.get('strapMaterialId');
  }
  get caseMaterialId() {
    return this.productInformation.get('caseMaterialId');
  }
  get watchMarkersId() {
    return this.productInformation.get('watchMarkersId');
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);

    if (files.length + this.uploadedImages.length > this.maxImages) {
      this.errorMessage = `Maximum ${this.maxImages} images allowed`;
      return;
    }

    files.forEach((file) => {
      if (!this.allowedImageTypes.includes(file.type)) {
        this.errorMessage = `Invalid file type: ${file.name}. Please upload JPEG, PNG, or JPG files.`;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.uploadedImages.push({
            file,
            url: e.target.result as string,
          });
          // Guarantee one image is always flagged primary (defaults to first).
          this.ensurePrimaryImage();
        }
      };
      reader.readAsDataURL(file);
    });

    this.errorMessage = '';
  }

  removeImage(image: any, index: number): void {
    // Already-saved images carry an _id: defer their deletion to the update
    // call by collecting the id (sent as RemovedImageIDs). New images that were
    // never persisted just drop from the local array.
    if (image._id) {
      this.removedImageIds.push(image._id);
    }
    this.uploadedImages.splice(index, 1);
    // Removing the primary promotes the next remaining image.
    this.ensurePrimaryImage();
  }

  /** Mark a single image as the primary (the one shown first), clearing others. */
  setPrimaryImage(index: number): void {
    this.uploadedImages.forEach((img, i) => (img.isPrimary = i === index));
  }

  /**
   * Ensure exactly one image is flagged primary. If the seller hasn't chosen
   * one (e.g. after the first upload or after deleting the current primary),
   * the first image becomes primary by default.
   */
  private ensurePrimaryImage(): void {
    if (this.uploadedImages.length === 0) return;
    if (!this.uploadedImages.some((img) => img.isPrimary)) {
      this.uploadedImages[0].isPrimary = true;
    }
  }

  /**
   * Map freshly uploaded URLs (returned in the same order the files were
   * appended) onto the IsPrimary flag the seller picked for each new image.
   */
  private buildImageUrlsPayload(
    uploadedUrls: string[],
  ): { url: string; isPrimary: boolean }[] {
    const newImages = this.uploadedImages.filter((img) => img.file);
    return uploadedUrls.map((url, idx) => ({
      url,
      isPrimary: !!newImages[idx]?.isPrimary,
    }));
  }

  // Convenience accessor for the template.
  get activeLookupConfig(): LookupConfig | null {
    return this.activeLookupKey
      ? this.lookupConfigs[this.activeLookupKey]
      : null;
  }

  openAddLookup(key: string): void {
    if (!this.lookupConfigs[key]) return;
    this.activeLookupKey = key;
    this.newLookupName = '';
    // Pre-fill the modal's brand selector with the brand already chosen on the
    // form (only relevant for the Collection modal).
    this.newLookupBrandId = this.basicProductInformation.value.brandId || '';
    this.lookupError = '';
    this.isAddLookupModalOpen = true;
  }

  closeAddLookup(): void {
    this.isAddLookupModalOpen = false;
    this.activeLookupKey = null;
    this.newLookupName = '';
    this.newLookupBrandId = '';
    this.lookupError = '';
    this.isSavingLookup = false;
  }

  saveLookup(): void {
    const cfg = this.activeLookupConfig;
    if (!cfg) return;

    const name = this.newLookupName.trim();
    if (!name) {
      this.lookupError = `${cfg.label} name is required`;
      return;
    }

    // Build the request body: the name field plus any lookup-specific extras.
    const payload: Record<string, any> = { [cfg.nameField]: name };
    if (cfg.extraPayload) {
      const extra = cfg.extraPayload();
      if (!extra.value) {
        this.lookupError = extra.error ?? 'Missing required field';
        return;
      }
      Object.assign(payload, extra.value);
    }

    this.isSavingLookup = true;
    this.lookupError = '';

    this.genericService
      .postObservable(cfg.url, payload)
      .pipe(finalize(() => (this.isSavingLookup = false)))
      .subscribe({
        next: (response) => {
          const newId = response?.data?._id ?? response?.data?.insertedId;
          if (newId) {
            // Append the created item locally and auto-select it.
            (this[cfg.arrayKey] as any[]).push({
              _id: newId,
              [cfg.nameField]: name,
            });
            this.selectNewLookup(cfg, newId);
            this.toastrService.success(`${cfg.label} added successfully!`);
            this.closeAddLookup();
          } else {
            // Thin create response: re-fetch the list and match by name.
            this.refreshLookupAndSelect(cfg, name);
          }
        },
        error: (err) => {
          console.error(`Error adding ${cfg.label}:`, err);
          this.lookupError = `Could not add ${cfg.label}. Please try again.`;
          this.toastrService.error(`Could not add ${cfg.label}`);
        },
      });
  }

  private selectNewLookup(cfg: LookupConfig, id: string): void {
    const group = this[cfg.formGroup];
    group.patchValue({ [cfg.controlName]: id });
    group.get(cfg.controlName)?.markAsDirty();
  }

  private refreshLookupAndSelect(cfg: LookupConfig, name: string): void {
    this.genericService.getObservable(cfg.url).subscribe({
      next: (response) => {
        const list: any[] = response?.data ?? [];
        (this[cfg.arrayKey] as any[]) = list;
        const created = list.find((item) => item[cfg.nameField] === name);
        if (created?._id) {
          this.selectNewLookup(cfg, created._id);
        }
        this.toastrService.success(`${cfg.label} added successfully!`);
        this.closeAddLookup();
      },
      error: (err) => {
        console.error(`Error refreshing ${cfg.label} list:`, err);
        this.toastrService.error(`${cfg.label} added, but list refresh failed`);
        this.closeAddLookup();
      },
    });
  }

  isFormValid(): boolean {
    return (
      this.basicProductInformation.valid &&
      this.productInformation.valid &&
      this.productDescription.valid &&
      this.deliveryAndReturns.valid &&
      this.uploadedImages.length >= this.minImages &&
      this.uploadedImages.length <= this.maxImages
    );
  }

  public stepperNext(index: number, stepper: MatStepper) {
    let currentStepForm: any = this.basicProductInformation;
    if (index === 2) {
      currentStepForm = this.productDescription;
    }
    if (index === 3) {
      currentStepForm = this.deliveryAndReturns;
    }
    if (index === 4) {
      currentStepForm = this.media;
    }

    this.currentIndex = index;
    if (currentStepForm.invalid) {
      currentStepForm.markAllAsTouched();
      stepper.selectedIndex = index;
    }
  }

  async onSubmit(): Promise<void> {
    const userId = this.userData?._id;
    if (!userId) {
      this.errorMessage = 'Please Login to Create !';
      return;
    }
    if (!this.isFormValid()) {
      this.errorMessage =
        'Please fill in all required fields and upload at least 2 images';
      return;
    }

    const formData = new FormData();

    // Combine all form values
    const productData = {
      ...this.basicProductInformation.value,
      ...this.productInformation.value,
      ...this.productDescription.value,
      ...this.deliveryAndReturns.value,
    };

    // Append only newly added images (existing ones loaded in edit mode have no `file`)
    this.uploadedImages.forEach((image) => {
      if (image.file) {
        formData.append(`images`, image.file);
      }
    });

    try {
      // Example of submitting the form
      if (this.isEditing) {
        this.updateProduct(userId, productData, formData);
      } else {
        this.createProduct(userId, productData, formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      this.errorMessage =
        'An error occurred while saving the product. Please try again.';
    }
  }

  createProduct(userId: string, productData: any, formData: any) {
    const productPayload = {
      UserID: userId,
      ProductName: productData.productName,
      BrandID: productData.brandId,
      CollectionID: productData.collectionId,
      CategoryID: productData.categoryId,
      Price: productData.price,
      RecipientID: productData.recipientId,
    };

    // Captured from the first response so we can open the new product's details.
    let newProductId: string | undefined;

    this.genericService
      .postObservable(this.CREATE_PRODUCT_URL, productPayload) // First API call
      .pipe(
        concatMap((response) => {
          const productId = response?.data?.insertedId;
          newProductId = productId;

          // Prepare the payloads for the next calls
          const productDetailsPayload = {
            ProductID: productId,
            DialColorID: productData.dialColorId,
            Diameter: productData.diameter,
            WaterResistant: productData.waterResistant,
            MovementID: productData.movementId,
            StrapMaterialID: productData.strapMaterialId,
            CaseMaterialID: productData.caseMaterialId,
            WatchMarkersID: productData.watchMarkersId,
            ManufacturerProductNumber: productData.manufacturerProductNumber,
            Guarantee: productData.guarantee,
            DeliveryOptionID: productData.deliveryOptionId,
          };

          const productDescriptionPayload = {
            ProductID: productId,
            Title: productData.shortTitle,
            Content: productData.detailedDescription,
            AdditionalDetails: productData.additionalDescription,
          };

          const productDeliveryReturnPayload = {
            ProductID: productId,
            DeliveryInformation: productData.deliveryInfo,
            ReturnsPolicy: productData.returnsPolicy,
          };

          // IDs travel in the multipart body, not the URL
          formData.append('userID', userId);
          formData.append('productID', productId);

          // Return each subsequent postObservable as an observable chain
          return this.genericService
            .postObservableImages(this.POST_UPLOAD_IMAGES, formData)
            .pipe(
              concatMap((imageResponse) => {
                const imagesPayload = {
                  ProductID: productId,
                  ImageURLs: this.buildImageUrlsPayload(
                    imageResponse?.data?.urls ?? [],
                  ),
                };
                return this.genericService
                  .postObservable(
                    this.CREATE_PRODUCT_DETAILS_URL,
                    productDetailsPayload,
                  )
                  .pipe(
                    concatMap(() =>
                      this.genericService.postObservable(
                        this.CREATE_PRODUCT_DESCRIPTION_URL,
                        productDescriptionPayload,
                      ),
                    ),
                    concatMap(() =>
                      this.genericService.postObservable(
                        this.CREATE_PRODUCT_RETURN_POLICY_URL,
                        productDeliveryReturnPayload,
                      ),
                    ),
                    concatMap(() =>
                      this.genericService.postObservable(
                        POST_PRODUCT_IMAGES,
                        imagesPayload,
                      ),
                    ),
                  );
              }),
            );
        }),
      )
      .subscribe({
        next: (response) => {
          this.toastrService.success('Product created successfully !');
          this.resetForm();
          if (newProductId) {
            this.goToProductDetails(newProductId);
          }
        },
        error: (err) => {
          console.error('Error creating product or related details:', err);
          this.toastrService.error('Error creating product or related details');
        },
      });
  }

  // Open the seller product-details page for the given product.
  private goToProductDetails(productId: string): void {
    this.router.navigate(['/seller/product-details', productId]);
  }

  resetForm() {
    this.basicProductInformation.reset();
    this.productInformation.reset();
    this.productDescription.reset();
    this.deliveryAndReturns.reset();
    this.media.reset();
    this.uploadedImages = [];
    this.removedImageIds = [];
  }

  updateProduct(userId: string, productData: any, formData: any) {
    const productId = this.productData._id;

    const productPayload: Record<string, any> = {
      // UserID: userId,
      ProductName: productData.productName,
      BrandID: productData.brandId,
      CollectionID: productData.collectionId,
      CategoryID: productData.categoryId,
      Price: productData.price,
      RecipientID: productData.recipientId,
    };

    // Tell the backend which already-saved images to delete.
    if (this.removedImageIds.length) {
      productPayload['RemovedImageIDs'] = this.removedImageIds;
    }

    const productDetailsPayload = {
      DialColorID: productData.dialColorId,
      Diameter: productData.diameter,
      WaterResistant: productData.waterResistant,
      MovementID: productData.movementId,
      StrapMaterialID: productData.strapMaterialId,
      CaseMaterialID: productData.caseMaterialId,
      WatchMarkersID: productData.watchMarkersId,
      ManufacturerProductNumber: productData.manufacturerProductNumber,
      Guarantee: productData.guarantee,
      DeliveryOptionID: productData.deliveryOptionId,
    };

    const productDescriptionPayload = {
      Title: productData.shortTitle,
      Content: productData.detailedDescription,
      AdditionalDetails: productData.additionalDescription,
    };

    const productDeliveryReturnPayload = {
      DeliveryInformation: productData.deliveryInfo,
      ReturnsPolicy: productData.returnsPolicy,
    };

    // Only send a section if the user actually changed it. Angular sets `dirty`
    // on user edits, not on the setValue() performed while loading the product.
    const updateRequests: Observable<any>[] = [];

    // Fire the product PUT when basic info changed OR images were removed
    // (RemovedImageIDs rides along on this same payload).
    if (this.basicProductInformation.dirty || this.removedImageIds.length) {
      updateRequests.push(
        this.genericService.putObservable(`${PRODUCT}/${productId}`, productPayload),
      );
    }
    if (this.productInformation.dirty) {
      updateRequests.push(
        this.genericService.putObservable(
          `${UPDATE_PRODUCT_DETAILS}${productId}`,
          productDetailsPayload,
        ),
      );
    }
    if (this.productDescription.dirty) {
      updateRequests.push(
        this.genericService.putObservable(
          `${this.CREATE_PRODUCT_DESCRIPTION_URL}/${productId}`,
          productDescriptionPayload,
        ),
      );
    }
    if (this.deliveryAndReturns.dirty) {
      updateRequests.push(
        this.genericService.putObservable(
          `${this.CREATE_PRODUCT_RETURN_POLICY_URL}/${productId}`,
          productDeliveryReturnPayload,
        ),
      );
    }

    // Changing the primary on an already-saved image isn't a form edit, so it
    // needs an explicit PUT. Only send images whose flag actually changed
    // (e.g. the new primary and the one it replaced).
    this.uploadedImages.forEach((image: any) => {
      if (image._id && !!image.isPrimary !== !!image.IsPrimary) {
        updateRequests.push(
          this.genericService.putObservable(
            `${UPDATE_PRODUCT_IMAGE}${image._id}`,
            { IsPrimary: !!image.isPrimary },
          ),
        );
      }
    });

    // Keep each request independent so one failure can't cancel the siblings
    // (forkJoin unsubscribes/aborts the rest the moment any source errors).
    const safeRequests = updateRequests.map((request$) =>
      request$.pipe(
        catchError((err) => {
          console.error('Product update request failed:', err);
          return of(null);
        }),
      ),
    );

    const hasNewImages = this.uploadedImages.some((image) => image.file);

    // Nothing was edited and no new images were added — skip the API calls.
    if (safeRequests.length === 0 && !hasNewImages) {
      this.toastrService.info('No changes to update');
      return;
    }

    // Upload images only when the user added new ones.
    let imageUpload$: Observable<any> = of(null);
    if (hasNewImages) {
      // IDs travel in the multipart body, not the URL
      formData.append('userID', userId);
      formData.append('productID', productId);

      imageUpload$ = this.genericService
        .postObservableImages(this.POST_UPLOAD_IMAGES, formData)
        .pipe(
          switchMap((response) => {
            const imagesPayload = {
              ProductID: productId,
              ImageURLs: this.buildImageUrlsPayload(response?.data?.urls ?? []),
            };
            return this.genericService.postObservable(
              POST_PRODUCT_IMAGES,
              imagesPayload,
            );
          }),
        );
    }

    const fieldUpdates$: Observable<any> = safeRequests.length
      ? forkJoin(safeRequests)
      : of(null);

    fieldUpdates$
      .pipe(
        switchMap(() => imageUpload$),
        catchError((err) => {
          console.error('Error updating product or related details:', err);
          this.toastrService.error('Error updating product or related details');
          throw err;
        }),
      )
      .subscribe(() => {
        this.toastrService.success('Product updated successfully!');
        this.resetForm();
        this.goToProductDetails(productId);
      });
  }
}
