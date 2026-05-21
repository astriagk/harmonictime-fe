import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbTwoComponent } from './breadcrumb-two.component';

describe('BreadcrumbTwoComponent', () => {
  let component: BreadcrumbTwoComponent;
  let fixture: ComponentFixture<BreadcrumbTwoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BreadcrumbTwoComponent]
    });
    fixture = TestBed.createComponent(BreadcrumbTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
