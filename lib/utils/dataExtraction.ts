/**
 * Data Extraction Utilities
 * Helper functions to safely extract values from potentially nested API responses
 */

/**
 * Safely extract a value from a potentially nested object structure
 * @param obj - The object that might contain nested values
 * @param fallback - Fallback value if extraction fails
 * @returns The extracted primitive value
 */
export const extractValue = (obj: unknown, fallback: unknown = 0): unknown => {
  if (obj === null || obj === undefined) return fallback;
  if (typeof obj === 'object' && obj !== null && 'value' in obj) return (obj as { value: unknown }).value;
  return obj;
};

/**
 * Safely extract a numeric value from a potentially nested object structure
 * @param obj - The object that might contain nested values
 * @param fallback - Fallback numeric value if extraction fails
 * @returns The extracted numeric value
 */
export const extractNumericValue = (obj: unknown, fallback: number = 0): number => {
  const value = extractValue(obj, fallback);
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numericValue) ? fallback : numericValue;
};

/**
 * Extract a StatSection from dashboard data
 * @param data - The dashboard data object
 * @param label - Label for the statistic
 * @returns A properly formatted StatSection
 */
export const extractStatSection = (data: Record<string, unknown>, label: string) => {
  if (!data) {
    return {
      label,
      value: 0,
      change: 0,
      changeLabel: 'No change this month',
      isCurrency: false,
    };
  }

  return {
    label,
    value: extractValue(data.value, 0),
    change: extractValue(data.change, 0),
    changeLabel: extractValue(data.changeLabel, 'No change this month'),
    isCurrency: extractValue(data.isCurrency, false),
  };
};

/**
 * Extract multiple StatSections from dashboard KPIs
 * @param dashboardData - The complete dashboard KPIs object
 * @param sections - Array of section configurations
 * @returns Array of properly formatted StatSections
 */
export const extractStatSections = (
  dashboardData: Record<string, unknown>,
  sections: Array<{ key: string; label: string }>
) => {
  if (!dashboardData) return [];

  return sections.map(({ key, label }) => 
    extractStatSection(dashboardData[key], label)
  );
};