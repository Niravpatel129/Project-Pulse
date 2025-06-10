interface LocationHeroSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  cityHighlights?: string[];
  id?: string;
}

export default function LocationHeroSection({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  backgroundImage,
  primaryColor = '#7C3AED',
  secondaryColor = '#2563EB',
  cityHighlights = [],
  id,
}: LocationHeroSectionProps) {
  return (
    <section
      id={id}
      className='relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white'
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className='absolute inset-0 bg-black bg-opacity-50'></div>

      {/* Content */}
      <div className='relative z-10 container mx-auto px-4 text-center'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight'>{title}</h1>

          <p className='text-xl md:text-2xl mb-8 text-gray-100'>{subtitle}</p>

          {/* City Highlights */}
          {cityHighlights.length > 0 && (
            <div className='mb-8'>
              <div className='grid md:grid-cols-3 gap-4 max-w-3xl mx-auto'>
                {cityHighlights.map((highlight, index) => {
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

              <p className='text-sm text-gray-300'>
                Call or text anytime • Free consultation • Same-day response
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent'></div>
    </section>
  );
}
