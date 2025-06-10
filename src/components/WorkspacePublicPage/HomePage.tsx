'use client';

import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';
import '@/styles/workspace-public.css';
import React from 'react';
import {
  ClientsSection,
  ContactSection,
  FooterSection,
  HeroSection,
  OutcomesSection,
  ServiceSection,
  SocialsSection,
  StorySection,
} from './sections';

interface HomePageProps {
  workspace: string;
  cmsData: WorkspaceCMSData;
  pageData: EnhancedCMSPage;
}

export default function HomePage({ workspace, cmsData, pageData }: HomePageProps) {
  // Add smooth scrolling to the document
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const { settings, navigation } = cmsData;
  const { sections } = pageData;

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
      case 'clientsSection':
        return (
          <ClientsSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            clients={section.data.clients}
          />
        );
      case 'outcomesSection':
        return (
          <OutcomesSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            outcomes={section.data.outcomes}
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
            story={section.data.story}
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
            socialLinks={section.data.socialLinks}
            testimonials={section.data.testimonials}
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
            contact={section.data.contact}
            quickLinks={section.data.quickLinks}
            legalLinks={section.data.legalLinks}
            siteName={settings.siteName}
            {...commonProps}
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
        <nav className='bg-transparent shadow-sm border-b'>
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
      {/* Render all sections */}
      {sections
        .sort((a, b) => {
          return a.order - b.order;
        })
        .map(renderSection)}
    </div>
  );
}
