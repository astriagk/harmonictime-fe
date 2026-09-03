import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import type {
  BrowserMultiFormatReader,
  IScannerControls,
} from '@zxing/browser';
import { GET_PRODUCT_BY_ID } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { BarcodeService } from '@shared/services/barcode.service';

/**
 * Scans a product label and shows everything recorded against that product.
 *
 * Two ways in, both landing on the same lookup:
 *   - the device camera (reads the QR and the Code128 on the label);
 *   - the code box, which also catches keyboard-wedge scanners since they
 *     type the code and press Enter.
 */
@Component({
  selector: 'app-scan-product',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
})
export class ScanComponent implements OnDestroy {
  @ViewChild('preview') previewRef?: ElementRef<HTMLVideoElement>;

  scanning = false;
  starting = false;
  looking = false;
  cameraError = '';
  lookupError = '';
  manualCode = '';
  product: any = null;
  /** The code the current result came from, shown back so mis-scans are obvious. */
  scannedCode = '';

  private reader?: BrowserMultiFormatReader;
  private controls?: IScannerControls;
  /** Guards against the decode callback firing repeatedly on the same label. */
  private lastHandledCode = '';

  constructor(
    private genericService: GenericService,
    private barcodeService: BarcodeService,
    private toastrService: ToastrService,
    private zone: NgZone,
  ) {}

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    if (this.scanning || this.starting) {
      return;
    }
    this.cameraError = '';
    this.starting = true;

    try {
      // ZXing is ~1.5 MB, so it is pulled in only once someone actually
      // scans rather than riding along in the seller bundle.
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] =
        await Promise.all([import('@zxing/browser'), import('@zxing/library')]);

      // Only the two formats printed on our labels — narrowing the hint list
      // makes each frame cheaper and cuts false reads.
      const hints = new Map<number, unknown>();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.CODE_128,
      ]);

      this.reader = new BrowserMultiFormatReader(hints as any);
      this.controls = await this.reader.decodeFromVideoDevice(
        undefined,
        this.previewRef?.nativeElement,
        (result) => {
          if (!result) {
            return;
          }
          // zxing's callback runs outside Angular's zone.
          this.zone.run(() => this.handleScan(result.getText()));
        },
      );
      this.scanning = true;
    } catch (err: any) {
      this.cameraError = this.describeCameraError(err);
    } finally {
      this.starting = false;
    }
  }

  stopCamera(): void {
    this.controls?.stop();
    this.controls = undefined;
    this.reader = undefined;
    this.scanning = false;
  }

  /** Submit handler for the code box / keyboard-wedge scanner. */
  submitManualCode(): void {
    const entered = this.manualCode.trim();
    if (!entered) {
      return;
    }
    this.lastHandledCode = '';
    this.handleScan(entered);
    this.manualCode = '';
  }

  scanAnother(): void {
    this.product = null;
    this.scannedCode = '';
    this.lookupError = '';
    this.lastHandledCode = '';
  }

  private handleScan(raw: string): void {
    if (raw === this.lastHandledCode) {
      return;
    }
    this.lastHandledCode = raw;

    const id = this.barcodeService.parseScannedValue(raw);
    if (!id) {
      this.lookupError = `"${raw}" is not a Krono² product code.`;
      this.product = null;
      return;
    }

    this.scannedCode = id;
    this.lookupError = '';
    this.looking = true;

    this.genericService.getObservableToken(GET_PRODUCT_BY_ID + id).subscribe({
      next: (res: any) => {
        const product = Array.isArray(res?.data) ? res.data[0] : res?.data;
        this.looking = false;
        if (!product) {
          this.product = null;
          this.lookupError = 'No product found for this code.';
          return;
        }
        this.product = product;
        // One product per scan — stop the camera so it isn't left running
        // while the seller reads the details.
        this.stopCamera();
        this.toastrService.success(`${product.ProductName} found`);
      },
      error: () => {
        this.looking = false;
        this.product = null;
        this.lookupError = 'Could not load this product. Please try again.';
      },
    });
  }

  private describeCameraError(err: any): string {
    const name = err?.name ?? '';
    if (name === 'NotAllowedError') {
      return 'Camera access was blocked. Allow camera permission for this site, then try again.';
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return 'No camera was found on this device. Enter the code below instead.';
    }
    // getUserMedia is unavailable on insecure origins, which is the usual
    // cause when nothing else matches.
    if (!window.isSecureContext) {
      return 'Camera scanning needs a secure (HTTPS) connection. Enter the code below instead.';
    }
    return 'Could not start the camera. Enter the code below instead.';
  }
}
