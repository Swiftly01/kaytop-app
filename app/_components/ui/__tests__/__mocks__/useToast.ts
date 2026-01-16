/**
 * Mock implementation of useToast hook for testing
 */

export const useToast = jest.fn(() => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
}));

export default useToast;