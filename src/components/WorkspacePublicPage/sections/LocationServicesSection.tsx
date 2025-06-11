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
        </div>
      </div>
    </section>
  );
}
