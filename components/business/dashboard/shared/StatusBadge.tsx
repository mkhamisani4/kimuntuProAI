'use client';

import { CheckCircle, Clock, AlertCircle, Loader2, FileText } from 'lucide-react';

export type StatusType = 'ready' | 'generating' | 'failed' | 'draft' | 'completed';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs: Record<StatusType, {
    icon: typeof CheckCircle;
    label: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
    animate?: boolean;
  }> = {
    ready: {
      icon: CheckCircle,
      label: 'Ready',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    generating: {
      icon: Loader2,
      label: 'Generating',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      animate: true
    },
    failed: {
      icon: AlertCircle,
      label: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    },
    draft: {
      icon: FileText,
      label: 'Draft',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600'
    }
  };

  const config = configs[status] || configs.ready;
  const Icon = config.icon;

  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} ${config.bgColor} ${config.textColor} ${textSize} font-medium rounded-full`}>
      <Icon
        size={iconSize}
        className={`${config.iconColor} ${config.animate ? 'animate-spin' : ''}`}
      />
      {config.label}
    </span>
  );
}
