/**
 * Score Utilities
 * Helper functions for score formatting, visualization, and comparison
 */

/**
 * Format score for display with optional precision
 * 
 * @param score - Numeric score to format (0-100)
 * @param options - Formatting options
 * @returns Formatted score string
 * 
 * @example
 * formatScore(85.7) // '86'
 * formatScore(85.7, { precision: 1 }) // '85.7'
 * formatScore(85.7, { suffix: '%' }) // '86%'
 * formatScore(85.7, { prefix: 'Score: ' }) // 'Score: 86'
 */
export function formatScore(
  score: number,
  options?: {
    precision?: number;
    prefix?: string;
    suffix?: string;
    showSign?: boolean;
  }
): string {
  if (typeof score !== 'number' || isNaN(score)) {
    return 'N/A';
  }

  const {
    precision = 0,
    prefix = '',
    suffix = '',
    showSign = false,
  } = options || {};

  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Format with precision
  const formattedNumber = clampedScore.toFixed(precision);

  // Add sign if requested
  const sign = showSign && clampedScore > 0 ? '+' : '';

  return `${prefix}${sign}${formattedNumber}${suffix}`;
}

/**
 * Get color code for score visualization
 * Returns color based on score thresholds for visual indicators
 * 
 * @param score - Numeric score (0-100)
 * @param colorScheme - Color scheme to use ('default', 'traffic', 'gradient')
 * @returns Color code (hex, rgb, or CSS class name)
 * 
 * @example
 * getScoreColor(85) // '#22c55e' (green)
 * getScoreColor(65) // '#eab308' (yellow)
 * getScoreColor(45) // '#ef4444' (red)
 */
export function getScoreColor(
  score: number,
  colorScheme: 'default' | 'traffic' | 'gradient' | 'class' = 'default'
): string {
  if (typeof score !== 'number' || isNaN(score)) {
    return colorScheme === 'class' ? 'text-gray-500' : '#6b7280';
  }

  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  if (colorScheme === 'class') {
    // Return Tailwind CSS class names
    if (clampedScore >= 80) return 'text-green-600';
    if (clampedScore >= 60) return 'text-yellow-600';
    if (clampedScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  if (colorScheme === 'traffic') {
    // Traffic light colors
    if (clampedScore >= 80) return '#22c55e'; // green-500
    if (clampedScore >= 60) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  }

  if (colorScheme === 'gradient') {
    // Smooth gradient from red to yellow to green
    if (clampedScore >= 80) {
      // Green range (80-100)
      const intensity = Math.round(((clampedScore - 80) / 20) * 55 + 200);
      return `rgb(34, ${intensity}, 94)`;
    } else if (clampedScore >= 60) {
      // Yellow range (60-80)
      const intensity = Math.round(((clampedScore - 60) / 20) * 55 + 179);
      return `rgb(234, ${intensity}, 8)`;
    } else if (clampedScore >= 40) {
      // Orange range (40-60)
      const intensity = Math.round(((60 - clampedScore) / 20) * 55 + 100);
      return `rgb(249, ${intensity}, 47)`;
    } else {
      // Red range (0-40)
      const intensity = Math.round((clampedScore / 40) * 68 + 68);
      return `rgb(239, ${intensity}, 68)`;
    }
  }

  // Default color scheme
  if (clampedScore >= 80) return '#22c55e'; // green-500 - excellent
  if (clampedScore >= 60) return '#eab308'; // yellow-500 - competitive
  if (clampedScore >= 40) return '#f97316'; // orange-500 - needs improvement
  return '#ef4444'; // red-500 - poor
}

/**
 * Get background color for score visualization
 * Returns lighter background color suitable for cards/badges
 * 
 * @param score - Numeric score (0-100)
 * @returns Background color code (hex or CSS class)
 */
export function getScoreBackgroundColor(
  score: number,
  returnClass: boolean = false
): string {
  if (typeof score !== 'number' || isNaN(score)) {
    return returnClass ? 'bg-gray-100' : '#f3f4f6';
  }

  const clampedScore = Math.max(0, Math.min(100, score));

  if (returnClass) {
    if (clampedScore >= 80) return 'bg-green-100';
    if (clampedScore >= 60) return 'bg-yellow-100';
    if (clampedScore >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  }

  if (clampedScore >= 80) return '#dcfce7'; // green-100
  if (clampedScore >= 60) return '#fef9c3'; // yellow-100
  if (clampedScore >= 40) return '#ffedd5'; // orange-100
  return '#fee2e2'; // red-100
}

/**
 * Compare two scores and return comparison result
 * 
 * @param currentScore - Current score
 * @param previousScore - Previous score to compare against
 * @returns Comparison object with difference and direction
 * 
 * @example
 * compareScores(85, 75)
 * // { difference: 10, percentChange: 13.33, direction: 'up', improved: true }
 */
export function compareScores(
  currentScore: number,
  previousScore: number
): {
  difference: number;
  percentChange: number;
  direction: 'up' | 'down' | 'same';
  improved: boolean;
  formattedDifference: string;
} {
  if (
    typeof currentScore !== 'number' ||
    typeof previousScore !== 'number' ||
    isNaN(currentScore) ||
    isNaN(previousScore)
  ) {
    return {
      difference: 0,
      percentChange: 0,
      direction: 'same',
      improved: false,
      formattedDifference: 'N/A',
    };
  }

  const difference = currentScore - previousScore;
  const percentChange = previousScore !== 0
    ? (difference / previousScore) * 100
    : 0;

  let direction: 'up' | 'down' | 'same';
  if (difference > 0) {
    direction = 'up';
  } else if (difference < 0) {
    direction = 'down';
  } else {
    direction = 'same';
  }

  const improved = difference > 0;

  const formattedDifference = formatScore(Math.abs(difference), {
    prefix: difference > 0 ? '+' : difference < 0 ? '-' : '',
    precision: 1,
  });

  return {
    difference: Math.round(difference * 10) / 10,
    percentChange: Math.round(percentChange * 10) / 10,
    direction,
    improved,
    formattedDifference,
  };
}

/**
 * Get score quality label
 * 
 * @param score - Numeric score (0-100)
 * @returns Quality label string
 * 
 * @example
 * getScoreQualityLabel(85) // 'Excellent'
 * getScoreQualityLabel(65) // 'Competitive'
 * getScoreQualityLabel(45) // 'Needs Improvement'
 */
export function getScoreQualityLabel(score: number): string {
  if (typeof score !== 'number' || isNaN(score)) {
    return 'Unknown';
  }

  const clampedScore = Math.max(0, Math.min(100, score));

  if (clampedScore >= 80) return 'Excellent';
  if (clampedScore >= 60) return 'Competitive';
  if (clampedScore >= 40) return 'Needs Improvement';
  return 'Poor';
}

/**
 * Calculate weighted average of multiple scores
 * 
 * @param scores - Array of score objects with value and weight
 * @returns Weighted average score
 * 
 * @example
 * calculateWeightedScore([
 *   { value: 80, weight: 0.4 },
 *   { value: 70, weight: 0.3 },
 *   { value: 90, weight: 0.3 }
 * ]) // 79
 */
export function calculateWeightedScore(
  scores: Array<{ value: number; weight: number }>
): number {
  if (!Array.isArray(scores) || scores.length === 0) {
    return 0;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  scores.forEach(({ value, weight }) => {
    if (typeof value === 'number' && typeof weight === 'number' && !isNaN(value) && !isNaN(weight)) {
      totalWeightedScore += value * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((totalWeightedScore / totalWeight) * 10) / 10;
}

/**
 * Get score trend indicator
 * 
 * @param scores - Array of historical scores (oldest first)
 * @returns Trend indicator object
 * 
 * @example
 * getScoreTrend([70, 75, 80, 85])
 * // { trend: 'improving', slope: 5, consistency: 'high' }
 */
export function getScoreTrend(scores: number[]): {
  trend: 'improving' | 'declining' | 'stable';
  slope: number;
  consistency: 'high' | 'medium' | 'low';
} {
  if (!Array.isArray(scores) || scores.length < 2) {
    return {
      trend: 'stable',
      slope: 0,
      consistency: 'low',
    };
  }

  // Calculate simple linear regression slope
  const n = scores.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  scores.forEach((score, index) => {
    sumX += index;
    sumY += score;
    sumXY += index * score;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable';
  if (slope > 1) {
    trend = 'improving';
  } else if (slope < -1) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Calculate consistency (based on variance)
  const mean = sumY / n;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  let consistency: 'high' | 'medium' | 'low';
  if (stdDev < 5) {
    consistency = 'high';
  } else if (stdDev < 10) {
    consistency = 'medium';
  } else {
    consistency = 'low';
  }

  return {
    trend,
    slope: Math.round(slope * 10) / 10,
    consistency,
  };
}

/**
 * Normalize score to different scale
 * 
 * @param score - Score to normalize
 * @param fromRange - Current range [min, max]
 * @param toRange - Target range [min, max]
 * @returns Normalized score
 * 
 * @example
 * normalizeScore(75, [0, 100], [0, 10]) // 7.5
 * normalizeScore(3, [1, 5], [0, 100]) // 50
 */
export function normalizeScore(
  score: number,
  fromRange: [number, number],
  toRange: [number, number]
): number {
  if (typeof score !== 'number' || isNaN(score)) {
    return toRange[0];
  }

  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;

  // Clamp to input range
  const clampedScore = Math.max(fromMin, Math.min(fromMax, score));

  // Normalize
  const normalized = ((clampedScore - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;

  return Math.round(normalized * 10) / 10;
}
