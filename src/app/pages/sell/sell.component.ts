import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectSellerVerificationStatus } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent implements OnInit {
  isLoggedIn = false;
  sellerVerificationStatus: string | null = null;
  readonly sellTitle = 'Sell on Krono²';

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectIsLoggedIn).subscribe((v) => (this.isLoggedIn = v));
    this.store.select(selectSellerVerificationStatus).subscribe((s) => (this.sellerVerificationStatus = s));
  }

  get businessCtaTitle(): string {
    switch (this.sellerVerificationStatus) {
      case 'Approved':    return 'You\'re a Verified Seller';
      case 'Pending':     return 'Application Under Review';
      case 'Resubmitted': return 'Resubmission Under Review';
      case 'Rejected':    return 'Application Rejected';
      default:            return 'Start selling as a Business';
    }
  }

  get businessCtaSubtitle(): string {
    switch (this.sellerVerificationStatus) {
      case 'Approved':    return 'Your account is active. Manage your products and track your earnings from the dashboard.';
      case 'Pending':     return 'Our team is reviewing your documents. You\'ll be notified once your account is approved.';
      case 'Resubmitted': return 'Your updated application is under review. You\'ll be notified once it\'s approved.';
      case 'Rejected':    return 'Your application was not approved. Review the feedback and resubmit with updated documents.';
      default:            return 'Access enhanced tools, bulk listing, and priority support.';
    }
  }

  get businessCtaStripClass(): string {
    switch (this.sellerVerificationStatus) {
      case 'Approved':    return 'sell__cta-strip sell__cta-strip--approved';
      case 'Pending':     return 'sell__cta-strip sell__cta-strip--pending';
      case 'Resubmitted': return 'sell__cta-strip sell__cta-strip--pending';
      case 'Rejected':    return 'sell__cta-strip sell__cta-strip--rejected';
      default:            return 'sell__cta-strip';
    }
  }

  get businessCtaLabel(): string {
    if (!this.isLoggedIn) return 'Become a Seller';
    switch (this.sellerVerificationStatus) {
      case 'Approved':    return 'Go to Dashboard';
      case 'Pending':     return 'Application Under Review';
      case 'Resubmitted': return 'Resubmission Under Review';
      case 'Rejected':    return 'Resubmit Application';
      default:            return 'Get Started';
    }
  }

  get businessCtaDisabled(): boolean {
    return this.sellerVerificationStatus === 'Pending' || this.sellerVerificationStatus === 'Resubmitted';
  }

  onBusinessSellerClick(): void {
    if (this.businessCtaDisabled) return;
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.sellerVerificationStatus === 'Approved') {
      this.router.navigate(['/seller/products']);
      return;
    }
    this.router.navigate(['/auth/gst-onboarding']);
  }

  onIndividualSellerClick() {
    // no action for now
  }

  individualSteps = [
    {
      icon: 'fal fa-user-circle',
      title: 'Create an Account',
      description: 'Sign up for free and verify your email address to get started as an individual seller.',
    },
    {
      icon: 'fal fa-comments',
      title: 'Get in Touch with Our Team',
      description: 'Reach out to us with details about the watch you\'d like to sell. Individual sellers are onboarded personally — we don\'t allow direct listings.',
    },
    {
      icon: 'fal fa-file-alt',
      title: 'Submit Your Documents',
      description: 'Provide the required documents — Aadhaar card, PAN card, proof of address, and watch-related paperwork such as the original receipt or box.',
    },
    {
      icon: 'fal fa-search',
      title: 'Item Verification',
      description: 'Our team carefully verifies the watch\'s authenticity, condition, and ownership. We may request additional details or photos during this step.',
    },
    {
      icon: 'fal fa-tag',
      title: 'We List It for You',
      description: 'Once everything checks out, we create a verified listing on your behalf with professional descriptions and imagery.',
    },
    {
      icon: 'fal fa-hand-holding-usd',
      title: 'Get Paid',
      description: 'When your watch sells, your earnings are transferred directly to your bank account — simple, safe, and transparent.',
    },
  ];

  businessInfo = [
    'Registered business name and trading name',
    'Company registration number',
    'VAT / Tax identification number',
    'Business address and primary contact',
    'Authorised representative\'s ID',
    'Bank account in the business name',
    'Product catalogue or inventory details',
    'Return and warranty policy',
  ];

  businessSteps = [
    {
      title: 'Apply as a Business',
      description: 'Register and submit your company documents for review.',
    },
    {
      title: 'Verification & Approval',
      description: 'Our team reviews your documents within 2–3 business days.',
    },
    {
      title: 'Set Up Your Storefront',
      description: 'Customise your profile and start listing inventory with bulk tools.',
    },
    {
      title: 'Sell & Scale',
      description: 'Manage orders, track earnings, and grow with analytics.',
    },
  ];
}
