import { Pipe, PipeTransform } from '@angular/core';

// Shows a dash for missing values so empty specification rows read "-" instead
// of blank. Treats null, undefined and empty/whitespace strings as missing.
//   <span>{{ product.Details.Diameter | dash }}</span>
@Pipe({
  name: 'dash',
})
export class DashPipe implements PipeTransform {
  transform(value: any): any {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string' && value.trim() === '') return '-';
    return value;
  }
}
