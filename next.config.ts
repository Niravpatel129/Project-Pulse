import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
};

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'picsum.photos',
      'images.unsplash.com',
      'firebasestorage.googleapis.com',
      'i.ibb.co',
      'cdn.sanity.io',
      'vercel.com',
      'img.freepik.com',
    ],
  },
};

export default withPWA(pwaConfig)(nextConfig);
