interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

interface LocationServicesSectionProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
  primaryColor?: string;
  id?: string;
}

export default function LocationServicesSection({
  title,
  subtitle,
  services = [],
  primaryColor = '#7C3AED',
  id,
}: LocationServicesSectionProps) {
  if (services.length === 0) return null;

  return (
    <section id={id} className='py-16 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>{subtitle}</p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {services.map((service, index) => {
              return (
                <div
                  key={index}
                  className='bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300'
                >
                  <div className='text-center mb-6'>
                    <div className='text-4xl mb-4'>{service.icon}</div>
                    <h3 className='text-xl font-semibold mb-3' style={{ color: primaryColor }}>
                      {service.title}
                    </h3>
                    <p className='text-gray-600 mb-6'>{service.description}</p>
                  </div>

                  <div className='space-y-3'>
                    {service.features.map((feature, featureIndex) => {
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

                  <div className='mt-6 pt-6 border-t border-gray-100'>
                    <button
                      className='w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 border-2'
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
                      Get Started Today
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className='text-center mt-12'>
            <div className='bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto'>
              <h3 className='text-2xl font-bold mb-4' style={{ color: primaryColor }}>
                Ready to Get Started?
              </h3>
              <p className='text-gray-600 mb-6'>
                Don&apos;t let another opportunity pass by. Get your professional resume today and
                start landing interviews next week.
              </p>
              <div className='space-y-4'>
                <a
                  href='tel:4377743721'
                  className='inline-block px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-300'
                  style={{ backgroundColor: primaryColor }}
                >
                  Call Now: (437) 774-3721
                </a>
                <p className='text-sm text-gray-500'>Or text us anytime for a free consultation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
