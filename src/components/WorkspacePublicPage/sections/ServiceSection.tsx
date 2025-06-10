interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

interface ServiceSectionProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
  id?: string;
}

export default function ServiceSection({
  title,
  subtitle,
  services = [],
  id,
}: ServiceSectionProps) {
  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600'>{subtitle}</p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {services.map((service, index) => {
              return (
                <div
                  key={index}
                  className='bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow'
                >
                  <div className='text-4xl mb-4'>{service.icon}</div>
                  <h3 className='text-xl font-semibold mb-3'>{service.title}</h3>
                  <p className='text-gray-600 mb-4'>{service.description}</p>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-gray-800'>Key Features:</h4>
                    <ul className='space-y-1'>
                      {service.features.map((feature, featureIndex) => {
                        return (
                          <li
                            key={featureIndex}
                            className='text-sm text-gray-600 flex items-center'
                          >
                            <span className='mr-2'>✓</span>
                            {feature}
                          </li>
                        );
                      })}
                    </ul>
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
