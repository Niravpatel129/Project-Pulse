'use client';

import { useWorkspaceCMS } from '@/contexts/WorkspaceCMSContext';
import '@/styles/workspace-public.css';
import React from 'react';
import {
  ClientsSection,
  ContactSection,
  FooterSection,
  GoogleReviewsSection,
  HeroSection,
  OutcomesSection,
  ServiceSection,
  SocialsSection,
  StorySection,
} from './sections';
import OnboardingSheet from './sections/OnboardingSheet';

export default function HomePage() {
  const { cmsData, pageData } = useWorkspaceCMS();

  // Add smooth scrolling to the document
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const { settings, navigation } = cmsData;

  // Get theme colors from CMS settings
  const primaryColor = settings.theme?.primaryColor || '#000000';
  const secondaryColor = settings.theme?.secondaryColor || '#000000';
  const contentPrimary = settings.theme?.content?.primary || '#000000';
  const contentSecondary = settings.theme?.content?.secondary || '#000000';

  // State for onboarding sheet
  const [showSheet, setShowSheet] = React.useState(false);
  const onOpenOnboardingSheet = () => {
    return setShowSheet(true);
  };

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
            buttonAction={section.data.buttonAction}
            backgroundImage={section.data.backgroundImage}
            variant={section.variant}
            highlights={section.data.highlights}
            buttons={section.data.buttons}
            showSheet={showSheet}
            setShowSheet={setShowSheet}
            onOpenOnboardingSheet={onOpenOnboardingSheet}
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
            showSheet={showSheet}
            setShowSheet={setShowSheet}
            onOpenOnboardingSheet={onOpenOnboardingSheet}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className='workspace-public-page min-h-screen w-full bg-[#f5f4f0]'
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className='bg-[#f5f4f0] absolute top-0 left-0 right-0 z-10'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center justify-between h-16'>
              <div className='sitename font-bold text-xl' style={{ color: contentPrimary }}>
                {settings.siteName}
              </div>
              <div className='hidden md:flex space-x-8'>
                {navigation.map((item) => {
                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      className='text-[#222222] hover:text-gray-900 transition-colors font-semibold text-sm'
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
      {pageData.sections
        .sort((a, b) => {
          return a.order - b.order;
        })
        .map(renderSection)}

      {/* Global OnboardingSheet */}
      <OnboardingSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        buttons={
          pageData.sections.find((s) => {
            return s.type === 'heroSection';
          })?.data.buttons || []
        }
      />
    </div>
  );
}
