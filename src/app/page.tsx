import MainHome from '@/components/home/MainHome';
import { headers } from 'next/headers';

interface HomePageProps {
  searchParams: Promise<{ workspace?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Parse subdomain to get workspace
  const domainParts = hostname.split('.');
  const subdomain = domainParts[0];
  const isMainDomain = domainParts.length === 2;
  const isWWW = subdomain === 'www';
  const workspaceSlug = isWWW
    ? hostname.replace('www.', '').replace('.com', '')
    : isMainDomain
    ? hostname.replace('.com', '')
    : subdomain;

  const isCustomSubdomain =
    process.env.NODE_ENV === 'production'
      ? !['localhost:3000', 'pulse-app', 'hourblock'].includes(workspaceSlug)
      : true;

  return (
    <MainHome resolvedSearchParams={resolvedSearchParams} isCustomSubdomain={isCustomSubdomain} />
  );
}
