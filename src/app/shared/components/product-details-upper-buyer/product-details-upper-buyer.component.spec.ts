import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsUpperBuyerComponent } from './product-details-upper-buyer.component';

describe('ProductDetailsUpperBuyerComponent', () => {
  let component: ProductDetailsUpperBuyerComponent;
  let fixture: ComponentFixture<ProductDetailsUpperBuyerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductDetailsUpperBuyerComponent]
    });
    fixture = TestBed.createComponent(ProductDetailsUpperBuyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
