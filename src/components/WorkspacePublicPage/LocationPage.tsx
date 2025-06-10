'use client';

import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';
import '@/styles/workspace-public.css';
import Link from 'next/link';
import React from 'react';
import { ContactSection, GoogleReviewsSection, HeroSection, ServiceSection } from './sections';

interface LocationPageProps {
  workspace: string;
  locationSlug: string;
  cmsData: WorkspaceCMSData;
  pageData: EnhancedCMSPage;
}

export default function LocationPage({
  workspace,
  locationSlug,
  cmsData,
  pageData,
}: LocationPageProps) {
  // Add smooth scrolling to the document
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const { settings, navigation } = cmsData;
  const { sections, locationData } = pageData;

  // Get theme colors from CMS settings
  const primaryColor = settings.theme?.primaryColor || '#7C3AED';
  const secondaryColor = settings.theme?.secondaryColor || '#2563EB';

  // Helper function to get section ID based on type
  const getSectionId = (section: any) => {
    switch (section.type) {
      case 'heroSection':
        return 'home';
      case 'serviceSection':
        return 'services';
      case 'contactSection':
        return 'contact';
      case 'googleReviewsSection':
        return 'reviews';
      default:
        return section.type;
    }
  };

  // Helper function to render sections based on type
  const renderSection = (section: any) => {
    const commonProps = { primaryColor, secondaryColor };
    const sectionId = getSectionId(section);

    switch (section.type) {
      case 'heroSection':
        return (
          <HeroSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            buttonText={section.data.buttonText}
            buttonUrl={section.data.buttonUrl}
            backgroundImage={section.data.backgroundImage}
            variant={section.variant}
            highlights={section.data.highlights}
            {...commonProps}
          />
        );
      case 'serviceSection':
        return (
          <ServiceSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            services={section.data.services}
            variant={section.variant}
            columns={section.columns}
            primaryColor={primaryColor}
          />
        );
      case 'contactSection':
        return (
          <ContactSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            contact={section.data.contact}
            testimonials={section.data.testimonials}
            variant={section.variant}
            layout={section.layout}
            primaryColor={primaryColor}
          />
        );
      case 'googleReviewsSection':
        return (
          <GoogleReviewsSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            reviews={section.data.reviews}
            showGoogleBadge={section.data.showGoogleBadge}
            averageRating={section.data.averageRating}
            totalReviews={section.data.totalReviews}
            primaryColor={primaryColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='workspace-public-page min-h-screen w-full' style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className='shadow-sm border-b'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center justify-between h-16'>
              <div className='sitename font-bold text-xl' style={{ color: primaryColor }}>
                {settings.siteName}
              </div>
              <div className='hidden md:flex space-x-8'>
                {navigation.map((item) => {
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      className='text-gray-600 hover:text-gray-900 transition-colors'
                      target={item.target}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Location Header */}
      {locationData && (
        <div className='bg-gray-100 py-4'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center text-sm text-gray-600'>
              <Link href='/' className='hover:underline'>
                Home
              </Link>
              <span className='mx-2'>›</span>
              <Link href='/locations' className='hover:underline'>
                Locations
              </Link>
              <span className='mx-2'>›</span>
              <span className='font-medium'>
                {locationData.city}, {locationData.province}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Render all sections */}
      {sections
        .sort((a, b) => {
          return a.order - b.order;
        })
        .map(renderSection)}

      {/* Location-specific footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid md:grid-cols-3 gap-8'>
              <div>
                <h3 className='text-xl font-bold mb-4' style={{ color: primaryColor }}>
                  {locationData?.city} Office
                </h3>
                <p className='text-gray-300 mb-4'>
                  Serving {locationData?.city} and surrounding areas with professional resume
                  writing services.
                </p>
                {locationData?.serviceAreas && (
                  <div>
                    <h4 className='font-semibold mb-2'>Service Areas:</h4>
                    <div className='grid grid-cols-2 gap-1 text-sm text-gray-400'>
                      {locationData.serviceAreas.map((area, index) => {
                        return <div key={index}>• {area}</div>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className='text-xl font-bold mb-4' style={{ color: primaryColor }}>
                  Quick Contact
                </h3>
                <div className='space-y-2 text-gray-300'>
                  <div>📞 {settings.contact?.phone}</div>
                  <div>✉️ {settings.contact?.email}</div>
                  <div className='pt-4'>
                    <a
                      href={`tel:${settings.contact?.phone?.replace(/\D/g, '') || '4377743721'}`}
                      className='inline-block px-6 py-2 rounded font-semibold transition-colors'
                      style={{ backgroundColor: primaryColor, color: 'white' }}
                    >
                      Call Now
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-xl font-bold mb-4' style={{ color: primaryColor }}>
                  Other Locations
                </h3>
                <div className='space-y-2'>
                  {navigation
                    .filter((item) => {
                      return item.url.startsWith('/locations/') && !item.url.includes(locationSlug);
                    })
                    .map((item) => {
                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          className='block text-gray-300 hover:text-white transition-colors'
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className='border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm'>
              <p>&copy; 2024 {settings.siteName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
