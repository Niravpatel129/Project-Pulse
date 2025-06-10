interface Contact {
  phone: string;
  email: string;
  address?: string;
  serviceAreas: string[];
}

interface Testimonial {
  text: string;
  author: string;
  position: string;
  avatar: string;
}

interface LocationContactSectionProps {
  title?: string;
  subtitle?: string;
  contact?: Contact;
  testimonials?: Testimonial[];
  primaryColor?: string;
  id?: string;
}

export default function LocationContactSection({
  title,
  subtitle,
  contact,
  testimonials = [],
  primaryColor = '#7C3AED',
  id,
}: LocationContactSectionProps) {
  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600'>{subtitle}</p>
          </div>

          <div className='grid lg:grid-cols-2 gap-12'>
            {/* Contact Information */}
            <div className='space-y-8'>
              <div className='bg-gray-50 rounded-lg p-8'>
                <h3 className='text-2xl font-bold mb-6' style={{ color: primaryColor }}>
                  Contact Information
                </h3>

                {contact && (
                  <div className='space-y-6'>
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

                    {contact.address && (
                      <div className='flex items-start'>
                        <span className='text-2xl mr-4 mt-1'>📍</span>
                        <div>
                          <p className='font-semibold text-gray-900'>Address</p>
                          <p className='text-gray-600'>{contact.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Service Areas */}
                {contact?.serviceAreas && contact.serviceAreas.length > 0 && (
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

              {/* Call to Action */}
              <div className='text-center'>
                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8'>
                  <h3 className='text-xl font-bold mb-4' style={{ color: primaryColor }}>
                    Ready to Get Started?
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Get your professional resume today and start landing interviews next week.
                  </p>
                  <div className='space-y-3'>
                    <a
                      href={`tel:${contact?.phone.replace(/\D/g, '') || '4377743721'}`}
                      className='block w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-300'
                      style={{ backgroundColor: primaryColor }}
                    >
                      Call Now: {contact?.phone || '(437) 774-3721'}
                    </a>
                    <a
                      href={`mailto:${contact?.email || 'gtaresumebuilder@gmail.com'}`}
                      className='block w-full py-3 px-6 rounded-lg font-semibold border-2 transition-colors duration-300'
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                    >
                      Send Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className='space-y-6'>
              <h3 className='text-2xl font-bold' style={{ color: primaryColor }}>
                What Our Local Clients Say
              </h3>

              {testimonials.map((testimonial, index) => {
                return (
                  <div key={index} className='bg-gray-50 rounded-lg p-6'>
                    <div className='flex items-start mb-4'>
                      <span className='text-3xl mr-4'>{testimonial.avatar}</span>
                      <div>
                        <p className='font-semibold text-gray-900'>{testimonial.author}</p>
                        <p className='text-sm text-gray-600'>{testimonial.position}</p>
                      </div>
                    </div>
                    <p className='text-gray-700 italic'>&ldquo;{testimonial.text}&rdquo;</p>
                  </div>
                );
              })}

              {/* Additional CTA */}
              <div className='bg-white border-2 border-gray-200 rounded-lg p-6 text-center'>
                <h4 className='text-lg font-semibold mb-2' style={{ color: primaryColor }}>
                  Join Our Success Stories
                </h4>
                <p className='text-gray-600 text-sm mb-4'>
                  Ready to be our next success story? Get started today!
                </p>
                <div className='flex space-x-3'>
                  <a
                    href={`tel:${contact?.phone.replace(/\D/g, '') || '4377743721'}`}
                    className='flex-1 py-2 px-4 rounded text-sm font-medium text-白 transition-colors'
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                  >
                    Call
                  </a>
                  <a
                    href={`sms:${contact?.phone.replace(/\D/g, '') || '4377743721'}`}
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
      </div>
    </section>
  );
}
