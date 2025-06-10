'use client';
import '@/styles/workspace-public.css';
import { WorkspacePublicPageProps } from '@/types/workspace';
import { buildNavigationTree } from '@/utils/cms';
import React from 'react';
import { mockCMSData } from './mockData';
import {
  ClientsSection,
  FooterSection,
  HeroSection,
  OutcomesSection,
  ServiceSection,
  SocialsSection,
  StorySection,
} from './sections';

export default function WorkspacePublicPage({ workspace, data }: WorkspacePublicPageProps) {
  console.log('🚀 data:', data);

  // Add smooth scrolling to the document
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Use mock data instead of backend data
  const overriddenData = mockCMSData;

  // Use CMS settings if available, otherwise fall back to workspace data or defaults
  const siteName =
    overriddenData?.settings?.siteName || workspace.charAt(0).toUpperCase() + workspace.slice(1);
  const description =
    overriddenData?.settings?.siteDescription ||
    'Your trusted partner for exceptional service and solutions';
  const about =
    overriddenData?.about ||
    `We are dedicated to providing exceptional service and innovative solutions that help
              our clients achieve their goals. With years of experience and a commitment to
              excellence, we're here to support your success.`;

  // Get theme colors from CMS settings
  const primaryColor = overriddenData?.settings?.theme?.primaryColor || '#7C3AED';
  const secondaryColor = overriddenData?.settings?.theme?.secondaryColor || '#2563EB';

  // Get contact info from CMS settings
  const contact = overriddenData?.settings?.contact;
  const social = overriddenData?.settings?.socialMedia;

  // Get navigation from CMS or use defaults - convert navigation for buildNavigationTree
  const navigation = overriddenData?.cms?.navigation
    ? buildNavigationTree(
        overriddenData.cms.navigation.map((nav) => {
          return {
            ...nav,
            id: nav.id.toString(),
          };
        }),
      )
    : [];

  // Helper function to get section ID based on type
  const getSectionId = (section: any) => {
    switch (section.type) {
      case 'heroSection':
        return 'home';
      case 'serviceSection':
        return 'services';
      case 'storySection':
        return 'about';
      case 'footerSection':
        return 'contact';
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
            buttonText={section.buttonText}
            buttonUrl={section.buttonUrl}
            {...commonProps}
          />
        );
      case 'clientsSection':
        return (
          <ClientsSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            clients={section.clients}
          />
        );
      case 'serviceSection':
        return (
          <ServiceSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            services={section.services}
          />
        );
      case 'outcomesSection':
        return (
          <OutcomesSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            outcomes={section.outcomes}
            {...commonProps}
          />
        );
      case 'storySection':
        return (
          <StorySection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            story={section.story}
            {...commonProps}
          />
        );
      case 'socialsSection':
        return (
          <SocialsSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            socialLinks={section.socialLinks}
            testimonials={section.testimonials}
            {...commonProps}
          />
        );
      case 'footerSection':
        return (
          <FooterSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            contact={section.contact}
            quickLinks={section.quickLinks}
            legalLinks={section.legalLinks}
            siteName={siteName}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='workspace-public-page min-h-screen' style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className='bg-white shadow-sm border-b'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center justify-between h-16'>
              <div className='sitename font-bold text-xl' style={{ color: primaryColor }}>
                {siteName}
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

      {/* Render all sections */}
      {overriddenData?.cms?.sections?.map(renderSection)}
    </div>
  );
}
