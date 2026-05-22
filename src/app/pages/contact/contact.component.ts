import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { companyDetails } from '@shared/constants/companyDetails';
import social_links, { ISocial } from '@shared/data/social-data';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  public details = companyDetails;
  public social_links: ISocial[] = social_links;
  public mapUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // Search by business name + address so Google shows the actual
    // "Harmonic Time" place listing, not just a geocoded address pin.
    const query = encodeURIComponent(
      `${companyDetails.name}, ${companyDetails.address}`
    );
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?hl=en&q=${query}&ie=UTF8&t=&z=16&iwloc=B&output=embed`
    );
  }
}
