import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ComparisonData {
  skill: string;
  userScore: number;
  suggestedScore: number;
  type: 'existing' | 'suggested';
}

interface SkillsComparisonChartProps {
  data: ComparisonData[];
}

export function SkillsComparisonChart({ data }: SkillsComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No data available for comparison</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="skill" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis 
            domain={[0, 100]}
            label={{ value: 'Skill Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value, name) => [
              `${value}/100`, 
              name === 'userScore' ? 'Your Score' : 'Suggested Score'
            ]}
            labelFormatter={(label) => `Skill: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="userScore" 
            fill="#10b981" 
            name="Your Score"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="suggestedScore" 
            fill="#3b82f6" 
            name="Suggested Score"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Alternative chart types you can implement:

// 1. Radar Chart Comparison
export function SkillsRadarComparison({ data }: SkillsComparisonChartProps) {
  // Implementation for radar chart showing user vs suggested skills
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        {/* Radar chart implementation */}
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Radar chart implementation coming soon</p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Scatter Plot for Skill Gap Analysis
export function SkillsGapAnalysis({ data }: SkillsComparisonChartProps) {
  // Implementation for scatter plot showing skill gaps
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        {/* Scatter plot implementation */}
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Scatter plot implementation coming soon</p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Priority-based Skill Roadmap
export function SkillsRoadmap({ data }: SkillsComparisonChartProps) {
  // Implementation for skill roadmap based on priority
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        {/* Roadmap implementation */}
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Skills roadmap implementation coming soon</p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
