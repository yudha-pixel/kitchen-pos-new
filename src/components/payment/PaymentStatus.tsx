'use client';

import { PaymentTransaction } from '@/src/lib/db';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusProps {
  payment: PaymentTransaction;
}

export function PaymentStatus({ payment }: PaymentStatusProps) {
  const getStatusConfig = () => {
    switch (payment.status) {
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Lunas',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Gagal',
        };
      case 'expired':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          label: 'Expired',
        };
      case 'pending':
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Pending',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${config.bgColor} px-3 py-2 rounded-lg`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
