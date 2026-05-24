import { Component, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BANK_ACCOUNTS,
  BANK_ACCOUNT_BY_ID,
  bankAccountVerify,
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  GET_ADDRESSES_BY_USER,
  GET_WALLET,
  GET_WALLET_ITEMS,
  ORDER_CHARGES,
  UPDATE_ADDRESS,
  WITHDRAWALS,
  WITHDRAWAL_BY_ID,
  withPlatformMarkup,
} from '@config/index';
import { firstValueFrom } from 'rxjs';
import { companyDetails } from '@shared/constants/companyDetails';
import { environment } from '@env/environment';
import { CartService } from '@shared/services/cart.service';
import { GenericService } from '@shared/services/generic.service';
import { UserService } from '@shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { loadOrders } from 'src/app/store/actions/orders.actions';
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

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
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

  // Invoice modal state — manual modal pattern (see seller/orders).
  @ViewChild('invoiceContent') invoiceContent!: ElementRef<HTMLElement>;
  public isInvoiceModalOpen = false;
  public selectedOrder: Order | null = null;
  public isDownloading = false;
  // True while rendering the invoice off-screen for a direct (mobile) download,
  // so the modal/backdrop stay hidden but the DOM is still captured.
  public isCapturing = false;

  constructor(
    public cartService: CartService,
    private store: Store,
    private toastrService: ToastrService,
    private genericService: GenericService
  ) {}

  // --- Address book ----------------------------------------------------------

  // Load the user's saved addresses from /address/user/:userId.
  loadAddresses(userId: string): void {
    if (!userId) {
      return;
    }
    this.addressesLoading = true;
    this.genericService
      .getObservable(`${GET_ADDRESSES_BY_USER}${userId}`)
      .subscribe({
        next: (res) => {
          this.addresses = res?.data ?? res ?? [];
          this.addressesLoading = false;
        },
        error: () => {
          this.addresses = [];
          this.addressesLoading = false;
        },
      });
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
            payload
          )
        );
        this.toastrService.success('Address updated');
      } else {
        await firstValueFrom(
          this.genericService.postObservable(CREATE_ADDRESS, {
            ...payload,
            UserID: userId,
          })
        );
        this.toastrService.success('Address added');
      }
      // The address API (unlike bank accounts) doesn't clear the previous
      // default server-side, so do it here to avoid multiple defaults.
      if (payload.IsDefault) {
        await this.clearOtherDefaultAddresses(editingId);
      }
      this.closeAddressModal();
      this.loadAddresses(userId);
    } catch (error) {
      console.error('Error saving address:', error);
      this.toastrService.error('Failed to save address. Please try again.');
      this.savingAddress = false;
    }
  }

  // --- Wallet ----------------------------------------------------------------

  // Wallet summary (balances + per-bucket counts). Recomputed live server-side.
  loadWallet(): void {
    this.walletLoading = true;
    this.genericService.getObservableToken(GET_WALLET).subscribe({
      next: (res) => {
        this.wallet = res?.data ?? null;
        this.walletLoading = false;
      },
      error: () => {
        this.wallet = null;
        this.walletLoading = false;
      },
    });
  }

  // Itemized sold products, optionally filtered by status (''=all).
  loadWalletItems(status: string = this.walletItemStatus): void {
    this.walletItemStatus = status;
    this.walletItemsLoading = true;
    const url = status
      ? `${GET_WALLET_ITEMS}?status=${status}`
      : GET_WALLET_ITEMS;
    this.genericService.getObservableToken(url).subscribe({
      next: (res) => {
        this.walletItems = res?.data ?? [];
        this.walletItemsLoading = false;
      },
      error: () => {
        this.walletItems = [];
        this.walletItemsLoading = false;
      },
    });
  }

  // Seller payout history.
  loadWithdrawals(): void {
    this.withdrawalsLoading = true;
    this.genericService.getObservableToken(WITHDRAWALS).subscribe({
      next: (res) => {
        this.withdrawals = res?.data ?? [];
        this.withdrawalsLoading = false;
      },
      error: () => {
        this.withdrawals = [];
        this.withdrawalsLoading = false;
      },
    });
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
        })
      );
      this.toastrService.success('Withdrawal requested');
      this.closeWithdraw();
      // availableBalance drops to 0 and inProcessBalance rises — re-fetch.
      this.loadWallet();
      this.loadWalletItems();
      this.loadWithdrawals();
    } catch (error: any) {
      const message =
        error?.error?.message ?? 'Failed to request withdrawal. Please try again.';
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
          {}
        )
      );
      this.toastrService.success('Withdrawal cancelled');
      this.loadWallet();
      this.loadWalletItems();
      this.loadWithdrawals();
    } catch (error: any) {
      const message =
        error?.error?.message ?? 'Failed to cancel withdrawal. Please try again.';
      this.toastrService.error(message);
    } finally {
      this.cancellingId = null;
    }
  }

  // --- Bank accounts ---------------------------------------------------------

  loadBankAccounts(): void {
    this.bankAccountsLoading = true;
    this.genericService.getObservableToken(BANK_ACCOUNTS).subscribe({
      next: (res) => {
        this.bankAccounts = res?.data ?? [];
        this.bankAccountsLoading = false;
        this.restoreVerifyCountdowns();
      },
      error: () => {
        this.bankAccounts = [];
        this.bankAccountsLoading = false;
      },
    });
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
            payload
          )
        );
        this.toastrService.success('Bank account updated');
      } else {
        await firstValueFrom(
          this.genericService.postObservableToken(BANK_ACCOUNTS, payload)
        );
        this.toastrService.success('Bank account added');
      }
      this.closeBankModal();
      this.loadBankAccounts();
    } catch (error: any) {
      const message =
        error?.error?.message ?? 'Failed to save bank account. Please try again.';
      this.toastrService.error(message);
      this.savingBankAccount = false;
    }
  }

  async deleteBankAccount(account: any): Promise<void> {
    const id = account?._id;
    if (!id || this.deletingBankId) {
      return;
    }
    this.deletingBankId = id;
    try {
      await firstValueFrom(
        this.genericService.deleteObservableToken(`${BANK_ACCOUNT_BY_ID}${id}`)
      );
      this.toastrService.success('Bank account removed');
      this.loadBankAccounts();
    } catch (error: any) {
      const message =
        error?.error?.message ?? 'Failed to remove bank account. Please try again.';
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
        this.genericService.postObservableToken(bankAccountVerify(id), {})
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
          { timeOut: 8000 }
        );
      }

      const idx = this.bankAccounts.findIndex((b) => b._id === id);
      if (idx !== -1) {
        this.bankAccounts[idx] = {
          ...this.bankAccounts[idx],
          IsVerified: true,
          VerificationStatus: 'verified',
          VerifiedName: verifiedName,
        };
      }
    } catch (error: any) {
      const message =
        error?.error?.message ??
        'Bank account verification failed. Please check your account number and IFSC code.';
      this.toastrService.error(message);

      const idx = this.bankAccounts.findIndex((b) => b._id === id);
      if (idx !== -1) {
        this.bankAccounts[idx] = {
          ...this.bankAccounts[idx],
          VerificationStatus: 'failed',
        };
      }
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
      (a) => a?._id && a._id !== skipId && a.IsDefault
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
          })
        )
      )
    );
  }

  async deleteAddress(address: any): Promise<void> {
    const id = address?._id;
    const userId = this.userData?._id;
    if (!id || !userId || this.deletingAddressId) {
      return;
    }
    this.deletingAddressId = id;
    try {
      await firstValueFrom(
        this.genericService.deleteObservable(`${DELETE_ADDRESS}${id}`)
      );
      this.toastrService.success('Address removed');
      this.loadAddresses(userId);
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

  // Sum of the all-in (price + 2%, rounded) item prices — the same figure the
  // buyer saw at checkout. See withPlatformMarkup in @config.
  get invoiceSubtotal(): number {
    return (this.selectedOrder?.Products ?? []).reduce(
      (sum, product) => sum + withPlatformMarkup(product.Price),
      0
    );
  }

  // Flat platform charge added at checkout (ORDER_CHARGES.extraFlat). Using the
  // configured value avoids paise-level rounding artifacts that show up when
  // deriving it from the stored TotalAmount (e.g. ₹49.98 instead of ₹50).
  get platformCharges(): number {
    return this.invoiceSubtotal > 0 ? ORDER_CHARGES.extraFlat : 0;
  }

  // Invoice grand total = marked-up item subtotal + flat charge. Matches the
  // all-in figure shown to the buyer at checkout.
  get invoiceTotal(): number {
    return this.invoiceSubtotal + this.platformCharges;
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
      pdf.save(`invoice-${this.selectedOrder._id}.pdf`);
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
    this.isCapturing = true;
    // Wait a frame so Angular renders the off-screen invoice and the
    // @ViewChild reference resolves before we capture it.
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      await this.downloadInvoice();
    } finally {
      this.isCapturing = false;
      if (!this.isInvoiceModalOpen) {
        this.selectedOrder = null;
      }
    }
  }

  ngOnInit(): void {
    this.preloadInvoiceLogo();
    this.store.select(selectUserData).subscribe((state) => {
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
      }
    });
    this.store.select(selectCartItems).subscribe((state) => {
      if (state?.length) {
        this.cartItems = state;
      } else {
        this.cartItems = [];
      }
    });
    this.store.select(selectOrders).subscribe((state) => {
      if (state?.length) {
        this.orders = state;
      } else {
        this.orders = [];
      }
    });
    this.store
      .select(selectOrdersLoading)
      .subscribe((loading) => (this.ordersLoading = loading));
    this.store
      .select(selectUserLoading)
      .subscribe((loading) => (this.profileLoading = loading));
  }
}
