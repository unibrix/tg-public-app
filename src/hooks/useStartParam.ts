import { useMemo } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';

export interface StartParamResult {
  /** Raw start_param value (max 64 chars) */
  raw: string | undefined;
  /** Parsed parameters if using delimiter pattern (e.g., "key1__value1__key2__value2") */
  params: Record<string, string>;
  /** Check if a specific param exists */
  has: (key: string) => boolean;
  /** Get a specific param value */
  get: (key: string) => string | undefined;
}

/**
 * Hook to access and parse deep link start parameters.
 *
 * Deep links: https://t.me/bot/app?startapp=value
 *
 * For multiple params, use delimiter pattern:
 * - Key-value: "action__open__id__123" → { action: "open", id: "123" }
 * - Simple list: "param1__param2__param3" → { "0": "param1", "1": "param2", "2": "param3" }
 *
 * @param delimiter - Delimiter for parsing multiple params (default: "__")
 */
export function useStartParam(delimiter = '__'): StartParamResult {
  const launchParams = useLaunchParams();
  const raw = launchParams.tgWebAppStartParam;

  const params = useMemo(() => {
    if (!raw) return {};

    const parts = raw.split(delimiter);

    // If even number of parts, treat as key-value pairs
    if (parts.length > 1 && parts.length % 2 === 0) {
      const result: Record<string, string> = {};
      for (let i = 0; i < parts.length; i += 2) {
        result[parts[i]] = parts[i + 1];
      }
      return result;
    }

    // If odd number or single value, treat as indexed array
    if (parts.length > 1) {
      const result: Record<string, string> = {};
      parts.forEach((part, index) => {
        result[index.toString()] = part;
      });
      return result;
    }

    // Single value - return as "value" key
    return { value: raw };
  }, [raw, delimiter]);

  const has = (key: string): boolean => key in params;
  const get = (key: string): string | undefined => params[key];

  return { raw, params, has, get };
}
