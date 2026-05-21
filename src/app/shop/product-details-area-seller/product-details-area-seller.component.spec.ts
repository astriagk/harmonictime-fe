import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsAreaSellerComponent } from './product-details-area-seller.component';

describe('ProductDetailsAreaSellerComponent', () => {
  let component: ProductDetailsAreaSellerComponent;
  let fixture: ComponentFixture<ProductDetailsAreaSellerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductDetailsAreaSellerComponent]
    });
    fixture = TestBed.createComponent(ProductDetailsAreaSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
