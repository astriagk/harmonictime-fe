import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shop-area-filters',
  templateUrl: './shop-area-filters.component.html',
  styleUrls: ['./shop-area-filters.component.scss'],
})
export class ShopAreaFiltersComponent {
  @Output() handleResetFilter: EventEmitter<any> = new EventEmitter<any>();

  resetFilter() {
    this.handleResetFilter.emit(true);
  }
}
