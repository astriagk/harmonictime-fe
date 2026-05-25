import { Component } from '@angular/core';
import { CartService } from 'src/app/shared/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { countries } from '@shared/constants/countries';
import { GenericService } from '@shared/services/generic.service';
import {
  CHECKOUT_ITEM_ORDER,
  CREATE_PAYMENT_ORDER,
  GET_ADDRESSES_BY_USER,
  GET_PRODUCT_BY_ID,
  LOGIN_USER,
  REGISTER_USER,
  UPDATE_PRODUCT,
  VERIFY_PAYMENT_ORDER,
} from '@config/index';
import { loginUser, registerUser } from 'src/app/store/actions/user.actions';
import { UserService } from '@shared/services/user.service';
import { filter, firstValueFrom, Subscription, take } from 'rxjs';
import {
  selectUserData,
  selectUserError,
} from 'src/app/store/selectors/user.selectors';
import { Store } from '@ngrx/store';
import {
  selectCartItems,
  selectCartLoading,
} from 'src/app/store/selectors/cart.selectors';
import { loadCart } from 'src/app/store/actions/cart.actions';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  public isOpenLogin = false;
  public isOpenRegister = false;
  public isOpenCoupon = false;
  public couponCode: string = '';
  public payment_name: string = '';
  public countries = countries;
  public userData: any = {};
  public cartItems: any = [];
  public isLoading = true; // Drives the checkout loading skeleton

  // Saved addresses for logged-in users — pick one to prefill the billing form.
  public savedAddresses: any[] = [];
  public selectedAddressId: string | null = null;
  private addressesLoadedFor: string | null = null; // guards repeat loads

  public placingOrder = false; // disables Place order while we verify + pay

  // Returning customer login
  public loginForm!: FormGroup;
  public loginSubmitted = false;
  public showLoginPassword = false;

  // New customer register
  public registerForm!: FormGroup;
  public registerSubmitted = false;
  public showRegisterPassword = false;
  public showRegisterConfirmPassword = false;

  private authDataSub?: Subscription;
  private authErrorSub?: Subscription;

  constructor(
    public cartService: CartService,
    private toastrService: ToastrService,
    public genericService: GenericService,
    private store: Store,
    private router: Router,
  ) {}

  handleOpenLogin() {
    this.isOpenLogin = !this.isOpenLogin;
  }
  handleOpenRegister() {
    this.isOpenRegister = !this.isOpenRegister;
  }
  handleOpenCoupon() {
    this.isOpenCoupon = !this.isOpenCoupon;
  }

  handleCouponSubmit() {
    // Add coupon code handling logic here
    if (this.couponCode) {
      // logic here

      // when submitted the from than empty will be coupon code
      this.couponCode = '';
    }
  }

  // handle payment item
  handlePayment(value: string) {
    this.payment_name = value;
  }

  public checkoutForm!: FormGroup;
  public formSubmitted = false;

  ngOnInit() {
    // Build the forms first so the store subscriptions below can safely prefill
    // them on their initial (synchronous) emission.
    this.checkoutForm = new FormGroup({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      country: new FormControl('India', Validators.required),
      address: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      apartment: new FormControl(null),
      zipCode: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
      orderNote: new FormControl(null),
      email: new FormControl(null, [Validators.required, Validators.email]),
    });

    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;
      const userId = this.userData?._id;
      if (userId && userId !== this.addressesLoadedFor) {
        this.addressesLoadedFor = userId;
        this.loadSavedAddresses(userId);
        // Default the billing email to the account email if not already set.
        if (this.userData?.email && !this.checkoutForm?.get('email')?.value) {
          this.checkoutForm?.patchValue({ email: this.userData.email });
        }
      }
    });
    this.store.select(selectCartItems).subscribe((state) => {
      if (state?.length) {
        this.cartItems = state;
      } else {
        this.cartItems = [];
      }
    });
    this.store
      .select(selectCartLoading)
      .subscribe((loading) => (this.isLoading = loading));

    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });

    this.registerForm = new FormGroup(
      {
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$',
          ),
        ]),
        confirmPassword: new FormControl(null, [Validators.required]),
      },
      { validators: this.passwordsMatchValidator },
    );

    this.loadRazorpayScript();
  }

  // Load the user's saved addresses so they can pick one to prefill billing.
  private loadSavedAddresses(userId: string) {
    this.genericService
      .getObservable(`${GET_ADDRESSES_BY_USER}${userId}`)
      .subscribe({
        next: (res: any) => {
          this.savedAddresses = res?.data ?? res ?? [];
          // Nothing is preselected — the user picks an address (or enters a new
          // one) themselves.
        },
        error: () => {
          this.savedAddresses = [];
        },
      });
  }

  // Fired when the user picks a saved address from the dropdown. '' = enter a
  // new address manually (clears the billing fields).
  onSelectSavedAddress(addressId: string | null) {
    this.selectedAddressId = addressId || null;
    if (!addressId) {
      this.checkoutForm.reset({ country: 'India', email: this.userData?.email ?? null });
      return;
    }
    const addr = this.savedAddresses.find((a) => a._id === addressId);
    if (addr) {
      this.applyAddressToForm(addr);
    }
  }

  // Map a saved address onto the billing form. Email isn't part of an address,
  // so it's preserved (defaults to the account email).
  private applyAddressToForm(addr: any) {
    this.checkoutForm.patchValue({
      firstName: addr.FirstName ?? '',
      lastName: addr.LastName ?? '',
      country: addr.Country ?? 'India',
      address: addr.AddressLine1 ?? '',
      apartment: addr.AddressLine2 ?? '',
      city: addr.City ?? '',
      state: addr.State ?? '',
      zipCode: addr.PostalCode ?? '',
      phone: addr.Phone ?? '',
      email: this.checkoutForm.get('email')?.value || this.userData?.email || '',
    });
  }

  // Verify every cart product is still purchasable before taking payment.
  // Returns the names of any products that are no longer available. A product
  // is treated as unavailable only when the API explicitly says IsAvailable is
  // false; transient fetch errors are ignored so a network blip can't block an
  // otherwise valid checkout.
  private async getUnavailableProducts(): Promise<string[]> {
    const checks = (this.cartItems as any[]).map(async (item) => {
      const productId = item?.ProductID ?? item?._id;
      try {
        const res: any = await firstValueFrom(
          this.genericService.getObservable(`${GET_PRODUCT_BY_ID}${productId}`),
        );
        const product = res?.data ?? res;
        return product?.IsAvailable === false
          ? item?.ProductName ?? 'A product'
          : null;
      } catch {
        return null;
      }
    });
    const results = await Promise.all(checks);
    return results.filter((name): name is string => !!name);
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  // Returning customer login form getters
  get loginEmail() {
    return this.loginForm.get('email');
  }
  get loginPassword() {
    return this.loginForm.get('password');
  }

  // New customer register form getters
  get registerEmail() {
    return this.registerForm.get('email');
  }
  get registerPassword() {
    return this.registerForm.get('password');
  }
  get registerConfirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showRegisterPassword = !this.showRegisterPassword;
    } else {
      this.showRegisterConfirmPassword = !this.showRegisterConfirmPassword;
    }
  }

  // Login using the same endpoint/action as the login page,
  // but stay on checkout so the user can continue ordering.
  onLogin() {
    this.loginSubmitted = true;
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      const payload = {
        email: formValue.email,
        password: formValue.password,
      };
      // Drop any subscriptions from a previous submit so toasts don't stack
      this.authDataSub?.unsubscribe();
      this.authErrorSub?.unsubscribe();

      this.store.dispatch(loginUser({ url: LOGIN_USER, payload }));

      this.authErrorSub = this.store
        .select(selectUserError)
        .pipe(
          filter((error: any) => !!error),
          take(1),
        )
        .subscribe(() => {
          this.toastrService.error('Please check email and password !');
        });

      this.authDataSub = this.store
        .select(selectUserData)
        .pipe(
          filter((state: any) => !!state?.data?.token),
          take(1),
        )
        .subscribe((state: any) => {
          localStorage.setItem('token', JSON.stringify(state?.data?.token));
          this.toastrService.success('Login successful !');
          this.loginForm.reset();
          this.loginSubmitted = false;
          this.isOpenLogin = false;
        });
    }
  }

  // Register using the same endpoint/action as the register page,
  // but stay on checkout so the user can continue ordering.
  onRegister() {
    this.registerSubmitted = true;
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const payload = {
        email: formValue.email,
        password: formValue.password,
      };
      // Drop any subscription from a previous submit so toasts don't stack
      this.authDataSub?.unsubscribe();
      this.store.dispatch(registerUser({ url: REGISTER_USER, payload }));
      this.authDataSub = this.store
        .select(selectUserData)
        .pipe(
          filter((state: any) => !!state?.data?.token),
          take(1),
        )
        .subscribe((state: any) => {
          localStorage.setItem('token', JSON.stringify(state?.data?.token));
          this.toastrService.success('Registration successful!');
          this.registerForm.reset();
          this.registerSubmitted = false;
          this.isOpenRegister = false;
        });
    } else if (this.registerForm.hasError('passwordsMismatch')) {
      this.toastrService.error('Passwords do not match.');
    }
  }

  loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.id = 'razorpay-script';
      script.onload = () => resolve(true);
      script.onerror = () => reject(false);

      document.body.appendChild(script);
    });
  }

  async onSubmit() {
    this.formSubmitted = true;
    if (!this.checkoutForm.valid || this.placingOrder) {
      return;
    }

    this.placingOrder = true;
    try {
      // Don't take payment for items that are no longer available.
      const unavailable = await this.getUnavailableProducts();
      if (unavailable.length) {
        this.toastrService.error(
          `${unavailable.join(', ')} ${
            unavailable.length > 1 ? 'are' : 'is'
          } no longer available. Please remove ${
            unavailable.length > 1 ? 'them' : 'it'
          } from your cart.`,
        );
        return;
      }
      await this.payNow();
    } finally {
      this.placingOrder = false;
    }
  }

  get firstName() {
    return this.checkoutForm.get('firstName');
  }
  get lastName() {
    return this.checkoutForm.get('lastName');
  }
  get company() {
    return this.checkoutForm.get('company');
  }
  get country() {
    return this.checkoutForm.get('country');
  }
  get address() {
    return this.checkoutForm.get('address');
  }
  get city() {
    return this.checkoutForm.get('city');
  }
  get state() {
    return this.checkoutForm.get('state');
  }
  get apartment() {
    return this.checkoutForm.get('apartment');
  }
  get zipCode() {
    return this.checkoutForm.get('zipCode');
  }
  get phone() {
    return this.checkoutForm.get('phone');
  }
  get orderNote() {
    return this.checkoutForm.get('orderNote');
  }
  get email() {
    return this.checkoutForm.get('email');
  }

  async payNow() {
    await this.loadRazorpayScript();

    const formValue = this.checkoutForm.value;
    const grandTotal = this.cartService.computeCheckoutSummary(
      this.cartItems,
    ).grandTotal;
    const amount = grandTotal * 100; // Razorpay expects the amount in paise

    try {
      const cartItems = this.cartItems.map((el: any) => el.ProductID);

      // Consolidated flow: send the address and checkout data nested inside
      // create-order. The backend only holds these as a draft against a pending
      // Payment and persists Address/Checkout when /verify succeeds, so nothing
      // is written for abandoned or failed payments.
      const order: any = await firstValueFrom(
        this.genericService.postObservable(CREATE_PAYMENT_ORDER, {
          UserID: this.userData._id,
          amount,
          currency: 'INR',
          address: {
            FirstName: formValue.firstName,
            LastName: formValue.lastName,
            Country: formValue.country,
            AddressLine1: formValue.address,
            AddressLine2: '',
            City: formValue.city,
            State: formValue.state,
            PostalCode: formValue.zipCode,
            Phone: formValue.phone,
            orderNotes: formValue.orderNote,
            IsDefault: false,
          },
          checkout: {
            ProductIDs: cartItems,
            TotalAmount: grandTotal,
            DeliveryStatus: 'Pending',
            CheckoutDate: new Date(),
          },
        }),
      );
      console.log('Payment order created:', order?.data);

      // Use the key_id the backend returns so the checkout key can't drift from
      // the account/mode the order was created in. Check both the envelope and
      // the data payload, then fall back to the known test key.
      const keyId =
        order?.key_id ?? order?.data?.key_id ?? environment.razorpayKeyId;

      this.initiateRazorpay(order.data, formValue, cartItems, keyId);
    } catch (error) {
      console.error('Error creating payment order:', error);
      this.toastrService.error('Payment initialization failed!');
    }
  }

  private initiateRazorpay(
    orderRes: any,
    formValue: any,
    cartItems: any[],
    keyId: string,
  ) {
    const options = {
      key: keyId,
      amount: orderRes.amount,
      currency: orderRes.currency,
      name: 'Your Company',
      description: 'Test Transaction',
      image: 'https://your-logo-url.com',
      order_id: orderRes.id,
      handler: async (handlerResponse: any) => {
        try {
          // /verify creates Address -> Checkout -> Payment on a valid signature
          // and returns the created CheckoutID for the post-payment steps.
          const verifyResponse = await this.verifyPayment(handlerResponse);
          const checkoutId = verifyResponse?.data?.CheckoutID;
          if (verifyResponse && checkoutId) {
            await this.finalizeCheckout(orderRes, checkoutId, cartItems);
          } else {
            this.toastrService.error('Payment Verification Failed!');
          }
        } catch (error) {
          console.error('Payment Verification Error:', error);
          this.toastrService.error('Payment Verification Failed!');
        }
      },
      prefill: {
        name: formValue.firstName,
        email: formValue.email,
        contact: formValue.phone,
      },
      theme: { color: '#3399cc' },
      // Fired when the user closes the checkout without paying. The handler
      // above only runs on a successful payment. With the consolidated flow the
      // backend writes nothing until /verify, so a cancel leaves no Address or
      // Checkout rows behind.
      modal: {
        ondismiss: () => {
          this.toastrService.info('Payment cancelled.');
        },
      },
    };

    const razorpayInstance = new (window as any).Razorpay(options);

    // Razorpay reports a declined/failed payment via this event rather than the
    // success handler, so finalizeCheckout never runs for these either.
    razorpayInstance.on('payment.failed', (response: any) => {
      console.error('Razorpay payment failed:', response?.error);
      this.toastrService.error('Payment Failed!');
    });

    razorpayInstance.open();
  }

  private async verifyPayment(handlerResponse: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.genericService.postObservable(
          VERIFY_PAYMENT_ORDER,
          handlerResponse,
        ),
      );
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  private async finalizeCheckout(
    orderRes: any,
    checkoutId: string,
    cartItems: any[],
  ) {
    try {
      const checkoutItemOrder = {
        CheckoutID: checkoutId,
        ProductIDs: cartItems,
        Price: orderRes.amount,
      };

      await firstValueFrom(
        this.genericService.postObservable(
          CHECKOUT_ITEM_ORDER,
          checkoutItemOrder,
        ),
      );

      const updateProducts = {
        ProductIDs: cartItems,
      };

      const updateProductsRes = await firstValueFrom(
        this.genericService.putObservable(UPDATE_PRODUCT, updateProducts),
      );

      if (updateProductsRes) {
        this.router.navigate(['/buyer/products']);
        await this.store.dispatch(loadCart());
        await this.toastrService.success(
          'Payment and Checkout Completed Successfully!',
        );
      }
    } catch (error) {
      console.error('Error in checkout process:', error);
      this.toastrService.error('Checkout Failed!');
    }
  }
}
