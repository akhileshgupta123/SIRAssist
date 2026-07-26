import React from 'react';
import { DashboardStats } from '../types';
import { Users, AlertTriangle, Copy, ClipboardCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  const cards = [
    {
      id: 'All',
      label: 'Total Electoral Records',
      value: stats.totalIncidents,
      icon: Users,
      color: 'text-[#0176d3]',
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-200',
      description: 'Ingested Draft Electoral Roll Records'
    },
    {
      id: 'Critical',
      label: 'High Anomaly Cases',
      value: stats.criticalRisks,
      icon: AlertTriangle,
      color: 'text-[#ba0517]',
      bgColor: 'bg-[#fededd]/40',
      borderColor: 'border-[#fcc2c1]',
      description: 'Logical Mismatches & Cluster Anomalies'
    },
    {
      id: 'Flagged Duplicate',
      label: 'Flagged Duplicate Voters',
      value: stats.flaggedDuplicates,
      icon: Copy,
      color: 'text-[#a04e00]',
      bgColor: 'bg-[#fff0c2]/50',
      borderColor: 'border-[#ffe399]',
      description: 'Cross-Constituency / Photo Matches'
    },
    {
      id: 'Field Verification Assigned',
      label: 'Pending BLO Audits',
      value: stats.pendingReviews,
      icon: ClipboardCheck,
      color: 'text-[#014486]',
      bgColor: 'bg-sky-50/60',
      borderColor: 'border-sky-200',
      description: 'Door-to-Door Field Officer Queue'
    },
    {
      id: 'Marked Valid',
      label: 'Marked Valid & Certified',
      value: stats.approvedResolved,
      icon: CheckCircle2,
      color: 'text-[#027e46]',
      bgColor: 'bg-[#e3f5ed]/60',
      borderColor: 'border-[#c3ebda]',
      description: 'ERO Certified Clean Electoral Roll'
    },
    {
      id: 'aiConfidence',
      label: 'AI Verification Confidence',
      value: `${stats.aiAvgConfidence}%`,
      icon: ShieldCheck,
      color: 'text-[#0176d3]',
      bgColor: 'bg-indigo-50/50',
      borderColor: 'border-indigo-200',
      description: 'Gemini 3.6 Flash Accuracy'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => card.id !== 'aiConfidence' && onFilterChange(card.id)}
            className={`p-3.5 rounded-lg border transition-all duration-150 cursor-pointer relative overflow-hidden bg-white shadow-sm ${
              isActive
                ? 'border-[#0176d3] ring-2 ring-[#0176d3]/20 bg-blue-50/20'
                : 'border-[#dddbda] hover:border-slate-300 hover:shadow'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{card.value}</p>
              </div>
              <div className={`p-2 rounded-md ${card.bgColor} border ${card.borderColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
};
