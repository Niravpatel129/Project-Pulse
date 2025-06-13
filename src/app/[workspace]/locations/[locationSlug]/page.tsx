import WorkspacePublicPage from '@/components/WorkspacePublicPage';
import useGetWorkspaceFromUrl from '@/lib/cms/useGetWorkspaceFromUrl';
import { notFound } from 'next/navigation';

export default function LocationPage() {
  // const { workspace, locationSlug } = await params;
  const { cms, page, isLoading, error, locationExists, workspace, locationSlug } =
    useGetWorkspaceFromUrl();

  if (!locationExists) {
    notFound();
  }

  return (
    <WorkspacePublicPage
      workspace={workspace}
      pageType='location'
      locationSlug={locationSlug}
      cms={cms}
      page={page}
      isLoading={isLoading}
      error={error}
    />
  );
}
