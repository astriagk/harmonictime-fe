import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopAreaFiltersComponent } from './shop-area-filters.component';

describe('ShopAreaFiltersComponent', () => {
  let component: ShopAreaFiltersComponent;
  let fixture: ComponentFixture<ShopAreaFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopAreaFiltersComponent]
    });
    fixture = TestBed.createComponent(ShopAreaFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
