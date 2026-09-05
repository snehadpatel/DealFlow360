export type RecommendationType =
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'COMPLEMENTARY'
  | 'ALTERNATIVE';

export interface AIRecommendation {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  price: number;
  suggestedPrice?: number;
  recommendationType: RecommendationType;
  reason: string;
  pitch?: string;
  confidence: number; // 0.0 - 1.0 or 0 - 100
  potentialValue?: string | number;
  marginImpact?: string;
  marginPct?: number;
  lift?: number;
  support?: number;
  promotionTag?: string;
  promotionFlag?: boolean;
}

export interface RecommendationResponse {
  recommendations: AIRecommendation[];
  basis?: {
    transactionsAnalyzed: number;
    rulesMined: number;
    method: string;
    llmUsed: boolean;
  };
  llmUsed?: boolean;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  name: string;
  label: string;
  level: RiskLevel;
  score?: number;
  description?: string;
}

export interface DealAnomaly {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  detectedAt?: string;
  anomalousLine?: string;
  stats?: {
    value?: number;
    baselineMean?: number;
    zScore?: number;
    modifiedZScore?: number;
  };
  isStalled?: boolean;
  daysStale?: number;
}

export interface HealthFeature {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  detail: string;
}

export interface DealHealth {
  dealId: string;
  overallScore: number;
  score?: number;
  band: 'GREEN' | 'AMBER' | 'RED';
  riskLevel: RiskLevel;
  winProbability?: number;
  expectedValue?: number;
  lastUpdated?: string;
  features: HealthFeature[];
  llmUsed?: boolean;
}

export interface AIRecommendedAction {
  action: string;
  summary: string;
  actionType: 'REVIEW_DISCOUNT' | 'REQUEST_APPROVAL' | 'CONTACT_CUSTOMER' | 'ADJUST_QUOTE' | 'CONTINUE';
  rationale?: string;
}

export interface DealInsight {
  dealId: string;
  dealHealth: number;
  riskScore: number;
  riskLevel: RiskLevel;
  aiSummary: string;
  narrative?: string;
  recommendedAction: string;
  riskFactors: RiskFactor[];
  anomalies: DealAnomaly[];
  health: DealHealth;
  llmUsed?: boolean;
}
