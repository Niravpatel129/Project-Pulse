import { Badge } from '@/components/ui/badge';

export type StatusType =
  | 'paid'
  | 'draft'
  | 'overdue'
  | 'overpaid'
  | 'partially_paid'
  | 'sent'
  | 'pending'
  | 'open'
  | string;

export const getStatusColor = (status: StatusType) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-500/10 text-green-500';
    case 'draft':
      return 'bg-gray-500/10 text-gray-500';
    case 'overdue':
      return 'bg-red-500/10 text-red-500';
    case 'overpaid':
      return 'bg-blue-500/10 text-blue-500';
    case 'partially_paid':
      return 'bg-orange-500/10 text-orange-500';
    case 'sent':
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'open':
      return 'bg-purple-500/10 text-purple-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant='secondary'
      className={`${getStatusColor(status)} text-xs px-2 py-0.5 capitalize rounded-sm ${className}`}
    >
      {formattedStatus?.replace('_', ' ')}
    </Badge>
  );
}
