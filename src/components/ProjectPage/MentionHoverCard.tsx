import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionHoverCardProps {
  userId: string;
  children: React.ReactNode;
}

export function MentionHoverCard({ userId, children }: MentionHoverCardProps) {
  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await newRequest.get(`/workspaces/user/${userId}`);
      return response.data.data as UserDetails;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className='cursor-pointer text-blue-500 hover:underline'>{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        {isLoading ? (
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[200px]' />
                <Skeleton className='h-4 w-[150px]' />
              </div>
            </div>
          </div>
        ) : userDetails ? (
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <Avatar>
                <AvatarImage src={userDetails.avatar} />
                <AvatarFallback>{userDetails.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className='text-sm font-semibold'>{userDetails.name}</h4>
                <p className='text-sm text-gray-500'>{userDetails.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-sm text-gray-500'>User not found</div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
