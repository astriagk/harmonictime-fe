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
  razorpayKeyId: 'rzp_live_TI6DQccrtn8eJK',
  companyLogoUrl:
    'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/email_logo/e3c6f4fc-2a25-4e74-b663-ac1d403cd98e-1779438937075',
  gstPercent: 18,
  supportEmail: 'support@krono2.com',
  // Google Sign-In OAuth client ID (Web application). Public by design — it is
  // sent to the browser. Must match GOOGLE_CLIENT_ID on the backend, which is
  // what actually verifies the returned ID token. The Google Cloud client needs
  // this origin listed under "Authorised JavaScript origins".
  googleClientId:
    '627728704433-5dtk5jppao27ush6d122mrs2d4s2nvi3.apps.googleusercontent.com',
};
