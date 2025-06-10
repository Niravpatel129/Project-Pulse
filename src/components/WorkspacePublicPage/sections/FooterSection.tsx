interface Contact {
  email: string;
  phone: string;
  address: string;
}

interface Link {
  label: string;
  url: string;
}

interface FooterSectionProps {
  title?: string;
  subtitle?: string;
  contact?: Contact;
  quickLinks?: Link[];
  legalLinks?: Link[];
  siteName?: string;
  primaryColor?: string;
  id?: string;
}

export default function FooterSection({
  title,
  subtitle,
  contact,
  quickLinks = [],
  legalLinks = [],
  siteName = 'Pulse Solutions',
  primaryColor = '#7C3AED',
  id,
}: FooterSectionProps) {
  return (
    <footer id={id} className='bg-gray-800 text-white'>
      {/* CTA Section */}
      <div className='py-16 border-b border-gray-700'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-xl text-gray-300 mb-8'>{subtitle}</p>
            <button
              className='px-8 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity'
              style={{ backgroundColor: primaryColor }}
            >
              Contact Us Today
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid md:grid-cols-4 gap-8'>
              {/* Company Info */}
              <div>
                <h3 className='text-lg font-semibold mb-4'>{siteName}</h3>
                <p className='text-gray-400 mb-4'>
                  Building success through innovation and dedication.
                </p>
                {contact && (
                  <div className='space-y-2 text-sm text-gray-400'>
                    <div>{contact.address}</div>
                    <div>{contact.phone}</div>
                    <div>{contact.email}</div>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div>
                <h4 className='font-semibold mb-4'>Quick Links</h4>
                <ul className='space-y-2 text-gray-400'>
                  {quickLinks.map((link, index) => {
                    return (
                      <li key={index}>
                        <a href={link.url} className='hover:text-white transition-colors'>
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className='font-semibold mb-4'>Services</h4>
                <ul className='space-y-2 text-gray-400'>
                  <li>Digital Transformation</li>
                  <li>Business Consulting</li>
                  <li>Custom Development</li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className='font-semibold mb-4'>Legal</h4>
                <ul className='space-y-2 text-gray-400'>
                  {legalLinks.map((link, index) => {
                    return (
                      <li key={index}>
                        <a href={link.url} className='hover:text-white transition-colors'>
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className='border-t border-gray-700 py-8'>
        <div className='container mx-auto px-4'>
          <div className='text-center text-gray-400'>
            <p>&copy; 2024 {siteName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
