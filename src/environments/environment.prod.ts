// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  appEnv: 'production',
  // Public origin, used to build canonical/OG URLs. Always the live domain —
  // a canonical pointing at localhost or a preview host is worse than none.
  siteUrl: 'https://krono2.com',
  apiBaseUrl: 'https://api.krono2.com/api',
  socketBaseUrl: 'https://api.krono2.com',
  imageUploadUrl: 'https://api.krono2.com/upload',
  // TODO: replace with the live Razorpay key before going live with real payments
  razorpayKeyId: 'rzp_live_TI6DQccrtn8eJK',
  companyLogoUrl:
    'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/email_logo/e3c6f4fc-2a25-4e74-b663-ac1d403cd98e-1779438937075',
  gstPercent: 18,
  supportEmail: 'support@krono2.com',
  // See the note in environment.ts. Must match GOOGLE_CLIENT_ID on the backend.
  googleClientId:
    '627728704433-5dtk5jppao27ush6d122mrs2d4s2nvi3.apps.googleusercontent.com',
};
