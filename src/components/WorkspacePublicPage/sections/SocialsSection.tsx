interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface Testimonial {
  text: string;
  author: string;
  position: string;
  avatar: string;
}

interface SocialsSectionProps {
  title?: string;
  subtitle?: string;
  socialLinks?: SocialLink[];
  testimonials?: Testimonial[];
  primaryColor?: string;
  id?: string;
}

export default function SocialsSection({
  title,
  subtitle,
  socialLinks = [],
  testimonials = [],
  primaryColor = '#7C3AED',
  id,
}: SocialsSectionProps) {
  return (
    <section id={id} className='py-16 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600'>{subtitle}</p>
          </div>

          {/* Social Links */}
          <div className='flex justify-center space-x-6 mb-16'>
            {socialLinks.map((social, index) => {
              return (
                <a
                  key={index}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-12 h-12 rounded-full flex items-center justify-center text-white text-xl hover:scale-110 transition-transform'
                  style={{ backgroundColor: primaryColor }}
                >
                  {social.icon}
                </a>
              );
            })}
          </div>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <div>
              <h3 className='text-2xl font-bold text-center mb-8'>What Our Clients Say</h3>
              <div className='grid md:grid-cols-2 gap-8'>
                {testimonials.map((testimonial, index) => {
                  return (
                    <div key={index} className='bg-white p-8 rounded-lg shadow-md'>
                      <p className='text-gray-600 mb-6 italic'>&ldquo;{testimonial.text}&rdquo;</p>
                      <div className='flex items-center'>
                        <div
                          className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4'
                          style={{ backgroundColor: primaryColor }}
                        >
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className='font-semibold'>{testimonial.author}</div>
                          <div className='text-sm text-gray-500'>{testimonial.position}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className='text-center mt-12'>
            <p className='text-gray-600'>
              Follow us on social media for updates, insights, and industry news
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
