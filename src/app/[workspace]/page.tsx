'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
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
    <div className='min-h-screen bg-gray-50'>
      <div className='py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center'>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-3xl font-extrabold text-gray-900 sm:text-4xl'
            >
              {workspace} Workspace
            </motion.h1>
            <p className='mt-4 text-xl text-gray-500'>
              Welcome to your workspace. Access your projects, leads, and more.
            </p>

            {/* PWA Installation Banner */}
            {!isInstalled && installPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm'
              >
                <div className='flex flex-col sm:flex-row items-center justify-between'>
                  <div className='mb-4 sm:mb-0'>
                    <h3 className='text-lg font-medium text-blue-800'>
                      Install {workspace} Workspace
                    </h3>
                    <p className='text-blue-600'>
                      Install this workspace as a standalone app for easier access
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                      />
                    </svg>
                    Install App
                  </button>
                </div>
              </motion.div>
            )}

            {/* Workspace Sections */}
            <div className='mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              {/* Projects Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  return navigateToSection('projects');
                }}
                className='bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200'
              >
                <div className='h-12 w-12 mx-auto bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Projects</h3>
                <p className='text-gray-600'>Manage all your projects and tasks in one place</p>
              </motion.div>

              {/* Leads Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  return navigateToSection('leads');
                }}
                className='bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200'
              >
                <div className='h-12 w-12 mx-auto bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Leads</h3>
                <p className='text-gray-600'>
                  Track and manage potential clients and opportunities
                </p>
              </motion.div>
            </div>

            {isInstalled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='mt-12 text-green-600 flex items-center justify-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                App Installed
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
