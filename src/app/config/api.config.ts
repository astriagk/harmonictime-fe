import { environment } from '@env/environment';

export function getFullApiUrl(endpoint: string): string {
  return `${environment.apiBaseUrl}${endpoint}`;
}
