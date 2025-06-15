interface Contact {
  phone?: string;
  email?: string;
  address?: string;
  serviceAreas?: string[];
  hours?:
    | string
    | {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
      };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface Testimonial {
  text: string;
  author: string;
  position: string;
  avatar: string;
  rating?: number;
}

interface ContactSectionProps {
  title?: string;
  subtitle?: string;
  contact?: Contact;
  testimonials?: Testimonial[];
  id?: string;

  // Generic configuration options
  variant?: 'default' | 'location' | 'minimal' | 'full';
  layout?: 'split' | 'centered' | 'sidebar';
  backgroundColor?: 'white' | 'gray' | 'brand';
  showTestimonials?: boolean;
  showMap?: boolean;
  showServiceAreas?: boolean;
  primaryColor?: string;
  ctaButtons?: Array<{
    text: string;
    url: string;
    style: 'primary' | 'secondary';
  }>;
  ctaHeading?: string;
  ctaParagraph?: string;
  mobileCTAHeading?: string;
  mobileCTAParagraph?: string;
  sectionNumber?: string;
}

export default function ContactSection({
  title,
  subtitle,
  contact,
  testimonials = [],
  id,
  variant = 'default',
  layout = 'split',
  backgroundColor = 'white',
  showTestimonials = true,
  showMap = false,
  showServiceAreas = true,
  primaryColor = '#7C3AED',
  ctaButtons = [],
  ctaHeading,
  ctaParagraph,
  mobileCTAHeading,
  mobileCTAParagraph,
  sectionNumber,
}: ContactSectionProps) {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    brand: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  }[backgroundColor];

  const defaultCTAButtons =
    ctaButtons.length > 0
      ? ctaButtons
      : [
          {
            text: `Call: ${contact?.phone || '(437) 774-3721'}`,
            url: `tel:${contact?.phone?.replace(/\D/g, '') || '4377743721'}`,
            style: 'primary' as const,
          },
          {
            text: 'Send Email',
            url: `mailto:${contact?.email || 'contact@example.com'}`,
            style: 'secondary' as const,
          },
        ];

  const renderHours = () => {
    if (!contact?.hours) return null;

    if (typeof contact.hours === 'string') {
      return <p className='text-gray-600'>{contact.hours}</p>;
    }

    // Handle hours object
    const daysOrder = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const dayNames = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    };

    return (
      <div className='space-y-1'>
        {daysOrder.map((day) => {
          const hours = contact.hours?.[day as keyof typeof contact.hours];
          if (!hours) return null;

          return (
            <div key={day} className='flex justify-between text-sm'>
              <span className='font-medium text-gray-700'>
                {dayNames[day as keyof typeof dayNames]}:
              </span>
              <span className='text-gray-600'>{hours}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContactInfo = () => {
    return (
      <div className='bg-gray-50 rounded-lg p-8'>
        <h3 className='text-2xl font-bold mb-6' style={{ color: primaryColor }}>
          Contact Information
        </h3>

        {contact && (
          <div className='space-y-6'>
            {contact.phone && (
              <div className='flex items-center'>
                <span className='text-2xl mr-4'>📞</span>
                <div>
                  <p className='font-semibold text-gray-900'>Phone</p>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className='text-lg hover:underline'
                    style={{ color: primaryColor }}
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            {contact.email && (
              <div className='flex items-center'>
                <span className='text-2xl mr-4'>✉️</span>
                <div>
                  <p className='font-semibold text-gray-900'>Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className='text-lg hover:underline'
                    style={{ color: primaryColor }}
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.address && (
              <div className='flex items-start'>
                <span className='text-2xl mr-4 mt-1'>📍</span>
                <div>
                  <p className='font-semibold text-gray-900'>Address</p>
                  <p className='text-gray-600'>{contact.address}</p>
                </div>
              </div>
            )}

            {contact.hours && (
              <div className='flex items-start'>
                <span className='text-2xl mr-4 mt-1'>🕒</span>
                <div>
                  <p className='font-semibold text-gray-900'>Business Hours</p>
                  {renderHours()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Service Areas */}
        {showServiceAreas && contact?.serviceAreas && contact.serviceAreas.length > 0 && (
          <div className='mt-8 pt-8 border-t border-gray-200'>
            <h4 className='text-lg font-semibold mb-4' style={{ color: primaryColor }}>
              Service Areas
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              {contact.serviceAreas.map((area, index) => {
                return (
                  <div key={index} className='flex items-center'>
                    <span className='mr-2' style={{ color: primaryColor }}>
                      ●
                    </span>
                    <span className='text-gray-700 text-sm'>{area}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTestimonials = () => {
    if (!showTestimonials || testimonials.length === 0) return null;

    return (
      <div className='space-y-6'>
        <h3 className='text-2xl font-bold' style={{ color: primaryColor }}>
          {variant === 'location' ? 'What Our Local Clients Say' : 'Customer Testimonials'}
        </h3>

        {testimonials.map((testimonial, index) => {
          return (
            <div key={index} className='bg-gray-50 rounded-lg p-6'>
              <div className='flex items-start mb-4'>
                <span className='text-3xl mr-4'>{testimonial.avatar}</span>
                <div>
                  <p className='font-semibold text-gray-900'>{testimonial.author}</p>
                  <p className='text-sm text-gray-600'>{testimonial.position}</p>
                  {testimonial.rating && (
                    <div className='flex mt-1'>
                      {[...Array(testimonial.rating)].map((_, i) => {
                        return (
                          <span key={i} className='text-yellow-400'>
                            ⭐
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <p className='text-gray-700 italic'>&ldquo;{testimonial.text}&rdquo;</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCTA = () => {
    return (
      <div className='text-center'>
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8'>
          <h3 className='text-xl font-bold mb-4' style={{ color: primaryColor }}>
            {ctaHeading || 'Ready to Get Started?'}
          </h3>
          <p className='text-gray-600 mb-6'>
            {ctaParagraph ||
              (variant === 'location'
                ? 'Get your professional service today and start seeing results next week.'
                : 'Contact us today for a free consultation and see how we can help you succeed.')}
          </p>
          <div className='space-y-3'>
            {defaultCTAButtons.map((button, index) => {
              return (
                <a
                  key={index}
                  href={button.url}
                  className={`block w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${
                    button.style === 'primary' ? 'text-white' : 'border-2'
                  }`}
                  style={
                    button.style === 'primary'
                      ? { backgroundColor: primaryColor }
                      : { borderColor: primaryColor, color: primaryColor }
                  }
                >
                  {button.text}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderLayout = () => {
    if (layout === 'centered') {
      return (
        <div className='max-w-2xl mx-auto space-y-8'>
          {renderContactInfo()}
          {renderCTA()}
          {renderTestimonials()}
        </div>
      );
    }

    if (layout === 'sidebar') {
      return (
        <div className='grid lg:grid-cols-3 gap-12'>
          <div className='lg:col-span-1'>{renderContactInfo()}</div>
          <div className='lg:col-span-2 space-y-8'>
            {renderTestimonials()}
            {renderCTA()}
          </div>
        </div>
      );
    }

    // Default split layout
    return (
      <div className='grid lg:grid-cols-2 gap-12'>
        <div className='space-y-8'>
          {renderContactInfo()}
          {renderCTA()}
        </div>
        <div>
          {renderTestimonials()}

          {/* Additional CTA for mobile */}
          <div className='lg:hidden mt-8'>
            <div className='bg-white border-2 border-gray-200 rounded-lg p-6 text-center'>
              <h4 className='text-lg font-semibold mb-2' style={{ color: primaryColor }}>
                {mobileCTAHeading || 'Join Our Success Stories'}
              </h4>
              <p className='text-gray-600 text-sm mb-4'>
                {mobileCTAParagraph || 'Ready to be our next success story? Get started today!'}
              </p>
              <div className='flex space-x-3'>
                <a
                  href={`tel:${contact?.phone?.replace(/\D/g, '') || '4377743721'}`}
                  className='flex-1 py-2 px-4 rounded text-sm font-medium transition-colors'
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                  Call
                </a>
                <a
                  href={`sms:${contact?.phone?.replace(/\D/g, '') || '4377743721'}`}
                  className='flex-1 py-2 px-4 rounded text-sm font-medium border transition-colors'
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Text
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id={id} className={`py-16 ${bgClasses}`}>
      <div className='container mx-auto px-4'>
        <div className='max-w-8xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600'>{subtitle}</p>
          </div>

          {renderLayout()}
        </div>
      </div>
    </section>
  );
}
