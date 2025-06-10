import WorkspacePublicPage from '@/components/WorkspacePublicPage';
import { getWorkspaceConfig } from '@/utils/workspace';
import { headers } from 'next/headers';

export default async function HomePage() {
  // Get the hostname from headers to determine workspace
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Parse subdomain to get workspace
  const subdomain = hostname.split('.')[0];
  const isCustomSubdomain =
    process.env.NODE_ENV === 'production'
      ? !['www', 'localhost:3000', 'pulse-app', 'hourblock'].includes(subdomain)
      : true;

  // If we have a custom subdomain/domain (workspace), show their public branded page
  if (isCustomSubdomain) {
    // TESTING: Override workspaceSlug to "bolocreate"
    const testWorkspaceSlug = 'bolocreate';

    // Fetch workspace data from backend
    const workspaceData = await getWorkspaceConfig(testWorkspaceSlug);
    return <WorkspacePublicPage workspace={testWorkspaceSlug} data={workspaceData} />;
  }

  // If no workspace subdomain, show workspace selection/onboarding
  return <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>Hi!</div>;
}
