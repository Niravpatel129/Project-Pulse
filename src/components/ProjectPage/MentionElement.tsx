import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionElementProps {
  userId: string;
  userDetails?: UserDetails;
  children: React.ReactNode;
}

export function MentionElement({ userId, userDetails, children }: MentionElementProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className='cursor-pointer text-blue-500 hover:underline'>{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        {userDetails ? (
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
          <p className='text-sm text-gray-500'>User not found</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
