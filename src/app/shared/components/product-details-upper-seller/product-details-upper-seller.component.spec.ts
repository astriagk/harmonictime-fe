import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsUpperSellerComponent } from './product-details-upper-seller.component';

describe('ProductDetailsUpperSellerComponent', () => {
  let component: ProductDetailsUpperSellerComponent;
  let fixture: ComponentFixture<ProductDetailsUpperSellerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductDetailsUpperSellerComponent]
    });
    fixture = TestBed.createComponent(ProductDetailsUpperSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
