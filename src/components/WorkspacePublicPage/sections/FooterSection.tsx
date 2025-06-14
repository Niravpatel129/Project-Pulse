import { Button } from '@/components/ui/button';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

interface Contact {
  email: string;
  phone: string;
  address: string;
}

interface Link {
  label: string;
  url: string;
}

interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  [key: string]: string | undefined;
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
  socials?: SocialLinks;

  // Onboarding sheet props
  showSheet: boolean;
  setShowSheet: (show: boolean) => void;
  onOpenOnboardingSheet: () => void;
  sectionNumber?: string;
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
  socials = {},
  showSheet,
  setShowSheet,
  onOpenOnboardingSheet,
  sectionNumber,
}: FooterSectionProps) {
  return (
    <footer
      id={id}
      className='text-[##080a0c]'
      style={{ backgroundColor: '#f1f0ec', color: '#080a0c' }}
    >
      {/* CTA Section */}
      <div className='py-16 border-b' style={{ borderColor: '#e0ded8' }}>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-xl mb-8' style={{ color: '#5a5a5a' }}>
              {subtitle}
            </p>
            <Button className='font-semibold px-8 py-6' onClick={onOpenOnboardingSheet}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-8xl mx-auto'>
            <div className='grid md:grid-cols-4 gap-8'>
              {/* Company Info */}
              <div>
                <h3 className='text-lg font-semibold mb-4'>{siteName}</h3>
                <p className='mb-4' style={{ color: '#5a5a5a' }}>
                  Building success through innovation and dedication.
                </p>
                {contact && (
                  <div className='space-y-2 text-sm' style={{ color: '#5a5a5a' }}>
                    <div>{contact.address}</div>
                    <div>{contact.phone}</div>
                    <div>{contact.email}</div>
                  </div>
                )}
                {/* Socials */}
                {socials && (
                  <div className='flex space-x-4 mt-4'>
                    {socials.linkedin && (
                      <a
                        href={socials.linkedin}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='LinkedIn'
                      >
                        <FaLinkedin size={24} />
                      </a>
                    )}
                    {socials.instagram && (
                      <a
                        href={socials.instagram}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Instagram'
                      >
                        <FaInstagram size={24} />
                      </a>
                    )}
                    {socials.facebook && (
                      <a
                        href={socials.facebook}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Facebook'
                      >
                        <FaFacebook size={24} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div>
                <h4 className='font-semibold mb-4'>Quick Links</h4>
                <ul className='space-y-2' style={{ color: '#5a5a5a' }}>
                  {quickLinks.map((link, index) => {
                    return (
                      <li key={index}>
                        <a href={link.url} className='hover:underline' style={{ color: '#080a0c' }}>
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
                <ul className='space-y-2' style={{ color: '#5a5a5a' }}>
                  <li>Digital Transformation</li>
                  <li>Business Consulting</li>
                  <li>Custom Development</li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className='font-semibold mb-4'>Legal</h4>
                <ul className='space-y-2' style={{ color: '#5a5a5a' }}>
                  {legalLinks.map((link, index) => {
                    return (
                      <li key={index}>
                        <a href={link.url} className='hover:underline' style={{ color: '#080a0c' }}>
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
      <div className='border-t py-8' style={{ borderColor: '#e0ded8' }}>
        <div className='container mx-auto px-4'>
          <div className='text-center' style={{ color: '#5a5a5a' }}>
            <p>&copy; 2024 {siteName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
