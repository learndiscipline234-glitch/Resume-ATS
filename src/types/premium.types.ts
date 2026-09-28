// Premium AI SaaS UI Type Definitions

export interface ThemeConfig {
  colors: {
    background: string;      // #0B0F1A
    neonGreen: string;       // #B6FF00
    cardBackground: string;  // rgba(26, 31, 46, 0.6)
    textPrimary: string;     // #FFFFFF
    textSecondary: string;   // rgba(255, 255, 255, 0.7)
    border: string;          // rgba(182, 255, 0, 0.2)
  };
  effects: {
    glassBlur: string;       // backdrop-blur-md
    glowShadow: string;      // 0 0 20px rgba(182, 255, 0, 0.3)
    hoverGlow: string;       // 0 0 30px rgba(182, 255, 0, 0.5)
  };
  animations: {
    fadeIn: string;
    slideUp: string;
    float: string;
    orbitGlow: string;
  };
}

export interface FeatureCardData {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
  color?: string;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;  // 0-10
  requiredLevel: number; // 0-10
  priority: 'high' | 'medium' | 'low';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface KPI {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export interface AnalyticsData {
  placementProbability: number;  // 0-100
  skillGaps: SkillGap[];
  trendingRoles: string[];
  chartData: ChartDataPoint[];
  kpis: KPI[];
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface FooterLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

// Component Props Interfaces

export interface AnimatedGridBackgroundProps {
  className?: string;
  gridColor?: string;
  glowColor?: string;
}

export interface GlassmorphismCardProps {
  children?: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export interface HeroSectionProps {
  onAnalyzeClick: () => void;
  onDashboardClick: () => void;
}

export interface FeatureCardsSectionProps {
  features: FeatureCardData[];
}

export interface DashboardPreviewCardProps {
  placementProbability: number;
  skillGaps: string[];
  trendingRoles: string[];
  className?: string;
}

export interface AnalyticsPreviewSectionProps {
  barChartData: ChartDataPoint[];
  placementScore: number;
  skillHeatmapData: any[];
  kpiData: KPI[];
}

export interface HowItWorksSectionProps {
  steps: Step[];
}

export interface DBMSSecuritySectionProps {
  features: SecurityFeature[];
  layout?: 'timeline' | 'grid';
}

export interface PremiumFooterProps {
  logo: React.ReactNode;
  tagline: string;
  links: FooterLink[];
}

export interface PlacementGaugeProps {
  probability: number;
  className?: string;
}

export interface AnimatedKPIProps {
  value: number;
  label: string;
  suffix?: string;
  className?: string;
}
