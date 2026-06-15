const { execSync } = require('child_process');

const ENV_MAP = {
  production: 'production',
  staging: 'staging',
  preview: 'development',
  development: 'development',
};

// Use APP_ENV (custom Vercel var) if set, else fall back to VERCEL_ENV
const appEnv = process.env.APP_ENV || process.env.VERCEL_ENV || 'development';
const ngConfig = ENV_MAP[appEnv];

if (!ngConfig) {
  console.error(`Unknown environment: "${appEnv}". Add it to ENV_MAP in build.js`);
  process.exit(1);
}

console.log(`Building with Angular config: ${ngConfig} (APP_ENV=${appEnv})`);
execSync(`ng build --configuration ${ngConfig}`, { stdio: 'inherit' });
