import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BANK_ACCOUNTS,
  BANK_ACCOUNT_BY_ID,
  bankAccountVerify,
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  GST_ONBOARDING,
  ORDER_CHARGES,
  SEND_MOBILE_OTP,
  TRACK_SHIPMENT,
  UPDATE_ADDRESS,
  UPDATE_USER,
  VERIFY_MOBILE_OTP,
  WITHDRAWALS,
  WITHDRAWAL_BY_ID,
} from '@config/index';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { companyDetails } from '@shared/constants/companyDetails';
import { environment } from '@env/environment';
import { CartService } from '@shared/services/cart.service';
import { GenericService } from '@shared/services/generic.service';
import { UserService } from '@shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { loadOrders } from 'src/app/store/actions/orders.actions';
import { loadUser } from 'src/app/store/actions/user.actions';
import { loadAddresses as loadAddressesAction } from 'src/app/store/actions/addresses.actions';
import { loadWallet as loadWalletAction } from 'src/app/store/actions/wallet.actions';
import { loadWalletItems as loadWalletItemsAction } from 'src/app/store/actions/wallet-items.actions';
import { loadWithdrawals as loadWithdrawalsAction } from 'src/app/store/actions/withdrawals.actions';
import { loadBankAccounts as loadBankAccountsAction } from 'src/app/store/actions/bank-accounts.actions';
import { loadGst } from 'src/app/store/actions/gst.actions';
import { Order } from 'src/app/store/models/orders.models';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';
import {
  selectOrders,
  selectOrdersLoading,
} from 'src/app/store/selectors/orders.selectors';
import {
  selectUserData,
  selectUserLoading,
} from 'src/app/store/selectors/user.selectors';
import {
  selectAddresses,
  selectAddressesLoading,
} from 'src/app/store/selectors/addresses.selectors';
import {
  selectWallet,
  selectWalletLoading,
} from 'src/app/store/selectors/wallet.selectors';
import {
  selectWalletItems,
  selectWalletItemsLoading,
} from 'src/app/store/selectors/wallet-items.selectors';
import {
  selectWithdrawals,
  selectWithdrawalsLoading,
} from 'src/app/store/selectors/withdrawals.selectors';
import {
  selectBankAccounts,
  selectBankAccountsLoading,
} from 'src/app/store/selectors/bank-accounts.selectors';
import {
  selectGstData,
  selectGstLoading,
} from 'src/app/store/selectors/gst.selectors';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public userData: any = {};
  public mail = `mailt:${companyDetails.email}`;
  public cartItems: any = [];
  public orders: Order[] = [];
  public ordersLoading = false; // Drives the orders-tab skeleton
  public profileLoading = false; // Drives the profile-info skeleton

  // --- Seller wallet / settlement (spec/WalletSettlementAPI.md) --------------
  // Seller identity comes from the JWT, so these endpoints need no userId and
  // use the token-bearing GenericService methods.
  public wallet: any = null; // GET /wallet summary (balances + counts)
  public walletLoading = false;
  // Wallet sub-tab: 'items' (sold items) | 'payouts' (payout history).
  public walletTab: 'items' | 'payouts' = 'items';

  // Itemized sold products behind the balances. The active filter maps 1:1 to
  // the wallet/items ?status= values; '' = all.
  public walletItems: any[] = [];
  public walletItemsLoading = false;
  public walletItemStatus = '';
  public readonly walletItemFilters = [
    { label: 'All', value: '' },
    { label: 'Available', value: 'available' },
    { label: 'Pending', value: 'pending' },
    { label: 'Requested', value: 'requested' },
    { label: 'Settled', value: 'settled' },
  ];

  // Payout history (GET /withdrawals).
  public withdrawals: any[] = [];
  public withdrawalsLoading = false;
  public cancellingId: string | null = null;

  // Withdraw modal — pick a bank account to send all available funds to.
  public isWithdrawModalOpen = false;
  public selectedBankAccountId: string | null = null;
  public requestingWithdrawal = false;

  // Saved addresses loaded from /address/user/:userId.
  public addresses: any[] = [];
  public addressesLoading = false;
  private loadedUserId: string | null = null; // guards repeat loads

  // Address add/edit modal (manual modal pattern, see invoice modal below).
  public isAddressModalOpen = false;
  public editingAddress: any = null; // null = add, populated = edit
  public savingAddress = false;
  public deletingAddressId: string | null = null;

  // Bank accounts (payout destinations) loaded from GET /bank-accounts.
  public bankAccounts: any[] = [];
  public bankAccountsLoading = false;

  // Bank account add/edit modal (manual modal pattern, see address modal).
  public isBankModalOpen = false;
  public editingBankAccount: any = null; // null = add, populated = edit
  public savingBankAccount = false;
  public deletingBankId: string | null = null;

  // GST details (business accounts only).
  public gstDetails: any = null;
  public gstLoading = false;
  public isGstModalOpen = false;
  public savingGst = false;

  // Generic confirmation modal — set pendingAction to the fn to run on confirm.
  public confirmModalOpen = false;
  public confirmModalMessage = '';
  private pendingAction: (() => void) | null = null;

  // Bank account verification (Razorpay penny-drop).
  public verifyConfirmAccount: any = null; // non-null = confirm dialog is open
  public verifyingId: string | null = null;
  // Per-account cooldown counters (seconds remaining after a failed attempt).
  public verifyRetryCountdown: Record<string, number> = {};

  // Company info shown in the invoice header
  public readonly company = companyDetails;
  public readonly companyLogoUrl = environment.companyLogoUrl;
  // Logo embedded as a base64 data URL for the invoice. The configured logo is
  // a cross-origin S3 URL, which html2canvas drops from the captured PDF, so we
  // preload a same-origin asset and inline it instead.
  public companyLogoDataUrl: string | null = null;

  // Profile picture upload
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  public avatarUploading = false;

  // Edit profile modal (phone only)
  public isProfileModalOpen = false;
  public profilePhone = '';
  public savingProfile = false;

  // Mobile OTP verification
  public isOtpModalOpen = false;
  public otpPhone = '';
  public otpValue = '';
  public sendingOtp = false;
  public verifyingOtp = false;
  public otpSent = false;
  public otpError = '';
  public resendCooldown = 0;
  private resendTimer: any = null;

  // Invoice modal state — manual modal pattern (see seller/orders).
  @ViewChild('invoiceContent') invoiceContent!: ElementRef<HTMLElement>;
  public isInvoiceModalOpen = false;
  public selectedOrder: Order | null = null;
  public isDownloading = false;
  // True while rendering the invoice off-screen for a direct (mobile) download,
  // so the modal/backdrop stay hidden but the DOM is still captured.
  public isCapturing = false;
  // Tracks which order is currently being downloaded on mobile (by _id).
  public downloadingOrderId: string | null = null;

  // Package tracking modal
  public isTrackingModalOpen = false;
  public trackingLoading = false;
  public trackingData: { CurrentStatus: string; Events: any[] } | null = null;

  constructor(
    public cartService: CartService,
    private store: Store,
    private toastrService: ToastrService,
    private genericService: GenericService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  // --- Address book ----------------------------------------------------------

  // Load the user's saved addresses via the addresses NgRx slice. `force`
  // bypasses the loaded-cache guard (used after add/edit/delete).
  loadAddresses(userId: string, force = false): void {
    if (!userId) {
      return;
    }
    this.store.dispatch(loadAddressesAction({ userId, force }));
  }

  openAddAddress(): void {
    this.editingAddress = null;
    this.isAddressModalOpen = true;
  }

  openEditAddress(address: any): void {
    this.editingAddress = address;
    this.isAddressModalOpen = true;
  }

  closeAddressModal(): void {
    this.isAddressModalOpen = false;
    this.editingAddress = null;
    this.savingAddress = false;
  }

  // Save handler for the shared address form. Creates (POST /address) or
  // updates (PUT /address/:id) using the same payload shape, then refreshes
  // the list.
  async onAddressSave(payload: any): Promise<void> {
    const userId = this.userData?._id;
    if (!userId) {
      return;
    }
    this.savingAddress = true;
    const editingId = this.editingAddress?._id;
    try {
      if (editingId) {
        await firstValueFrom(
          this.genericService.putObservable(
            `${UPDATE_ADDRESS}${editingId}`,
            payload,
          ),
        );
        this.toastrService.success('Address updated');
      } else {
        await firstValueFrom(
          this.genericService.postObservable(CREATE_ADDRESS, {
            ...payload,
            UserID: userId,
          }),
        );
        this.toastrService.success('Address added');
      }
      // The address API (unlike bank accounts) doesn't clear the previous
      // default server-side, so do it here to avoid multiple defaults.
      if (payload.IsDefault) {
        await this.clearOtherDefaultAddresses(editingId);
      }
      this.closeAddressModal();
      this.loadAddresses(userId, true);
    } catch (error) {
      console.error('Error saving address:', error);
      this.toastrService.error('Failed to save address. Please try again.');
      this.savingAddress = false;
    }
  }

  // --- Wallet ----------------------------------------------------------------

  // Wallet summary (balances + per-bucket counts). Recomputed live server-side.
  // `force` bypasses the loaded-cache guard (used after withdrawal mutations).
  loadWallet(force = false): void {
    this.store.dispatch(loadWalletAction({ force }));
  }

  // Itemized sold products, optionally filtered by status (''=all). The effect
  // re-fetches on a status change; `force` is used after withdrawal mutations.
  loadWalletItems(status: string = this.walletItemStatus, force = false): void {
    this.walletItemStatus = status;
    this.store.dispatch(loadWalletItemsAction({ status, force }));
  }

  // Seller payout history. `force` bypasses the loaded-cache guard.
  loadWithdrawals(force = false): void {
    this.store.dispatch(loadWithdrawalsAction({ force }));
  }

  // True when there are funds to withdraw (drives the Withdraw button).
  get canWithdraw(): boolean {
    return (this.wallet?.availableBalance ?? 0) > 0;
  }

  openWithdraw(): void {
    if (!this.canWithdraw) {
      return;
    }
    // Only verified accounts can receive payouts. Prefer the verified default.
    const verified = this.bankAccounts.filter((b) => b.IsVerified);
    const def = verified.find((b) => b.IsDefault) ?? verified[0];
    this.selectedBankAccountId = def?._id ?? null;
    this.isWithdrawModalOpen = true;
  }

  closeWithdraw(): void {
    this.isWithdrawModalOpen = false;
    this.requestingWithdrawal = false;
  }

  // Request a withdrawal of all available funds to the chosen bank account.
  // The amount is computed server-side — we only send the BankAccountID.
  async requestWithdrawal(): Promise<void> {
    if (!this.selectedBankAccountId || this.requestingWithdrawal) {
      return;
    }
    this.requestingWithdrawal = true;
    try {
      await firstValueFrom(
        this.genericService.postObservableToken(WITHDRAWALS, {
          BankAccountID: this.selectedBankAccountId,
        }),
      );
      this.toastrService.success('Withdrawal requested');
      this.closeWithdraw();
      // availableBalance drops to 0 and inProcessBalance rises — re-fetch.
      this.loadWallet(true);
      this.loadWalletItems(this.walletItemStatus, true);
      this.loadWithdrawals(true);
    } catch (error: any) {
      const message =
        error?.error?.message ??
        'Failed to request withdrawal. Please try again.';
      this.toastrService.error(message);
      this.requestingWithdrawal = false;
    }
  }

  // Cancel a pending withdrawal — releases the locked funds back to available.
  async cancelWithdrawal(withdrawal: any): Promise<void> {
    const id = withdrawal?._id;
    if (!id || this.cancellingId) {
      return;
    }
    this.cancellingId = id;
    try {
      await firstValueFrom(
        this.genericService.putObservableToken(
          `${WITHDRAWAL_BY_ID}${id}/cancel`,
          {},
        ),
      );
      this.toastrService.success('Withdrawal cancelled');
      this.loadWallet(true);
      this.loadWalletItems(this.walletItemStatus, true);
      this.loadWithdrawals(true);
    } catch (error: any) {
      const message =
        error?.error?.message ??
        'Failed to cancel withdrawal. Please try again.';
      this.toastrService.error(message);
    } finally {
      this.cancellingId = null;
    }
  }

  // --- Bank accounts ---------------------------------------------------------

  // `force` bypasses the loaded-cache guard (used after add/edit/delete/verify).
  loadBankAccounts(force = false): void {
    this.store.dispatch(loadBankAccountsAction({ force }));
  }

  openAddBankAccount(): void {
    this.editingBankAccount = null;
    this.isBankModalOpen = true;
  }

  openEditBankAccount(account: any): void {
    this.editingBankAccount = account;
    this.isBankModalOpen = true;
  }

  closeBankModal(): void {
    this.isBankModalOpen = false;
    this.editingBankAccount = null;
    this.savingBankAccount = false;
  }

  // Save handler for the shared bank-account form. Creates (POST) or updates
  // (PUT /bank-accounts/:id) then refreshes the list.
  async onBankAccountSave(payload: any): Promise<void> {
    this.savingBankAccount = true;
    const editingId = this.editingBankAccount?._id;
    try {
      if (editingId) {
        await firstValueFrom(
          this.genericService.putObservableToken(
            `${BANK_ACCOUNT_BY_ID}${editingId}`,
            payload,
          ),
        );
        this.toastrService.success('Bank account updated');
      } else {
        await firstValueFrom(
          this.genericService.postObservableToken(BANK_ACCOUNTS, payload),
        );
        this.toastrService.success('Bank account added');
      }
      this.closeBankModal();
      this.loadBankAccounts(true);
    } catch (error: any) {
      const message =
        error?.error?.message ??
        'Failed to save bank account. Please try again.';
      this.toastrService.error(message);
      this.savingBankAccount = false;
    }
  }

  // --- GST details -----------------------------------------------------------

  // Reuses the shared `gst` NgRx slice. `force` bypasses the loaded-cache guard.
  loadGstDetails(force = false): void {
    this.store.dispatch(loadGst({ force }));
  }

  openGstModal(): void {
    this.isGstModalOpen = true;
  }

  closeGstModal(): void {
    this.isGstModalOpen = false;
    this.savingGst = false;
  }

  async onGstSave(payload: any): Promise<void> {
    this.savingGst = true;
    try {
      if (this.gstDetails?._id) {
        await firstValueFrom(
          this.genericService.putObservableToken(`${GST_ONBOARDING}/${this.gstDetails._id}`, payload),
        );
        this.toastrService.success('GST details updated');
      } else {
        await firstValueFrom(
          this.genericService.postObservableToken(GST_ONBOARDING, payload),
        );
        this.toastrService.success('GST details submitted. Pending admin verification.');
      }
      this.closeGstModal();
      this.loadGstDetails(true);
    } catch (error: any) {
      const message = error?.error?.message ?? 'Failed to save GST details. Please try again.';
      this.toastrService.error(message);
      this.savingGst = false;
    }
  }

  openConfirm(message: string, action: () => void): void {
    this.confirmModalMessage = message;
    this.pendingAction = action;
    this.confirmModalOpen = true;
  }

  closeConfirm(): void {
    this.confirmModalOpen = false;
    this.confirmModalMessage = '';
    this.pendingAction = null;
  }

  runConfirm(): void {
    this.pendingAction?.();
    this.closeConfirm();
  }

  deleteBankAccount(account: any): void {
    this.openConfirm(
      'Remove this bank account? This action cannot be undone.',
      () => this.doDeleteBankAccount(account),
    );
  }

  private async doDeleteBankAccount(account: any): Promise<void> {
    const id = account?._id;
    if (!id || this.deletingBankId) {
      return;
    }
    this.deletingBankId = id;
    try {
      await firstValueFrom(
        this.genericService.deleteObservableToken(`${BANK_ACCOUNT_BY_ID}${id}`),
      );
      this.toastrService.success('Bank account removed');
      this.loadBankAccounts(true);
    } catch (error: any) {
      const message =
        error?.error?.message ??
        'Failed to remove bank account. Please try again.';
      this.toastrService.error(message);
    } finally {
      this.deletingBankId = null;
    }
  }

  // --- Bank account verification ---------------------------------------------

  openVerifyConfirm(bank: any): void {
    this.verifyConfirmAccount = bank;
  }

  closeVerifyConfirm(): void {
    this.verifyConfirmAccount = null;
  }

  async verifyBankAccount(bank: any): Promise<void> {
    const id = bank?._id;
    if (!id || this.verifyingId) {
      return;
    }
    this.verifyConfirmAccount = null;
    this.verifyingId = id;
    try {
      const res = await firstValueFrom(
        this.genericService.postObservableToken(bankAccountVerify(id), {}),
      );
      const data = res?.data;
      const verifiedName: string = data?.VerifiedName ?? '';
      const successMsg = verifiedName
        ? `Account verified! Bank confirmed name: ${verifiedName}`
        : 'Bank account verified successfully';
      this.toastrService.success(successMsg);

      if (
        verifiedName &&
        bank.AccountHolderName &&
        verifiedName.trim().toUpperCase() !==
          bank.AccountHolderName.trim().toUpperCase()
      ) {
        this.toastrService.warning(
          `The bank-registered name (${verifiedName}) is different from what you entered. Please ensure this is correct.`,
          '',
          { timeOut: 8000 },
        );
      }

      // Refresh from the server so the verified status/name come from the
      // source of truth (the slice owns the bank-accounts list now).
      this.loadBankAccounts(true);
    } catch (error: any) {
      const message =
        error?.error?.message ??
        'Bank account verification failed. Please check your account number and IFSC code.';
      this.toastrService.error(message);
      this.startVerifyCountdown(id);
    } finally {
      this.verifyingId = null;
    }
  }

  private startVerifyCountdown(id: string): void {
    const endsAt = Date.now() + 60_000;
    localStorage.setItem(`verify_cooldown_${id}`, String(endsAt));
    this.resumeVerifyCountdown(id, endsAt);
  }

  private resumeVerifyCountdown(id: string, endsAt: number): void {
    const remaining = Math.ceil((endsAt - Date.now()) / 1000);
    if (remaining <= 0) {
      localStorage.removeItem(`verify_cooldown_${id}`);
      return;
    }
    this.verifyRetryCountdown[id] = remaining;
    const timer = setInterval(() => {
      this.verifyRetryCountdown[id]--;
      if (this.verifyRetryCountdown[id] <= 0) {
        delete this.verifyRetryCountdown[id];
        localStorage.removeItem(`verify_cooldown_${id}`);
        clearInterval(timer);
      }
    }, 1000);
  }

  private restoreVerifyCountdowns(): void {
    for (const bank of this.bankAccounts) {
      const key = `verify_cooldown_${bank._id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        this.resumeVerifyCountdown(bank._id, Number(stored));
      }
    }
  }

  // Unset IsDefault on every other saved address (the one just made default is
  // excluded via skipId). Sends the full address shape the API expects so the
  // other fields aren't wiped. Failures here are non-fatal — the list reload
  // reflects the real state.
  private async clearOtherDefaultAddresses(skipId?: string): Promise<void> {
    const others = this.addresses.filter(
      (a) => a?._id && a._id !== skipId && a.IsDefault,
    );
    await Promise.all(
      others.map((a) =>
        firstValueFrom(
          this.genericService.putObservable(`${UPDATE_ADDRESS}${a._id}`, {
            FirstName: a.FirstName,
            LastName: a.LastName,
            Country: a.Country,
            AddressLine1: a.AddressLine1,
            AddressLine2: a.AddressLine2 ?? '',
            City: a.City,
            State: a.State,
            PostalCode: a.PostalCode,
            Phone: a.Phone,
            IsDefault: false,
          }),
        ),
      ),
    );
  }

  deleteAddress(address: any): void {
    this.openConfirm('Remove this address? This action cannot be undone.', () =>
      this.doDeleteAddress(address),
    );
  }

  private async doDeleteAddress(address: any): Promise<void> {
    const id = address?._id;
    const userId = this.userData?._id;
    if (!id || !userId || this.deletingAddressId) {
      return;
    }
    this.deletingAddressId = id;
    try {
      await firstValueFrom(
        this.genericService.deleteObservable(`${DELETE_ADDRESS}${id}`),
      );
      this.toastrService.success('Address removed');
      this.loadAddresses(userId, true);
    } catch (error: any) {
      const message =
        error?.error?.message ?? 'Failed to remove address. Please try again.';
      this.toastrService.error(message);
    } finally {
      this.deletingAddressId = null;
    }
  }

  // Client (bill-to) info for the invoice comes from the logged-in user's
  // profile (/users/profile). Prefer the default address, else the first one.
  get clientAddress(): any {
    const addresses = this.userData?.addresses ?? [];
    return addresses.find((a: any) => a?.IsDefault) ?? addresses[0] ?? null;
  }

  // Display name for the profile/header. Buyers register with only an email, so
  // the name often lives on their default address rather than the user record —
  // fall back to it (and tolerate either casing the profile API might use).
  get displayName(): string {
    const u = this.userData;
    const addr = this.clientAddress;
    return (
      u?.name ||
      u?.Name ||
      [u?.firstName ?? u?.FirstName, u?.lastName ?? u?.LastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      [addr?.FirstName, addr?.LastName].filter(Boolean).join(' ').trim() ||
      ''
    );
  }

  // Phone for the profile, with the same user-record-then-address fallback.
  get displayPhone(): string {
    const u = this.userData;
    return u?.phone || u?.Phone || this.clientAddress?.Phone || '';
  }

  // isPhoneVerified may arrive as boolean true or string "true"/"false"
  get phoneVerified(): boolean {
    const v = this.userData?.isPhoneVerified;
    return v === true || v === 'true';
  }

  // Preload the same-origin brand logo as a base64 data URL so it survives the
  // html2canvas capture used to build the invoice PDF (cross-origin images are
  // dropped). Failure is non-fatal — the invoice falls back to the brand name.
  private async preloadInvoiceLogo(): Promise<void> {
    try {
      const response = await fetch('assets/logo/logo.png');
      const blob = await response.blob();
      this.companyLogoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      this.companyLogoDataUrl = null;
    }
  }

  // GST applied on the platform charges.
  get gstPercent(): number {
    return ORDER_CHARGES.gstPercent;
  }

  // GST is only added on top for items where the price is NOT inclusive of tax,
  // matching how computeCheckoutSummary builds TotalAmount at checkout.
  get gstAmount(): number {
    if (!this.selectedOrder) return 0;
    const taxableSubtotal = (this.selectedOrder.Products ?? []).reduce(
      (sum, p) =>
        p.IsPriceInclusiveOfTax
          ? sum
          : sum + (p.DisplayPrice ?? 0) * (p.Quantity ?? 1),
      0,
    );
    return taxableSubtotal > 0
      ? Math.round((taxableSubtotal * ORDER_CHARGES.gstPercent) / 100)
      : 0;
  }

  // Subtotal = sum of (DisplayPrice × Quantity) across all items.
  get invoiceSubtotal(): number {
    return (this.selectedOrder?.Products ?? []).reduce(
      (sum, p) => sum + (p.DisplayPrice ?? 0) * (p.Quantity ?? 1),
      0,
    );
  }


  // Grand total is exactly what the buyer paid — use TotalAmount as the source of truth.
  get invoiceTotal(): number {
    return this.selectedOrder?.TotalAmount ?? 0;
  }

  // Returns a single buyer-facing label summarising all seller confirmations:
  // "Approved" only when every seller approved; "Unavailable" if any unavailable;
  // "Pending" otherwise. Returns null for orders with no confirmation data.
  sellerStatusSummary(order: Order): 'Approved' | 'Unavailable' | 'Pending' | null {
    const confirmations = order.SellerConfirmations;
    if (!confirmations?.length) return null;
    if (confirmations.some((c) => c.Status === 'Unavailable')) return 'Unavailable';
    if (confirmations.every((c) => c.Status === 'Approved')) return 'Approved';
    return 'Pending';
  }

  // Collects unavailability reasons (non-blank) from all sellers in an order.
  sellerRejectionReasons(order: Order): string[] {
    return (order.SellerConfirmations ?? [])
      .filter((c) => c.Status === 'Unavailable' && c.Reason)
      .map((c) => c.Reason!);
  }

  viewInvoice(order: Order): void {
    this.selectedOrder = order;
    this.isInvoiceModalOpen = true;
  }

  closeInvoice(): void {
    this.isInvoiceModalOpen = false;
    this.selectedOrder = null;
    this.isDownloading = false;
  }

  // Render the invoice DOM to an image and fit it onto an A4 PDF page.
  // jsPDF/html2canvas are imported dynamically to keep them out of the
  // main bundle.
  async downloadInvoice(): Promise<void> {
    const element = this.invoiceContent?.nativeElement;
    if (!element || !this.selectedOrder) {
      return;
    }

    this.isDownloading = true;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      // Scale the captured image to the usable page width, preserving aspect.
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      const renderHeight = Math.min(imgHeight, pageHeight - margin * 2);

      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, renderHeight);
      pdf.save(`invoice-${this.selectedOrder.OrderID || this.selectedOrder._id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      this.toastrService.error('Failed to download invoice. Please try again.');
    } finally {
      this.isDownloading = false;
    }
  }

  // Mobile: skip the modal and download the invoice directly. The invoice is
  // rendered off-screen (isCapturing) just long enough for html2canvas to
  // capture it, then torn down.
  async downloadInvoiceDirect(order: Order): Promise<void> {
    if (this.isDownloading) {
      return;
    }
    this.selectedOrder = order;
    this.downloadingOrderId = order._id;
    this.isCapturing = true;
    // Wait a frame so Angular renders the off-screen invoice and the
    // @ViewChild reference resolves before we capture it.
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      await this.downloadInvoice();
    } finally {
      this.isCapturing = false;
      this.downloadingOrderId = null;
      if (!this.isInvoiceModalOpen) {
        this.selectedOrder = null;
      }
    }
  }

  triggerAvatarUpload(): void {
    this.avatarInput?.nativeElement.click();
  }

  onAvatarFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const userId = this.userData?._id;
    if (!file || !userId || this.avatarUploading) return;

    this.avatarUploading = true;
    this.userService.uploadAndSaveAvatar(userId, file).subscribe({
      next: (url: string) => {
        this.userData = { ...this.userData, profilePicUrl: url };
        this.avatarUploading = false;
        this.cdr.markForCheck();
        this.toastrService.success('Profile picture updated');
        this.avatarInput.nativeElement.value = '';
      },
      error: (err) => {
        this.avatarUploading = false;
        const raw = err?.error?.data ?? err?.error?.message ?? '';
        const msg = raw.toLowerCase().includes('too large')
          ? 'Image is too large. Please upload a smaller file.'
          : raw || 'Failed to update profile picture';
        this.toastrService.error(msg);
        this.avatarInput.nativeElement.value = '';
      },
    });
  }

  // --- Seller review modal ---------------------------------------------------

  public reviewingOrderProducts: any[] = [];
  public isReviewModalOpen = false;

  openReviewModal(order: any): void {
    this.reviewingOrderProducts = order.Products ?? [];
    this.isReviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.reviewingOrderProducts = [];
    this.isReviewModalOpen = false;
  }

  onUserReviewSubmitted(): void {
    this.closeReviewModal();
  }

  // --- Package tracking -------------------------------------------------------

  openTracking(shipmentId: string): void {
    this.isTrackingModalOpen = true;
    this.trackingData = null;
    this.trackingLoading = true;
    this.genericService.getObservable(TRACK_SHIPMENT(shipmentId)).subscribe({
      next: (res) => {
        this.trackingData = res?.data ?? res;
        this.trackingLoading = false;
      },
      error: () => {
        this.trackingLoading = false;
        this.toastrService.error('Could not fetch tracking info.');
      },
    });
  }

  closeTracking(): void {
    this.isTrackingModalOpen = false;
    this.trackingData = null;
  }

  // --- Edit profile (email / phone) ------------------------------------------

  openProfileModal(): void {
    this.profilePhone = this.userData?.phone ?? '';
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
    this.savingProfile = false;
  }

  saveProfile(): void {
    const userId = this.userData?._id;
    if (!userId) return;

    const payload: any = {};
    if (this.profilePhone.trim()) payload.phone = this.profilePhone.trim();
    if (!Object.keys(payload).length) {
      this.closeProfileModal();
      return;
    }

    this.savingProfile = true;
    this.genericService.putObservableToken(UPDATE_USER(userId), payload).subscribe({
      next: () => {
        this.store.dispatch(loadUser({ skipNavigation: true }));
        this.toastrService.success('Profile updated');
        this.closeProfileModal();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.savingProfile = false;
        this.toastrService.error(err?.error?.message ?? 'Failed to update profile');
      },
    });
  }

  openOtpModal(): void {
    const raw = this.displayPhone.replace(/\D/g, '');
    this.otpPhone = raw.startsWith('91') ? raw.slice(2) : raw;
    this.otpValue = '';
    this.otpSent = false;
    this.isOtpModalOpen = true;
    this.sendOtp();
  }

  closeOtpModal(): void {
    this.isOtpModalOpen = false;
    this.otpSent = false;
    this.otpValue = '';
    this.otpError = '';
    this.sendingOtp = false;
    this.verifyingOtp = false;
    this.resendCooldown = 0;
    clearInterval(this.resendTimer);
  }

  private startResendCooldown(): void {
    clearInterval(this.resendTimer);
    this.resendCooldown = 300;
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      this.cdr.markForCheck();
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  sendOtp(): void {
    if (!this.otpPhone || this.resendCooldown > 0) return;
    this.sendingOtp = true;
    this.genericService
      .postObservableToken(SEND_MOBILE_OTP, { phone: this.otpPhone, countryCode: '91' })
      .subscribe({
        next: () => {
          this.otpSent = true;
          this.sendingOtp = false;
          this.startResendCooldown();
          this.toastrService.success('OTP sent to your mobile number');
        },
        error: (err) => {
          this.sendingOtp = false;
          this.toastrService.error(err?.error?.message ?? 'Failed to send OTP');
        },
      });
  }

  verifyOtp(): void {
    if (!this.otpValue.trim()) return;
    this.otpError = '';
    this.verifyingOtp = true;
    this.genericService
      .postObservableToken(VERIFY_MOBILE_OTP, {
        phone: this.otpPhone,
        countryCode: '91',
        otp: this.otpValue.trim(),
      })
      .subscribe({
        next: () => {
          this.store.dispatch(loadUser({ skipNavigation: true }));
          this.toastrService.success('Mobile number verified successfully');
          this.closeOtpModal();
        },
        error: (err) => {
          this.verifyingOtp = false;
          this.otpError = err?.error?.message ?? 'Invalid OTP. Please try again.';
          this.cdr.markForCheck();
        },
      });
  }

  ngOnInit(): void {
    this.preloadInvoiceLogo();
    this.store
      .select(selectUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.userData = state?.user?.data;
        const userId = this.userData?._id;
        if (userId && userId !== this.loadedUserId) {
          this.loadedUserId = userId;
          this.store.dispatch(loadOrders({ userId }));
          this.loadAddresses(userId);
          // Wallet/bank/withdrawals identify the seller from the JWT, not userId.
          this.loadWallet();
          this.loadWalletItems();
          this.loadWithdrawals();
          this.loadBankAccounts();
          if (this.userData?.accountType === 'business') {
            this.loadGstDetails();
          }
        }
      });
    this.store
      .select(selectCartItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.cartItems = state?.length ? state : [];
      });
    this.store
      .select(selectOrders)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.orders = state?.length ? state : [];
      });
    this.store
      .select(selectOrdersLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.ordersLoading = loading));
    this.store
      .select(selectUserLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.profileLoading = loading));

    // --- Account data slices (addresses / wallet / bank / GST) ---------------
    this.store
      .select(selectAddresses)
      .pipe(takeUntil(this.destroy$))
      .subscribe((addresses) => (this.addresses = addresses ?? []));
    this.store
      .select(selectAddressesLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.addressesLoading = loading));

    this.store
      .select(selectWallet)
      .pipe(takeUntil(this.destroy$))
      .subscribe((wallet) => (this.wallet = wallet));
    this.store
      .select(selectWalletLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.walletLoading = loading));

    this.store
      .select(selectWalletItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => (this.walletItems = items ?? []));
    this.store
      .select(selectWalletItemsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.walletItemsLoading = loading));

    this.store
      .select(selectWithdrawals)
      .pipe(takeUntil(this.destroy$))
      .subscribe((withdrawals) => (this.withdrawals = withdrawals ?? []));
    this.store
      .select(selectWithdrawalsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.withdrawalsLoading = loading));

    this.store
      .select(selectBankAccounts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((bankAccounts) => {
        this.bankAccounts = bankAccounts ?? [];
        // Resume any per-account verification cooldowns for the loaded accounts.
        this.restoreVerifyCountdowns();
      });
    this.store
      .select(selectBankAccountsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.bankAccountsLoading = loading));

    this.store
      .select(selectGstData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.gstDetails = data));
    this.store
      .select(selectGstLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.gstLoading = loading));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
