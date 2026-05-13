/**
 * SimplyDSE Intelligent Risk Engine
 * Handles weighted scoring, risk classification, and critical overrides.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AssessmentResult {
  score: number;
  riskLevel: RiskLevel;
  categoryScores: Record<string, number>;
  recommendations: string[];
  requiresHREscalation: boolean;
}

export const RISK_THRESHOLDS = {
  LOW: 20,
  MEDIUM: 40,
  HIGH: 70,
  CRITICAL: 100,
};

/**
 * Calculates the overall risk assessment results based on chosen options.
 */
export function calculateRisk(responses: any[]): AssessmentResult {
  let totalScore = 0;
  let maxPossibleScore = 0;
  let requiresHREscalation = false;
  const categoryScores: Record<string, number> = {};
  const categoryMaxScores: Record<string, number> = {};
  const recommendations: string[] = [];

  responses.forEach((resp) => {
    const { option, question } = resp;
    const categoryName = question.category.name;

    // Track scores per category
    categoryScores[categoryName] = (categoryScores[categoryName] || 0) + option.score;
    categoryMaxScores[categoryName] = (categoryMaxScores[categoryMaxScores] || 0) + 10; // Assuming 10 is max per question

    // Overall metrics
    totalScore += option.score;
    maxPossibleScore += 10;

    // Check for critical HR flag (Risk Override)
    if (option.hr_flag) {
      requiresHREscalation = true;
    }

    // Dynamic Recommendations based on high-risk answers
    if (option.score >= 5 && option.text.includes('No') || option.score >= 7) {
      recommendations.push(`Improvement needed for: ${question.text}`);
    }
  });

  // Normalise scores to 0-100 scale
  const finalScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  
  // Normalise category scores
  Object.keys(categoryScores).forEach((cat) => {
    categoryScores[cat] = (categoryScores[cat] / categoryMaxScores[cat]) * 100;
  });

  // Determine Risk Level
  let riskLevel: RiskLevel = 'low';
  if (requiresHREscalation || finalScore > RISK_THRESHOLDS.HIGH) {
    riskLevel = 'critical';
  } else if (finalScore > RISK_THRESHOLDS.MEDIUM) {
    riskLevel = 'high';
  } else if (finalScore > RISK_THRESHOLDS.LOW) {
    riskLevel = 'medium';
  }

  return {
    score: Math.round(finalScore),
    riskLevel,
    categoryScores,
    recommendations: Array.from(new Set(recommendations)),
    requiresHREscalation,
  };
}

/**
 * Returns the recommended reassessment interval based on risk level.
 */
export function getReassessmentInterval(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low': return '12 months';
    case 'medium': return '6 months';
    case 'high': return '3 months';
    case 'critical': return 'Immediate Review Required';
    default: return '12 months';
  }
}
