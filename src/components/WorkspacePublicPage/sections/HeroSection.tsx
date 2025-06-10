interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  id?: string;

  // Generic configuration options
  variant?: 'default' | 'location' | 'minimal';
  highlights?: string[]; // For location highlights or key points
  overlayOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
  additionalContent?: React.ReactNode;
}

export default function HeroSection({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  backgroundImage,
  primaryColor = '#7C3AED',
  secondaryColor = '#2563EB',
  id,
  variant = 'default',
  highlights = [],
  overlayOpacity = 0.5,
  textAlign = 'center',
  minHeight = '600px',
  additionalContent,
}: HeroSectionProps) {
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  return (
    <section
      id={id}
      className={`relative flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white ${textAlignClass}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight,
      }}
    >
      {/* Overlay */}
      <div className='absolute inset-0 bg-black' style={{ opacity: overlayOpacity }}></div>

      {/* Content */}
      <div className='relative z-10 container mx-auto px-4'>
        <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''}`}>
          <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>{title}</h1>

          <p className='text-xl md:text-2xl mb-8 text-gray-100'>{subtitle}</p>

          {/* Highlights (for location variant or key points) */}
          {highlights.length > 0 && (
            <div className='mb-8'>
              <div
                className={`grid ${
                  highlights.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-4 max-w-3xl ${textAlign === 'center' ? 'mx-auto' : ''}`}
              >
                {highlights.map((highlight, index) => {
                  return (
                    <div
                      key={index}
                      className='bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20'
                    >
                      <p className='text-sm font-medium text-gray-100'>{highlight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Content */}
          {additionalContent && <div className='mb-8'>{additionalContent}</div>}

          {/* CTA Button */}
          {buttonText && buttonUrl && (
            <div className='space-y-4'>
              <a
                href={buttonUrl}
                className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg'
                style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                }}
              >
                {buttonText}
              </a>

              {variant === 'location' && (
                <p className='text-sm text-gray-300'>
                  Call or text anytime • Free consultation • Same-day response
                </p>
              )}

              {variant === 'default' && (
                <p className='text-sm text-gray-300'>
                  Get started today • Professional results guaranteed
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent'></div>
    </section>
  );
}
