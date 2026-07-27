// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  appEnv: 'production',
  // Public origin, used to build canonical/OG URLs. Always the live domain —
  // a canonical pointing at localhost or a preview host is worse than none.
  siteUrl: 'https://krono2.com',
  apiBaseUrl: 'https://api.krono2.astriagk.com/api',
  socketBaseUrl: 'https://api.krono2.astriagk.com',
  imageUploadUrl: 'https://api.krono2.astriagk.com/upload',
  // TODO: replace with the live Razorpay key before going live with real payments
  razorpayKeyId: 'rzp_live_TI6DQccrtn8eJK',
  companyLogoUrl:
    'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/email_logo/e3c6f4fc-2a25-4e74-b663-ac1d403cd98e-1779438937075',
  gstPercent: 18,
  supportEmail: 'krono2@astriagk.com',
};
