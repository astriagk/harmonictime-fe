import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BarcodeService } from '@shared/services/barcode.service';

/**
 * Renders the scannable label for a product — QR (opens the full details page)
 * plus a Code128 barcode of the product id — and offers print / download.
 *
 * Accepts a product in the shape the products API returns (`_id`,
 * `ProductName`, `Price`, `Details`, `Quantity`).
 */
@Component({
  selector: 'app-product-barcode-label',
  templateUrl: './product-barcode-label.component.html',
  styleUrls: ['./product-barcode-label.component.scss'],
})
export class ProductBarcodeLabelComponent implements OnChanges {
  @Input() product: any;
  /** Hide the surrounding card chrome when the host already provides it. */
  @Input() bare = false;

  labelSrc = '';
  rendering = false;
  error = '';

  constructor(
    public barcodeService: BarcodeService,
    private toastrService: ToastrService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.render();
    }
  }

  get humanCode(): string {
    return this.barcodeService.humanCode(this.product);
  }

  get qrUrl(): string {
    return this.barcodeService.qrValue(this.product);
  }

  print(): void {
    if (!this.labelSrc) {
      return;
    }
    this.barcodeService.printLabel(
      this.labelSrc,
      this.product?.ProductName ?? 'Product label',
    );
  }

  download(): void {
    if (!this.labelSrc) {
      return;
    }
    this.barcodeService.downloadLabel(this.labelSrc, this.product);
  }

  copyLink(): void {
    navigator.clipboard?.writeText(this.qrUrl).then(
      () => this.toastrService.success('Product link copied'),
      () => this.toastrService.error('Could not copy the link'),
    );
  }

  private render(): void {
    this.labelSrc = '';
    this.error = '';
    if (!this.barcodeService.barcodeValue(this.product)) {
      return;
    }
    this.rendering = true;
    this.barcodeService
      .renderLabelPng(this.product)
      .then((src) => (this.labelSrc = src))
      .catch(() => (this.error = 'Could not generate the barcode label'))
      .finally(() => (this.rendering = false));
  }
}
