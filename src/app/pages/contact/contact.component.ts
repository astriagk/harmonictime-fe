import { Component } from '@angular/core';
import { companyDetails } from '@shared/constants/companyDetails';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  public details = companyDetails;
}
