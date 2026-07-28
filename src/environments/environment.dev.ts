// src/environments/environment.ts (development)
// export const environment = {
//   production: false,
//   appEnv: 'development',
//   apiBaseUrl: 'https://api.krono2-development.astriagk.com/api',
//   socketBaseUrl: 'https://api.krono2-development.astriagk.com',
//   imageUploadUrl: 'https://api.krono2-development.astriagk.com/upload',
//   razorpayKeyId: 'rzp_test_S7JpGRMIETfbv5',
//   companyLogoUrl:
//     'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/email_logo/e3c6f4fc-2a25-4e74-b663-ac1d403cd98e-1779438937075',
//   gstPercent: 18,
//   supportEmail: 'support@krono2.com',
// };

// src/environments/environment.ts (development)
export const environment = {
  production: false,
  appEnv: 'local',
  // Public origin, used to build canonical/OG URLs. Always the live domain —
  // a canonical pointing at localhost or a preview host is worse than none.
  siteUrl: 'https://krono2.com',
  apiBaseUrl: 'http://localhost:5000/api',
  socketBaseUrl: 'http://localhost:5000',
  imageUploadUrl: 'http://localhost:5000/upload',
  razorpayKeyId: 'rzp_test_S7JpGRMIETfbv5',
  companyLogoUrl:
    'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/email_logo/e3c6f4fc-2a25-4e74-b663-ac1d403cd98e-1779438937075',
  gstPercent: 18,
  supportEmail: 'support@krono2.com',
};
