'use client';

import InvoicesList from '@/components/InvoicesList';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const workspace = params.workspace as string;

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for PWA install event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
  }, []);

  // Handle PWA installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;

    // We've used the prompt, and can't use it again, so clear it
    setInstallPrompt(null);
  };

  // Navigate to the appropriate workspace page based on subdomain
  const navigateToSection = (section: string) => {
    router.push(`/${workspace}/${section}`);
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto px-4 py-8'>
        <InvoicesList />
      </div>
      {/* New Project Dialog */}
      {/* <ProjectDialog /> */}
    </div>
  );
}
