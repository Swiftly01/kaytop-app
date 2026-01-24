/**
 * Test utilities for ReportTemplateModal component stability testing
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

// Mock props for ReportTemplateModal
export interface MockReportTemplateData {
  thingsToReport: {
    collections: boolean;
    savings: boolean;
    customers: boolean;
    missedPayments: boolean;
  };
  newParameter: string;
}

export const createMockReportTemplateData = (overrides?: Partial<MockReportTemplateData>): MockReportTemplateData => ({
  thingsToReport: {
    collections: false,
    savings: false,
    customers: false,
    missedPayments: false,
  },
  newParameter: '',
  ...overrides,
});

export interface MockReportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MockReportTemplateData) => Promise<void>;
  initialData?: MockReportTemplateData;
}

export const createMockProps = (overrides?: Partial<MockReportTemplateModalProps>): MockReportTemplateModalProps => ({
  isOpen: true,
  onClose: jest.fn(),
  onSave: jest.fn().mockResolvedValue(undefined),
  initialData: createMockReportTemplateData(),
  ...overrides,
});

// Render count tracking utility
export class RenderTracker {
  private renderCount = 0;
  private renderHistory: number[] = [];

  reset() {
    this.renderCount = 0;
    this.renderHistory = [];
  }

  increment() {
    this.renderCount++;
    this.renderHistory.push(Date.now());
  }

  getCount() {
    return this.renderCount;
  }

  getHistory() {
    return [...this.renderHistory];
  }

  // Check if renders have stabilized (no renders in the last interval)
  hasStabilized(intervalMs = 100) {
    if (this.renderHistory.length < 2) return true;
    
    const lastRender = this.renderHistory[this.renderHistory.length - 1];
    const now = Date.now();
    return (now - lastRender) > intervalMs;
  }

  // Detect infinite render loops (too many renders in short time)
  hasInfiniteLoop(maxRenders = 50, timeWindowMs = 1000) {
    if (this.renderCount <= maxRenders) return false;
    
    const now = Date.now();
    const recentRenders = this.renderHistory.filter(time => (now - time) < timeWindowMs);
    return recentRenders.length > maxRenders;
  }
}

// Custom render function with render tracking
export const renderWithTracking = (
  ui: ReactElement,
  tracker: RenderTracker,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Wrapper component that tracks renders
  const TrackingWrapper = ({ children }: { children: ReactNode }) => {
    tracker.increment();
    return <>{children}</>;
  };

  return render(ui, {
    wrapper: TrackingWrapper,
    ...options,
  });
};

// Utility to wait for component to stabilize
export const waitForStabilization = async (
  tracker: RenderTracker,
  maxWaitMs = 2000,
  checkIntervalMs = 50
): Promise<boolean> => {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const checkStability = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > maxWaitMs) {
        resolve(false); // Timeout - not stabilized
        return;
      }
      
      if (tracker.hasStabilized(checkIntervalMs)) {
        resolve(true); // Stabilized
        return;
      }
      
      if (tracker.hasInfiniteLoop()) {
        resolve(false); // Infinite loop detected
        return;
      }
      
      setTimeout(checkStability, checkIntervalMs);
    };
    
    checkStability();
  });
};

// Mock toast hook for testing
export const mockUseToast = () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
});

// Property-based testing generators
export const generateRandomReportData = (): MockReportTemplateData => ({
  thingsToReport: {
    collections: Math.random() > 0.5,
    savings: Math.random() > 0.5,
    customers: Math.random() > 0.5,
    missedPayments: Math.random() > 0.5,
  },
  newParameter: Math.random().toString(36).substring(7),
});

export const generateRandomProps = (): MockReportTemplateModalProps => ({
  isOpen: Math.random() > 0.5,
  onClose: jest.fn(),
  onSave: jest.fn().mockResolvedValue(undefined),
  initialData: Math.random() > 0.3 ? generateRandomReportData() : undefined,
});