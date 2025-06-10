'use client';
import { WorkspacePublicPageProps } from '@/types/workspace';
import { buildNavigationTree } from '@/utils/cms';

export default function WorkspacePublicPage({ workspace, data }: WorkspacePublicPageProps) {
  // Use CMS settings if available, otherwise fall back to workspace data or defaults
  const siteName =
    data?.settings?.siteName ||
    data?.name ||
    workspace.charAt(0).toUpperCase() + workspace.slice(1);
  const description =
    data?.settings?.siteDescription ||
    data?.description ||
    'Your trusted partner for exceptional service and solutions';
  const about =
    data?.about ||
    `We are dedicated to providing exceptional service and innovative solutions that help
              our clients achieve their goals. With years of experience and a commitment to
              excellence, we're here to support your success.`;

  // Get theme colors from CMS settings
  const primaryColor =
    data?.settings?.theme?.primaryColor || data?.theme?.primaryColor || '#7C3AED';
  const secondaryColor =
    data?.settings?.theme?.secondaryColor || data?.theme?.secondaryColor || '#2563EB';

  // Get contact info from CMS settings
  const contact = data?.settings?.contact || data?.contact;
  const social = data?.settings?.socialMedia || data?.social;

  // Get navigation from CMS or use defaults
  const navigation = data?.cms?.navigation ? buildNavigationTree(data.cms.navigation) : [];

  // Get sections from CMS or use default services
  const heroSection = data?.cms?.sections?.find((s) => {
    return s.type === 'hero';
  });
  const featuresSection = data?.cms?.sections?.find((s) => {
    return s.type === 'features';
  });

  const services = featuresSection?.items ||
    data?.services || [
      {
        icon: '🚀',
        title: 'Professional Services',
        description: 'Expert solutions tailored to your business needs with proven results.',
      },
      {
        icon: '💼',
        title: 'Business Solutions',
        description: 'Comprehensive business tools to streamline your operations.',
      },
      {
        icon: '🎯',
        title: 'Strategic Consulting',
        description: 'Strategic guidance to help your business reach its full potential.',
      },
    ];

  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className='bg-white shadow-sm border-b'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center justify-between h-16'>
              <div className='font-bold text-xl' style={{ color: primaryColor }}>
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

      {/* Hero Section */}
      <header
        className='text-white'
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
        }}
      >
        <div className='container mx-auto px-4 py-16'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-5xl font-bold mb-6'>
              {heroSection?.title || `Welcome to ${siteName}`}
            </h1>
            <p className='text-xl opacity-90 mb-8'>{heroSection?.subtitle || description}</p>
            <div className='space-x-4'>
              <button
                className='bg-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors'
                style={{ color: primaryColor }}
              >
                Get Started
              </button>
              <button
                className='border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white transition-colors'
                style={{ '--tw-hover-bg-opacity': '1' } as any}
                onMouseOver={(e) => {
                  return (e.currentTarget.style.color = primaryColor);
                }}
                onMouseOut={(e) => {
                  return (e.currentTarget.style.color = 'white');
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features/Services Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl font-bold text-center mb-12'>
              {featuresSection?.title || 'Our Services'}
            </h2>
            <div className='grid md:grid-cols-3 gap-8'>
              {services.map((service, index) => {
                return (
                  <div
                    key={index}
                    className='bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow'
                  >
                    <div className='text-4xl mb-4'>{service.icon || '🔧'}</div>
                    <h3 className='text-xl font-semibold mb-3'>{service.title}</h3>
                    <p className='text-gray-600'>{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CMS Content Sections */}
      {data?.cms?.sections
        ?.filter((s) => {
          return !['hero', 'features'].includes(s.type);
        })
        .map((section) => {
          return (
            <section key={section.id} className='py-16'>
              <div className='container mx-auto px-4'>
                <div className='max-w-4xl mx-auto text-center'>
                  {section.title && <h2 className='text-3xl font-bold mb-8'>{section.title}</h2>}
                  {section.subtitle && (
                    <p className='text-xl text-gray-600 mb-8'>{section.subtitle}</p>
                  )}
                  {section.content && (
                    <div
                      className='prose prose-lg mx-auto'
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  )}
                </div>
              </div>
            </section>
          );
        })}

      {/* About Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-3xl font-bold mb-8'>About {siteName}</h2>
            <p className='text-lg text-gray-600 mb-8'>{about}</p>
            <button
              className='text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity'
              style={{ backgroundColor: primaryColor }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-800 text-white py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid md:grid-cols-4 gap-8'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>{siteName}</h3>
                <p className='text-gray-400'>Building success through innovation and dedication.</p>
              </div>
              <div>
                <h4 className='font-semibold mb-4'>Services</h4>
                <ul className='space-y-2 text-gray-400'>
                  {services.slice(0, 3).map((service, index) => {
                    return <li key={index}>{service.title}</li>;
                  })}
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-4'>Company</h4>
                <ul className='space-y-2 text-gray-400'>
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Careers</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-4'>Connect</h4>
                <ul className='space-y-2 text-gray-400'>
                  {social?.linkedin && (
                    <li>
                      <a href={social.linkedin} target='_blank' rel='noopener noreferrer'>
                        LinkedIn
                      </a>
                    </li>
                  )}
                  {social?.twitter && (
                    <li>
                      <a href={social.twitter} target='_blank' rel='noopener noreferrer'>
                        Twitter
                      </a>
                    </li>
                  )}
                  {social?.facebook && (
                    <li>
                      <a href={social.facebook} target='_blank' rel='noopener noreferrer'>
                        Facebook
                      </a>
                    </li>
                  )}
                  {contact?.email && (
                    <li>
                      <a href={`mailto:${contact.email}`}>Email</a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className='border-t border-gray-700 mt-8 pt-8 text-center text-gray-400'>
              <p>&copy; 2024 {siteName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
