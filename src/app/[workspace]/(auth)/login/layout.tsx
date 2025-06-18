import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
  keywords: 'Login, financial management, dashboard',
  openGraph: {
    title: 'Login',
    description: 'Login to your account',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login',
    description: 'Login to your account',
  },
};

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className='w-full'>{children}</div>;
};

export default LoginLayout;
