import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb-two',
  templateUrl: './breadcrumb-two.component.html',
  styleUrls: ['./breadcrumb-two.component.scss'],
})
export class BreadcrumbTwoComponent {
  @Input() bg?: string;
  @Input() title!: string;
  @Input() subtitle!: string;

  public bg_img = '/assets/img/page-title/page-title-1.jpg';

  ngOnInit() {
    if (this.bg) {
      this.bg_img = this.bg;
    }
  }
}
