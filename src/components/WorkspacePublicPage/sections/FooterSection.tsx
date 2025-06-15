import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

interface Contact {
  email: string;
  phone: string;
  address: string;
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
  siteName?: string;
  primaryColor?: string;
  id?: string;
  socials?: SocialLinks;
  showSheet: boolean;
  setShowSheet: (show: boolean) => void;
  onOpenOnboardingSheet: () => void;
  sectionNumber?: string;
}

export default function FooterSection({
  title,
  subtitle,
  contact,
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

      {/* Footer Content */}
      <div className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-8xl mx-auto'>
            <div className='flex justify-between items-start'>
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
              </div>

              {/* Socials */}
              {socials && (
                <div className='flex space-x-6'>
                  {socials.linkedin && (
                    <motion.a
                      href={socials.linkedin}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='LinkedIn'
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className='text-[#222222] hover:text-gray-900 transition-colors'
                    >
                      <FaLinkedin size={24} />
                    </motion.a>
                  )}
                  {socials.instagram && (
                    <motion.a
                      href={socials.instagram}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='Instagram'
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className='text-[#222222] hover:text-gray-900 transition-colors'
                    >
                      <FaInstagram size={24} />
                    </motion.a>
                  )}
                  {socials.facebook && (
                    <motion.a
                      href={socials.facebook}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='Facebook'
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className='text-[#222222] hover:text-gray-900 transition-colors'
                    >
                      <FaFacebook size={24} />
                    </motion.a>
                  )}
                </div>
              )}
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
