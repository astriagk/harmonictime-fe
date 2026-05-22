import { Pipe, PipeTransform } from '@angular/core';
import { withPlatformMarkup } from '@config/index';

// Adds the platform fee (ORDER_CHARGES.platformPercent) onto a raw price so the
// buyer always sees the all-in price. Chain before the currency pipe, e.g.
//   {{ product.Price | platformPrice | currency: "INR" }}
@Pipe({
  name: 'platformPrice',
})
export class PlatformPricePipe implements PipeTransform {
  transform(value: number): number {
    return withPlatformMarkup(value);
  }
}
