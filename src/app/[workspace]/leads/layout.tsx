'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Function to determine if a path is active
  const isActive = (path: string) => {
    if (path === 'leads' && pathname.endsWith('/leads')) {
      return true;
    }
    return pathname.includes(`/${path}`);
  };

  // Extract the base workspace path
  const basePathArray = pathname.split('/leads');
  const basePath = basePathArray[0];

  return (
    <div className='bg-background'>
      {/* Navigation */}
      <div className='border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-8 gap-4'>
            <Link
              href={`${basePath}/leads`}
              className={`py-4 font-medium ${
                isActive('leads') && !isActive('submissions') && !isActive('settings')
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Forms
            </Link>
            <Link
              href={`${basePath}/leads/submissions`}
              className={`py-4 font-medium ${
                isActive('submissions')
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Submissions
            </Link>
            <Link
              href={`${basePath}/leads/settings`}
              className={`py-4 font-medium ${
                isActive('settings')
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
