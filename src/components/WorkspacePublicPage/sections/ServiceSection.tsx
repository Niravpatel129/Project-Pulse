interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
  link?: string;
  price?: string;
}

interface ServiceSectionProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
  id?: string;

  // Generic configuration options
  variant?: 'default' | 'cards' | 'list' | 'pricing';
  backgroundColor?: 'white' | 'gray' | 'transparent';
  columns?: 1 | 2 | 3 | 4;
  showCTA?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  primaryColor?: string;
  layout?: 'grid' | 'carousel' | 'stacked';
}

export default function ServiceSection({
  title,
  subtitle,
  services = [],
  id,
  variant = 'default',
  backgroundColor = 'gray',
  columns = 3,
  showCTA = true,
  ctaText = 'Get Started Today',
  ctaUrl = 'tel:4377743721',
  primaryColor = '#7C3AED',
  layout = 'grid',
}: ServiceSectionProps) {
  if (services.length === 0) return null;

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    transparent: 'bg-transparent',
  }[backgroundColor];

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const renderService = (service: Service, index: number) => {
    const baseClasses =
      'bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300';

    if (variant === 'pricing') {
      return (
        <div key={index} className={`${baseClasses} relative`}>
          {service.price && (
            <div className='absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-bl-lg rounded-tr-lg'>
              {service.price}
            </div>
          )}
          <div className='text-center mb-6'>
            <div className='text-4xl mb-4'>{service.icon}</div>
            <h3 className='text-xl font-semibold mb-3' style={{ color: primaryColor }}>
              {service.title}
            </h3>
            <p className='text-gray-600 mb-6'>{service.description}</p>
          </div>
          {renderFeatures(service.features)}
          {renderServiceCTA(service)}
        </div>
      );
    }

    if (variant === 'list') {
      return (
        <div key={index} className='flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm'>
          <div className='text-3xl flex-shrink-0'>{service.icon}</div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold mb-2' style={{ color: primaryColor }}>
              {service.title}
            </h3>
            <p className='text-gray-600 mb-3'>{service.description}</p>
            {renderFeatures(service.features, true)}
          </div>
        </div>
      );
    }

    // Default card variant
    return (
      <div key={index} className={baseClasses}>
        <div className='text-center mb-6'>
          <div className='text-4xl mb-4'>{service.icon}</div>
          <h3 className='text-xl font-semibold mb-3' style={{ color: primaryColor }}>
            {service.title}
          </h3>
          <p className='text-gray-600 mb-6'>{service.description}</p>
        </div>
        {renderFeatures(service.features)}
        {renderServiceCTA(service)}
      </div>
    );
  };

  const renderFeatures = (features: string[], inline = false) => {
    if (inline) {
      return (
        <div className='flex flex-wrap gap-2'>
          {features.map((feature, featureIndex) => {
            return (
              <span
                key={featureIndex}
                className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
              >
                {feature}
              </span>
            );
          })}
        </div>
      );
    }

    return (
      <div className='space-y-3'>
        {features.map((feature, featureIndex) => {
          return (
            <div key={featureIndex} className='flex items-center'>
              <span className='mr-3 text-lg' style={{ color: primaryColor }}>
                ✓
              </span>
              <span className='text-gray-700 text-sm'>{feature}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderServiceCTA = (service: Service) => {
    if (!showCTA) return null;

    const url = service.link || ctaUrl;
    const text = variant === 'pricing' ? 'Choose Plan' : 'Learn More';

    return (
      <div className='mt-6 pt-6 border-t border-gray-100'>
        <a
          href={url}
          className='block w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 border-2 text-center'
          style={{
            borderColor: primaryColor,
            color: primaryColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = primaryColor;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = primaryColor;
          }}
        >
          {text}
        </a>
      </div>
    );
  };

  const renderLayout = () => {
    if (layout === 'stacked') {
      return <div className='space-y-6 max-w-3xl mx-auto'>{services.map(renderService)}</div>;
    }

    // Default grid layout
    return <div className={`grid ${gridCols} gap-8`}>{services.map(renderService)}</div>;
  };

  return (
    <section id={id} className={`py-16 ${bgClasses}`}>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>{subtitle}</p>
          </div>

          {renderLayout()}

          {/* Global CTA */}
          {showCTA && variant !== 'pricing' && (
            <div className='text-center mt-12'>
              <div className='bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto'>
                <h3 className='text-2xl font-bold mb-4' style={{ color: primaryColor }}>
                  Ready to Get Started?
                </h3>
                <p className='text-gray-600 mb-6'>
                  Don&apos;t let another opportunity pass by. Get your professional service today.
                </p>
                <div className='space-y-4'>
                  <a
                    href={ctaUrl}
                    className='inline-block px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-300'
                    style={{ backgroundColor: primaryColor }}
                  >
                    {ctaText}
                  </a>
                  <p className='text-sm text-gray-500'>
                    Contact us anytime for a free consultation
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
