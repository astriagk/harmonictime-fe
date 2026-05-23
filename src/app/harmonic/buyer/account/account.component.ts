import { Component, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ORDER_CHARGES, withPlatformMarkup } from '@config/index';
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

  // Company info shown in the invoice header
  public readonly company = companyDetails;
  public readonly companyLogoUrl = environment.companyLogoUrl;

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
    private toastrService: ToastrService
  ) {}

  // Client (bill-to) info for the invoice comes from the logged-in user's
  // profile (/users/profile). Prefer the default address, else the first one.
  get clientAddress(): any {
    const addresses = this.userData?.addresses ?? [];
    return addresses.find((a: any) => a?.IsDefault) ?? addresses[0] ?? null;
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
    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;
      const userId = this.userData?._id;
      if (userId) {
        this.store.dispatch(loadOrders({ userId }));
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
