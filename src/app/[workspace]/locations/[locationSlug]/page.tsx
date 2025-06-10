import WorkspacePublicPage from '@/components/WorkspacePublicPage';
import { hasLocationPage } from '@/lib/cms';
import { notFound } from 'next/navigation';

interface LocationPageProps {
  params: Promise<{
    workspace: string;
    locationSlug: string;
  }>;
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { workspace, locationSlug } = await params;

  // Check if the location page exists for this workspace
  const locationExists = await hasLocationPage(workspace, locationSlug);

  if (!locationExists) {
    notFound();
  }

  return (
    <WorkspacePublicPage workspace={workspace} pageType='location' locationSlug={locationSlug} />
  );
}
