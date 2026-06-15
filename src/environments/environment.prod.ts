// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.krono2.astriagk.com/api',
  socketBaseUrl: 'https://api.krono2.astriagk.com',
  imageUploadUrl: 'https://api.krono2.astriagk.com/upload',
  // TODO: replace with the live Razorpay key before going live with real payments
  razorpayKeyId: 'rzp_test_S7JpGRMIETfbv5',
  companyLogoUrl:
    'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/email_logo/e3c6f4fc-2a25-4e74-b663-ac1d403cd98e-1779438937075',
  gstPercent: 18,
  supportEmail: 'krono2@astriagk.com',
};
