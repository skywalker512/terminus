/**
 * @internal
 */
export const CONNECTION_NOT_FOUND =
  'Connection provider not found in application context';

/**
 * @internal
 */
export const TIMEOUT_EXCEEDED = (timeout: number) =>
  `timeout of ${timeout.toString()}ms exceeded`;

/**
 * @internal
 */
export const STORAGE_EXCEEDED = (keyword: string) =>
  `Used ${keyword} exceeded the set threshold`;
