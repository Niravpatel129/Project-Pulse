'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noindex?: boolean;
}

export function SEO({
  title = 'Pulse Dashboard',
  description = 'A modern dashboard for project management and analytics',
  keywords = ['dashboard', 'project management', 'analytics'],
  ogImage = '/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  noindex = false,
}: SEOProps) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pulse-dashboard.com';
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`;

  const formattedTitle = `${title} | Pulse Dashboard`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords.join(', ')} />
      {noindex && <meta name='robots' content='noindex,nofollow' />}

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={ogType} />
      <meta property='og:url' content={fullUrl} />
      <meta property='og:title' content={formattedTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={`${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta name='twitter:card' content={twitterCard} />
      <meta name='twitter:url' content={fullUrl} />
      <meta name='twitter:title' content={formattedTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${siteUrl}${ogImage}`} />

      {/* Canonical Link */}
      <link rel='canonical' href={fullUrl} />

      {/* Favicon */}
      <link rel='icon' href='/favicon.ico' />
    </Head>
  );
}
