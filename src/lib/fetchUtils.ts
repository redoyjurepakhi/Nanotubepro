import { Capacitor, CapacitorHttp } from '@capacitor/core';

export interface SafeFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

export const safeFetch = async (url: string, options: any = {}): Promise<SafeFetchResponse> => {
  // Use CapacitorHttp for native platforms to bypass CORS
  if (Capacitor.isNativePlatform()) {
    try {
      const response = await CapacitorHttp.request({
        url,
        method: options.method || 'GET',
        headers: options.headers || {},
        data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
      });
      
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.data,
        text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      };
    } catch (error) {
      console.error('CapacitorHttp error:', error);
      throw error;
    }
  }

  // Fallback to standard fetch for web
  const res = await fetch(url, options);
  return {
    ok: res.ok,
    status: res.status,
    json: () => res.json(),
    text: () => res.text()
  };
};
