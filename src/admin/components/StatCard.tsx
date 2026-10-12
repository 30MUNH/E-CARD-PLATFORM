import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  accentClassName: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  accentClassName,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentClassName}`}>
        {icon}
      </div>
    </div>
  );
};
