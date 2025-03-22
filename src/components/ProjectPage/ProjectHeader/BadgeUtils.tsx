import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Role } from './types';

interface BadgeUtilsProps {
  predefinedRoles: Role[];
}

export function useBadgeUtils({ predefinedRoles }: BadgeUtilsProps) {
  const getStatusBadge = (status: 'active' | 'pending' | 'inactive') => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className='h-3 w-3 mr-1' />,
      },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className='h-3 w-3 mr-1' /> },
      inactive: {
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className='h-3 w-3 mr-1' />,
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant='outline' className={`flex items-center ${config.color} font-normal`}>
        {config.icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    );
  };

  const getRoleBadge = (roleName: string) => {
    const role = predefinedRoles.find((r) => {
      return r.name === roleName;
    });

    // Default colors for standard roles if not found in predefinedRoles
    const defaultColors = {
      CLIENT: 'bg-blue-100 text-blue-800',
      COLLABORATOR: 'bg-indigo-100 text-indigo-800',
      'TEAM MEMBER': 'bg-green-100 text-green-800',
      moderator: 'bg-purple-100 text-purple-800',
    };

    const badgeColor = role ? role.color : defaultColors[roleName] || 'bg-gray-100 text-gray-800';

    return (
      <Badge variant='outline' className={`${badgeColor} font-normal capitalize`}>
        {roleName || 'Client'}
      </Badge>
    );
  };

  return {
    getStatusBadge,
    getRoleBadge,
  };
}
