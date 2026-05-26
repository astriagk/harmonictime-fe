import { Component } from '@angular/core';
import { companyDetails } from '@shared/constants/companyDetails';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  email = companyDetails.email;
}
