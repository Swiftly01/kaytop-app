import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';

export interface LeaderboardEntry {
  rank: number;
  branchName: string;
  branchId: string;
  value: number;
  change: number;
  changeLabel?: string;
  isCurrency?: boolean;
}

export interface PerformanceLeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
  isLoading?: boolean;
  onRowClick?: (entry: LeaderboardEntry) => void;
}

export const PerformanceLeaderboard: React.FC<PerformanceLeaderboardProps> = ({
  entries,
  title,
  isLoading = false,
  onRowClick
}) => {
  const formatValue = (value: number, isCurrency?: boolean): string => {
    if (isCurrency) {
      return formatCurrency(value);
    }
    return value.toLocaleString('en-US');
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? '#5CC47C' : '#E43535';
  };

  const getChangePrefix = (change: number): string => {
    return change >= 0 ? '+' : '-';
  };

  const getRankIcon = (rank: number) => {
    const colors = {
      1: '#FFD700', // Gold
      2: '#C0C0C0', // Silver
      3: '#CD7F32'  // Bronze
    };
    
    const color = colors[rank as keyof typeof colors] || '#6B7280';
    
    return (
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: color }}
      >
        {rank}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-[#EAECF0]">
        <div className="p-6 border-b border-[#EAECF0]">
          <h3 className="text-lg font-semibold text-[#101828]">{title}</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#EAECF0]">
      {/* Header */}
      <div className="p-6 border-b border-[#EAECF0]">
        <h3 className="text-lg font-semibold text-[#101828]">{title}</h3>
        <p className="text-sm text-[#475467] mt-1">
          Top performing branches ranked by performance metrics
        </p>
      </div>

      {/* Leaderboard Content */}
      <div className="p-6">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-[#F9F5FF] rounded-lg flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                  stroke="#7F56D9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">
              No performance data available
            </h4>
            <p className="text-sm text-gray-500">
              Calculate ratings to see branch performance rankings
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={`${entry.branchId}-${entry.rank}`}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  onRowClick 
                    ? 'cursor-pointer hover:bg-gray-50 hover:border-[#7F56D9]' 
                    : ''
                } ${entry.rank <= 3 ? 'bg-gradient-to-r from-[#F9F5FF] to-white' : 'bg-gray-50'}`}
                onClick={() => onRowClick?.(entry)}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  {getRankIcon(entry.rank)}
                  
                  {/* Branch Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#101828]">
                      {entry.branchName}
                    </h4>
                    <p className="text-xs text-[#475467]">
                      {entry.branchId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Performance Value */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[#101828]">
                      {formatValue(entry.value, entry.isCurrency)}
                    </div>
                    <div 
                      className="text-sm font-medium"
                      style={{ color: getChangeColor(entry.change) }}
                    >
                      {getChangePrefix(entry.change)}
                      {Math.abs(entry.change).toFixed(1)}% This Month
                    </div>
                  </div>

                  {/* Arrow for clickable rows */}
                  {onRowClick && (
                    <div className="text-[#475467]">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M7.5 15L12.5 10L7.5 5"
                          stroke="currentColor"
                          strokeWidth="1.67"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-6 py-4 border-t border-[#EAECF0] bg-gray-50">
          <p className="text-xs text-[#475467] text-center">
            Showing top {entries.length} performing branches • Updated {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};