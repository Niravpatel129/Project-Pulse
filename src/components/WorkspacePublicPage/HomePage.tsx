'use client';

import { useWorkspaceCMS } from '@/contexts/WorkspaceCMSContext';
import '@/styles/workspace-public.css';
import { motion } from 'framer-motion';
import React from 'react';
import {
  ClientsSection,
  ContactSection,
  FooterSection,
  GoogleReviewsSection,
  HeroSection,
  InstagramSection,
  OutcomesSection,
  ServiceSection,
  SocialsSection,
  StorySection,
  TeamSection,
} from './sections';
import OnboardingSheet from './sections/OnboardingSheet';

export default function HomePage() {
  const { cmsData, pageData } = useWorkspaceCMS();
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = React.useState(false);

  // Add mouse move handler
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      return window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Add rainbow animation styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rainbow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .rainbow-blur {
        background: linear-gradient(
          45deg,
          #ff0000,
          #ff7300,
          #fffb00,
          #48ff00,
          #00ffd5,
          #002bff,
          #7a00ff,
          #ff00c8,
          #ff0000
        );
        background-size: 400% 400%;
        animation: rainbow 8s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

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

  // Helper function to get section ID based on type
  const getSectionId = (section: any) => {
    switch (section.type) {
      case 'heroSection':
        return 'home';
      case 'serviceSection':
        return 'services';
      case 'storySection':
        return 'about';
      case 'teamSection':
        return 'team';
      case 'clientsSection':
        return 'clients';
      case 'googleReviewsSection':
        return 'reviews';
      case 'outcomesSection':
        return 'outcomes';
      case 'instagramSection':
        return 'gallery';

      default:
        return section.type.replace('Section', '').toLowerCase();
    }
  };

  // Helper function to get navigation label based on section type
  const getNavigationLabel = (section: any) => {
    switch (section.type) {
      case 'heroSection':
        return 'Home';
      case 'serviceSection':
        return 'Services';
      case 'storySection':
        return 'About';
      case 'teamSection':
        return 'Team';
      case 'clientsSection':
        return 'Clients';
      case 'googleReviewsSection':
        return 'Reviews';
      case 'outcomesSection':
        return 'Results';
      case 'instagramSection':
        return 'Gallery';
      case 'contactSection':
      case 'footerSection':
        return 'Contact';
      default:
        return section.type.replace('Section', '');
    }
  };

  // Generate navigation items from sections
  const sectionNavigation = React.useMemo(() => {
    const navItems = pageData.sections
      .filter((section) => {
        // Only include sections that should be in navigation
        const sectionId = getSectionId(section);
        return [
          'home',
          'services',
          'about',
          'team',
          'clients',
          'reviews',
          'outcomes',
          'gallery',
          'contact',
        ].includes(sectionId);
      })
      .map((section) => {
        return {
          id: section.id,
          label: getNavigationLabel(section),
          url: `#${getSectionId(section)}`,
          target: '_self',
        };
      });
    return navItems;
  }, [pageData.sections]);

  // State for onboarding sheet
  const [showSheet, setShowSheet] = React.useState(false);
  const onOpenOnboardingSheet = () => {
    return setShowSheet(true);
  };

  // Helper function to render sections based on type
  const renderSection = (section: any) => {
    console.log('🚀 section:', section.type);
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
            sectionNumber={section.sectionNumber}
            navigation={navigation}
            sectionNavigation={sectionNavigation}
            settings={settings}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
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
            sectionNumber={section.sectionNumber}
            {...commonProps}
          />
        );
      case 'teamSection':
        return (
          <TeamSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            buttonText={section.data.buttonText}
            onButtonClick={section.data.onButtonClick}
            team={section.data.team.map((member: any) => {
              return {
                ...member,
                image: member.image || '/images/avatars/default-avatar.png',
              };
            })}
            sectionNumber={section.sectionNumber}
          />
        );
      case 'instagramSection':
        return (
          <InstagramSection
            key={section.id}
            id={sectionId}
            title={section.title}
            subtitle={section.subtitle}
            instagramUrl={section.data.instagramUrl}
            primaryColor={primaryColor}
            sectionNumber={section.sectionNumber}
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
      {/* Cursor Ring */}
      <motion.div
        className='fixed pointer-events-none z-0'
        animate={{
          x: mousePosition.x - 40,
          y: mousePosition.y - 40,
          opacity: isVisible ? 0.15 : 0,
        }}
        transition={{
          type: 'tween',
          duration: 0.1,
        }}
      >
        <div className='w-20 h-20 rounded-full rainbow-blur blur-xl' />
      </motion.div>
      {/* Navigation */}
      {/* {navigation.length > 0 && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='bg-[#f5f4f0] absolute top-0 left-0 right-0 z-10'
        >
          <div className='container mx-auto px-4'>
            <div className='flex items-center justify-between h-16'>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className='sitename font-bold text-xl'
                style={{ color: contentPrimary }}
              >
                {settings.siteName}
              </motion.span>
              <div className='hidden md:flex space-x-8'>
                {sectionNavigation.map((item, index) => {
                  return (
                    <motion.a
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      href={item.url}
                      className='text-[#222222] hover:text-gray-900 transition-colors font-semibold text-sm'
                      target={item.target}
                    >
                      {item.label}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.nav>
      )} */}
      {/* Render all sections */}
      {pageData.sections
        .sort((a, b) => {
          // First sort by order
          const orderDiff = a.order - b.order;
          if (orderDiff !== 0) return orderDiff;

          // If orders are equal, sort by type (case-insensitive)
          return a.type.toLowerCase().localeCompare(b.type.toLowerCase());
        })
        .map((section, index) => {
          const sectionWithAnimation = {
            ...section,
            title:
              section.type === 'footerSection' ? (
                section.title
              ) : (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {section.title}
                </motion.span>
              ),
            subtitle:
              section.type === 'footerSection' ? (
                section.subtitle
              ) : (
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                >
                  {section.subtitle}
                </motion.span>
              ),
            // Add sectionNumber based on index
            sectionNumber: String(index + 1).padStart(2, '0'),
          };
          return renderSection(sectionWithAnimation);
        })}
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
