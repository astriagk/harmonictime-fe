import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SUPPORT_EMAIL } from 'src/app/config';

export type BlockReason = 'blocked' | 'suspended';

@Component({
  selector: 'app-account-blocked',
  templateUrl: './account-blocked.component.html',
  styleUrls: ['./account-blocked.component.scss'],
})
export class AccountBlockedComponent implements OnInit {
  public reason: BlockReason = 'blocked';
  readonly supportEmail = SUPPORT_EMAIL;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const r = this.route.snapshot.queryParamMap.get('reason') as BlockReason;
    this.reason = r === 'suspended' ? 'suspended' : 'blocked';
  }

  get isBlocked() { return this.reason === 'blocked'; }
  get isSuspended() { return this.reason === 'suspended'; }
}
