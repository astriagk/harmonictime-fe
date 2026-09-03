import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

// Both libraries are CommonJS. Importing the namespace and re-typing it keeps
// the call sites working whether or not `esModuleInterop` is ever turned on.
import * as JsBarcodeNs from 'jsbarcode';
import * as QRCode from 'qrcode';

const JsBarcode = JsBarcodeNs as unknown as (
  element: unknown,
  data: string,
  options?: Record<string, unknown>,
) => void;

/** A Mongo ObjectId anywhere inside a scanned string. */
const OBJECT_ID = /[0-9a-f]{24}/i;

/**
 * Builds the scannable identity of a product and renders it as a printable
 * label.
 *
 * There is no barcode/SKU column on the product record, so the code is derived
 * from the product's own `_id` — it exists the moment the product is created,
 * never changes, and is what every product endpoint already looks up by. The
 * label carries that identity twice:
 *
 *   - **Code128** encoding the raw `_id`, for warehouse/laser scanners and the
 *     in-app scanner.
 *   - **QR** encoding the public product URL, so any phone camera opens the
 *     full details page without going through the app.
 */
@Injectable({ providedIn: 'root' })
export class BarcodeService {
  /** Raw value encoded in the Code128 bars — the product id itself. */
  barcodeValue(product: any): string {
    const id = typeof product === 'string' ? product : product?._id;
    return String(id ?? '').trim();
  }

  /**
   * The same id, grouped and uppercased for the human-readable line under the
   * bars. `parseScannedValue` accepts it typed back in with or without dashes.
   */
  humanCode(product: any): string {
    const value = this.barcodeValue(product).toUpperCase();
    return value.replace(/(.{4})(?=.)/g, '$1-');
  }

  /**
   * URL encoded in the QR — the buyer product page, the same destination every
   * product card in the app links to. (`/shop/shop-details/:id` looks like the
   * public page but is unconverted template code reading the static demo
   * dataset, so a real product id 404s there.)
   */
  qrValue(product: any): string {
    return `${this.siteOrigin()}/buyer/product-details/${this.barcodeValue(
      product,
    )}`;
  }

  /**
   * Pull a product id out of whatever came back from a scan or was typed in:
   * the QR's URL, a raw id, or the dashed human-readable code.
   */
  parseScannedValue(raw: string): string | null {
    const compact = (raw ?? '').replace(/[\s-]/g, '');
    const match = OBJECT_ID.exec(compact);
    return match ? match[0].toLowerCase() : null;
  }

  /**
   * Draw the whole label onto a single canvas and hand back a PNG data URL.
   *
   * The label stays deliberately sparse — brand, product name, price, then the
   * two codes. Everything else is a scan away, and spec lines on a sticker only
   * shrink the bars.
   *
   * Composing on canvas rather than screenshotting the DOM keeps the printed
   * label identical everywhere — no dependency on stylesheets, print CSS, or
   * how a given browser rasterises inline SVG.
   */
  async renderLabelPng(product: any): Promise<string> {
    const scale = 2;
    const width = 680;
    const pad = 40;

    const code = this.barcodeValue(product);

    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, this.qrValue(product), {
      width: 240,
      margin: 1,
      color: { dark: '#201f1f', light: '#ffffff' },
    });

    const barsCanvas = document.createElement('canvas');
    JsBarcode(barsCanvas, code, {
      format: 'CODE128',
      text: this.humanCode(product),
      width: 2,
      height: 90,
      fontSize: 16,
      font: 'Poppins, sans-serif',
      textMargin: 6,
      margin: 0,
      lineColor: '#201f1f',
      background: '#ffffff',
    });

    const barsHeight =
      (barsCanvas.height / barsCanvas.width) * (width - pad * 2);
    const height =
      pad + 30 + 28 + 66 + qrCanvas.height + 34 + barsHeight + pad;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas is not supported in this browser');
    }
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = 'top';

    let y = pad;

    // Header: wordmark left, price right.
    ctx.fillStyle = '#bc8246';
    ctx.font = '600 16px Poppins, sans-serif';
    ctx.fillText('KRONO²', pad, y);
    ctx.fillStyle = '#201f1f';
    ctx.font = '600 18px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(this.formatPrice(product?.Price), width - pad, y - 2);
    ctx.textAlign = 'left';
    y += 30;

    ctx.strokeStyle = '#e1e1e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
    y += 28;

    // Brand + product name.
    ctx.fillStyle = '#848b8a';
    ctx.font = '500 13px Poppins, sans-serif';
    ctx.fillText(String(product?.Details?.BrandName ?? '').toUpperCase(), pad, y);
    y += 22;
    ctx.fillStyle = '#201f1f';
    ctx.font = '600 22px Poppins, sans-serif';
    ctx.fillText(
      this.truncate(ctx, String(product?.ProductName ?? ''), width - pad * 2),
      pad,
      y,
    );
    y += 44;

    // QR, centred, with its caption.
    ctx.drawImage(qrCanvas, (width - qrCanvas.width) / 2, y);
    y += qrCanvas.height + 10;
    ctx.fillStyle = '#848b8a';
    ctx.font = '500 12px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan for full product details', width / 2, y);
    ctx.textAlign = 'left';
    y += 24;

    // Code128, stretched to the label width.
    ctx.drawImage(barsCanvas, pad, y, width - pad * 2, barsHeight);

    return canvas.toDataURL('image/png');
  }

  /**
   * Open the rendered label in a print dialog.
   *
   * Printed from a hidden iframe rather than a popup window: popups get
   * blocked, and calling `print()` on a freshly written `about:blank` document
   * prints before the image is laid out, which is what produced torn output.
   * Here the print only fires once the image has actually decoded.
   */
  printLabel(dataUrl: string, title: string): void {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) {
      frame.remove();
      return;
    }

    doc.open();
    doc.write(
      `<!doctype html><html><head><title>${this.escapeHtml(title)}</title>` +
        '<style>' +
        '@page{size:auto;margin:12mm}' +
        'html,body{margin:0;padding:0;background:#fff}' +
        // Block layout, not flex — flex containers print inconsistently.
        'img{display:block;width:90mm;height:auto;margin:0 auto}' +
        '</style></head><body>' +
        `<img src="${dataUrl}" alt="${this.escapeHtml(title)}" />` +
        '</body></html>',
    );
    doc.close();

    const cleanUp = () => frame.remove();
    const fire = () => {
      win.focus();
      win.print();
      // Chrome blocks on print(); Safari doesn't, so wait for afterprint and
      // keep a fallback in case it never fires.
      win.onafterprint = cleanUp;
      setTimeout(cleanUp, 60000);
    };

    const img = doc.images[0];
    if (!img) {
      cleanUp();
      return;
    }
    // decode() resolves only once the bitmap is ready to paint, which load
    // alone doesn't guarantee.
    if (typeof img.decode === 'function') {
      img.decode().then(fire, fire);
    } else if (img.complete) {
      fire();
    } else {
      img.onload = fire;
      img.onerror = cleanUp;
    }
  }

  /** Save the rendered label as a PNG file. */
  downloadLabel(dataUrl: string, product: any): void {
    const name = String(product?.ProductName ?? 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${name || 'product'}-${this.barcodeValue(product)}.png`;
    link.click();
  }

  /**
   * Labels are printed for the live site, so production always uses the public
   * domain. In dev the current origin is used instead, otherwise every QR
   * scanned off a test print would jump to production.
   */
  private siteOrigin(): string {
    if (environment.production) {
      return environment.siteUrl.replace(/\/$/, '');
    }
    return window.location.origin;
  }

  private formatPrice(price: unknown): string {
    const value = Number(price);
    if (!isFinite(value) || value <= 0) {
      return '';
    }
    return `₹${value.toLocaleString('en-IN')}`;
  }

  /** Clip a string to a pixel width, adding an ellipsis when it doesn't fit. */
  private truncate(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    let clipped = text;
    while (
      clipped.length > 1 &&
      ctx.measureText(`${clipped}…`).width > maxWidth
    ) {
      clipped = clipped.slice(0, -1);
    }
    return `${clipped}…`;
  }

  private escapeHtml(value: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    };
    return value.replace(/[&<>"]/g, (c) => map[c] ?? c);
  }
}
