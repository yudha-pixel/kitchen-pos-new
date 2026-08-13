'use client';

import React from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export interface KpiCardItem {
  label: string;
  count: number;
  subValue?: string;
  variant?: 'total' | 'pending' | 'approved' | 'rejected';
}

interface TableKpiCardsProps {
  cards: KpiCardItem[];
}

export function TableKpiCards({ cards }: TableKpiCardsProps) {
  const getVariantStyles = (variant: KpiCardItem['variant'] = 'total') => {
    switch (variant) {
      case 'pending':
        return {
          icon: Clock,
          iconClass: 'text-amber-500 bg-amber-500/10',
          badgeClass: 'border-amber-500/20 text-amber-600 dark:text-amber-400',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          iconClass: 'text-emerald-500 bg-emerald-500/10',
          badgeClass: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconClass: 'text-rose-500 bg-rose-500/10',
          badgeClass: 'border-rose-500/20 text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          icon: FileText,
          iconClass: 'text-primary bg-primary-soft',
          badgeClass: 'border-line text-ink',
        };
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {cards.map((card, idx) => {
        const { icon: Icon, iconClass } = getVariantStyles(card.variant);
        return (
          <div
            key={idx}
            className="bg-surface border border-line rounded-lg p-3 sm:p-4 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{card.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg sm:text-xl font-bold text-ink">{card.count}</span>
                {card.subValue && (
                  <span className="text-xs font-medium text-ink-secondary truncate">{card.subValue}</span>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg shrink-0 ${iconClass}`}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
