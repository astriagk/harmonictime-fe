import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ORDER_CHARGES, roundMoney } from '@config/index';
import { companyDetails } from '@shared/constants/companyDetails';

// A single invoice line item — mirrors the fields the real invoice pulls off
// each order Product (see buyer/account invoice modal).
interface InvoiceItem {
  productName: string;
  // Original price per unit (the MRP, before any offer).
  price: number | null;
  // Offer as a percentage off (optional). The rupee discount and the final
  // per-unit price are derived from this — see unitDiscount()/unitFinal().
  offerPercentage: number | null;
  quantity: number | null;
  // When true the row price already includes GST (no GST added on top).
  isPriceInclusiveOfTax: boolean;
}

// Internal, unlisted tool: manually key in the same values the invoice normally
// reads from the database and download an identical PDF. Reached only by URL
// (/generate-invoice) — intentionally not in any header or menu.
@Component({
  selector: 'app-generate-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.scss'],
})
export class GenerateInvoiceComponent implements OnInit {
  @ViewChild('invoiceContent') invoiceContent!: ElementRef<HTMLElement>;

  public readonly company = companyDetails;
  public companyLogoDataUrl: string | null = null;
  public isDownloading = false;

  // --- Billed By (company) — prefilled from the app constant, editable -------
  public billedBy = {
    name: companyDetails.name,
    address: companyDetails.address,
    email: companyDetails.email,
    phone: companyDetails.phone,
  };

  // --- Billed To (client) — normally from the user's default address --------
  public billedTo = {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    email: '',
    phone: '',
  };

  // --- Invoice meta — normally CheckoutDate / PaymentStatus / OrderID -------
  public meta = {
    issuedOn: new Date().toISOString().substring(0, 10),
    paymentStatus: 'Paid',
    paymentType: 'UPI',
    invoiceNumber: '',
  };

  // --- Line items -----------------------------------------------------------
  public items: InvoiceItem[] = [this.blankItem()];

  // Payment method options for the dropdown.
  public readonly paymentTypes = [
    'UPI',
    'Card',
    'Net Banking',
    'Cash',
    'Cash on Delivery',
    'Bank Transfer',
    'Wallet',
  ];

  // Whether GST is added to this invoice at all (global toggle).
  public includeGst = true;
  // GST rate — prefilled from config, editable per invoice.
  public gstPercent = ORDER_CHARGES.gstPercent;

  // Which accordion sections are expanded. Billed By is collapsed by default
  // since it's prefilled with the company details and rarely changes.
  public openSections: Record<string, boolean> = {
    billedBy: false,
    billedTo: true,
    details: true,
    items: true,
    totals: true,
  };

  toggleSection(key: string): void {
    this.openSections[key] = !this.openSections[key];
  }

  // Grand total. In the real invoice this is the order's TotalAmount (what the
  // buyer actually paid). Leave "auto" on to compute Subtotal + GST, or turn it
  // off to type the exact figure that was charged.
  public autoTotal = true;
  public totalAmountPaidOverride: number | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.preloadInvoiceLogo();
  }

  // Format the company address for the invoice header: raise ordinal suffixes
  // (1st → 1ˢᵗ) and keep the trailing "City - pincode" segment on one line so
  // it never wraps. Address is our own trusted string, so bypassing the
  // sanitizer for the small amount of markup we inject is safe.
  get billedByAddressHtml(): SafeHtml {
    const addr = this.billedBy.address ?? '';
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Inline styles (not classes): [innerHTML] content isn't touched by the
    // component's scoped stylesheet, so class-based rules wouldn't apply.
    const lastComma = addr.lastIndexOf(',');
    let html: string;
    if (lastComma >= 0) {
      const head = esc(addr.slice(0, lastComma + 1));
      const tail = esc(addr.slice(lastComma + 1).trim());
      html = `${head} <span style="white-space:nowrap">${tail}</span>`;
    } else {
      html = esc(addr);
    }
    // Raise ordinal suffixes: 1st, 2nd, 3rd, 4th …
    html = html.replace(
      /(\d)(st|nd|rd|th)\b/gi,
      '$1<sup style="font-size:0.65em;line-height:0">$2</sup>',
    );
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private blankItem(): InvoiceItem {
    return {
      productName: '',
      price: null,
      offerPercentage: null,
      quantity: 1,
      isPriceInclusiveOfTax: false,
    };
  }

  addItem(): void {
    this.items.push(this.blankItem());
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
    if (this.items.length === 0) {
      this.items.push(this.blankItem());
    }
  }

  // Per-unit rupee discount, derived from the offer percentage.
  unitDiscount(item: InvoiceItem): number {
    const price = item.price ?? 0;
    const pct = item.offerPercentage ?? 0;
    return pct > 0 ? roundMoney((price * pct) / 100) : 0;
  }

  // Final per-unit price the buyer pays (the order's DisplayPrice) = MRP less
  // the derived discount.
  unitFinal(item: InvoiceItem): number {
    return (item.price ?? 0) - this.unitDiscount(item);
  }

  // MRP column = the original per-unit price (before offer).
  rowMrp(item: InvoiceItem): number {
    return item.price ?? 0;
  }

  // Amount column = final per-unit price × quantity.
  rowAmount(item: InvoiceItem): number {
    return this.unitFinal(item) * (item.quantity ?? 1);
  }

  // Subtotal = sum of (DisplayPrice × Quantity) across all items.
  get invoiceSubtotal(): number {
    return roundMoney(
      this.items.reduce((sum, i) => sum + this.rowAmount(i), 0),
    );
  }

  // GST is only added for rows whose price is NOT inclusive of tax — same rule
  // as computeCheckoutSummary / the account invoice.
  get gstAmount(): number {
    if (!this.includeGst) {
      return 0;
    }
    const taxableSubtotal = this.items.reduce(
      (sum, i) => (i.isPriceInclusiveOfTax ? sum : sum + this.rowAmount(i)),
      0,
    );
    return taxableSubtotal > 0
      ? roundMoney((taxableSubtotal * this.gstPercent) / 100)
      : 0;
  }

  get invoiceTotal(): number {
    return this.autoTotal
      ? roundMoney(this.invoiceSubtotal + this.gstAmount)
      : this.totalAmountPaidOverride ?? 0;
  }

  // Same PDF pipeline as the account invoice: render the DOM to a canvas and
  // fit it onto an A4 page. jsPDF/html2canvas are imported dynamically.
  async downloadInvoice(): Promise<void> {
    const element = this.invoiceContent?.nativeElement;
    if (!element) {
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
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      const renderHeight = Math.min(imgHeight, pageHeight - margin * 2);

      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, renderHeight);
      pdf.save(`invoice-${this.meta.invoiceNumber || 'manual'}.pdf`);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
    } finally {
      this.isDownloading = false;
    }
  }

  // Preload the same-origin brand logo as a base64 data URL so it survives the
  // html2canvas capture (cross-origin images are dropped). Non-fatal: falls
  // back to the brand name.
  private async preloadInvoiceLogo(): Promise<void> {
    try {
      // This internal invoice uses the name-less logo variant specifically.
      const response = await fetch('assets/logo/logo-no-name.png');
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
}
