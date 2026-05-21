// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  // TODO: point these at the real production backend before deploying
  apiBaseUrl: 'http://localhost:5000/api',
  imageUploadUrl: 'http://localhost:5000/upload',
  // TODO: replace with the live Razorpay key before deploying
  razorpayKeyId: 'rzp_test_S7JpGRMIETfbv5',
  // Add other environment-specific configurations
};
