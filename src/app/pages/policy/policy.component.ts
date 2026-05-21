import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import policy_data from '@shared/data/policy-data';
import { IPolicyPage } from '@shared/types/policy-d-t';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss'],
})
export class PolicyComponent implements OnInit, OnDestroy {
  public slug = '';
  public page?: IPolicyPage;

  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug') ?? '';
      this.page = policy_data[this.slug];
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
