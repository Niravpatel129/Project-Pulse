'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Function to determine if a path is active
  const isActive = (path: string) => {
    if (path === 'leads') {
      // For the main leads route, it should be active only when directly on the leads page
      return pathname.endsWith('/leads') || pathname === `${basePath}/leads`;
    }
    // For other routes, check if the pathname includes the path segment
    return pathname.includes(`/leads/${path}`);
  };

  // Extract the base workspace path
  const basePathArray = pathname.split('/leads');
  const basePath = basePathArray[0];

  // Check if we're on a form page
  const isFormPage = pathname.includes('/leads/form');

  // Don't show navigation on form pages
  if (isFormPage) {
    return <div className='bg-background'>{children}</div>;
  }

  return (
    <div className='bg-background'>
      {/* Navigation */}
      <div className='border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-8 gap-4'>
            <Link
              href={`${basePath}/leads`}
              className={`py-4 font-medium ${
                isActive('leads')
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
            {process.env.NODE_ENV !== 'production' && (
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
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
