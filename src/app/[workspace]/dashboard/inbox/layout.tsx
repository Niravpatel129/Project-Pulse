import { Metadata } from 'next';

type Props = {
  params: { workspace: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.workspace} - Inbox`,
    description: 'Manage your messages and communications in one place',
    openGraph: {
      title: `${params.workspace} - Inbox`,
      description: 'Manage your messages and communications in one place',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${params.workspace} - Inbox`,
      description: 'Manage your messages and communications in one place',
    },
  };
}

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
