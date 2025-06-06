import { Metadata } from 'next';

type Props = {
  params: Promise<{ workspace: string; state: string; selectedEmailId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspace } = await params;

  return {
    title: `${workspace} - Inbox`,
    description: 'Manage your messages and communications in one place',
    openGraph: {
      title: `${workspace} - Inbox`,
      description: 'Manage your messages and communications in one place',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${workspace} - Inbox`,
      description: 'Manage your messages and communications in one place',
    },
  };
}

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
