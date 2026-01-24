/**
 * Response Helper Utilities
 * 
 * Helper functions for handling API responses consistently across the application.
 * These utilities handle both direct Axios responses and wrapped API responses.
 */

import { AxiosResponse } from 'axios';

/**
 * Checks if an Axios response contains a successful wrapped API response
 * 
 * @param response - The Axios response object
 * @returns true if response.data has a success property set to true
 * 
 * @example
 * const response = await apiClient.get('/endpoint');
 * if (isSuccessResponse(response)) {
 *   return response.data.data;
 * }
 */
export function isSuccessResponse(response: AxiosResponse<unknown>): boolean {
  return !!(
    response?.data &&
    typeof response.data === 'object' &&
    'success' in response.data &&
    response.data.success === true
  );
}

/**
 * Checks if an Axios response contains a failed wrapped API response
 * 
 * @param response - The Axios response object
 * @returns true if response.data has a success property set to false
 */
export function isFailureResponse(response: AxiosResponse<unknown>): boolean {
  return !!(
    response?.data &&
    typeof response.data === 'object' &&
    'success' in response.data &&
    response.data.success === false
  );
}

/**
 * Extracts data from a wrapped API response
 * 
 * @param response - The Axios response object
 * @returns The data from response.data.data, or response.data if not wrapped
 */
export function extractResponseData<T = unknown>(response: AxiosResponse<unknown>): T {
  if (isSuccessResponse(response)) {
    return response.data.data;
  }
  return response.data;
}
