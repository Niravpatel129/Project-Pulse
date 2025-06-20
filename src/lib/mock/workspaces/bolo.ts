import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';

export const bolo: WorkspaceCMSData = {
  workspace: 'bolocreate',
  settings: {
    siteName: 'Bolo',
    siteDescription:
      'Professional Resume Writing That Gets Interviews - Trusted by 100+ Across the Greater Toronto Area',
    theme: {
      content: {
        primary: '#181f1f',
      },
      primaryColor: '#015bf8',
      secondaryColor: '#DC2626',
    },
    contact: {
      email: 'niravpatelp129@gmail.com',
      phone: 'tel:4377743721',
    },
    socialMedia: {
      linkedin: 'https://linkedin.com/company/gta-resume-builder',
      instagram: 'https://instagram.com/gtaresumebuilder',
      facebook: 'https://facebook.com/gtaresumebuilder',
    },
  },
  navigation: [
    { id: '1', label: 'Home', url: '/', target: '_self', order: 1 },
    { id: '2', label: 'Services', url: '#services', target: '_self', order: 2 },
    { id: '3', label: 'Toronto', url: '/locations/toronto', target: '_self', order: 3 },
    { id: '4', label: 'Brampton', url: '/locations/brampton', target: '_self', order: 4 },
    { id: '5', label: 'Contact', url: '#contact', target: '_self', order: 5 },
  ],
  pages: {
    home: {
      id: 'home',
      slug: 'home',
      title: 'GTA Resume Builder - Professional Resume Writing Services',
      content: '',
      status: 'published',
      updatedAt: new Date().toISOString(),
      type: 'home',
      template: 'landing',
      sections: [
        {
          id: 'hero-1',
          type: 'heroSectionV2',
          title: 'Professional Resumes',
          subtitle:
            'Delivered in 24 - 48 hours • Trusted by 100+ Across the Greater Toronto Area • Land Interviews Within Weeks',
          order: 1,
          variant: 'default',
          data: {
            buttonText: 'Get Started',
            buttonAction: 'openOnboardingSheet',
            backgroundImage: '/images/resume-hero-bg.jpg',
            buttons: [{ type: 'callOrText', text: 'Get Started', url: 'tel:4377743721' }],
          },
        },
      ],
    } as EnhancedCMSPage,
    locations: {
      toronto: {
        id: 'toronto',
        slug: 'toronto',
        title: 'Professional Resume Writing Services in Toronto',
        content: '',
        status: 'published',
        updatedAt: new Date().toISOString(),
        type: 'location',
        template: 'default',
        locationData: {
          city: 'Toronto',
          province: 'Ontario',
          coordinates: { lat: 43.6532, lng: -79.3832 },
          serviceAreas: ['Downtown Toronto', 'North York', 'Scarborough', 'Etobicoke'],
          specificServices: [
            'Healthcare Resume Writing',
            'Tech Resume Writing',
            'Finance Resume Writing',
          ],
        },
        sections: [
          {
            id: 'location-hero-1',
            type: 'heroSection',
            title: 'Professional Resume Writing Services in Toronto',
            subtitle:
              "Land Your Dream Job in Canada's Largest City - Expert Resume Writing for Toronto Professionals",
            order: 1,
            variant: 'location',
            data: {
              buttonText: 'Get Your Toronto Resume Today',
              buttonUrl: 'tel:4377743721',
              backgroundImage: '/images/toronto-skyline.jpg',
              highlights: [
                'Serving Downtown, North York, Scarborough & Etobicoke',
                'Expert in Toronto Job Market Trends',
                'ATS-Compliant for Major Toronto Employers',
              ],
            },
          },
          {
            id: 'location-services-1',
            type: 'serviceSection',
            title: 'Toronto-Specific Resume Services',
            subtitle: 'Tailored for the Toronto job market and major employers in the GTA',
            order: 2,
            variant: 'location',
            columns: 3,
            data: {
              services: [
                {
                  icon: '🏢',
                  title: 'Corporate Resume Writing',
                  description:
                    'Perfect for Bay Street financial firms, corporate headquarters, and professional services.',
                  features: [
                    'Executive Level Resumes',
                    'Financial Sector Focus',
                    'Corporate Formatting',
                  ],
                },
                {
                  icon: '🏥',
                  title: 'Healthcare Professional Resumes',
                  description:
                    "Specialized resumes for Toronto's major hospitals and healthcare networks.",
                  features: [
                    'Hospital Network Ready',
                    'Ontario Health Standards',
                    'Certification Highlighting',
                  ],
                },
                {
                  icon: '💻',
                  title: 'Tech Industry Resumes',
                  description:
                    "For Toronto's booming tech sector including startups and major tech companies.",
                  features: [
                    'Startup Ready Format',
                    'Tech Skills Highlighting',
                    'Portfolio Integration',
                  ],
                },
              ],
            },
          },
          {
            id: 'location-contact-1',
            type: 'contactSection',
            title: 'Contact Us in Toronto',
            subtitle: "Ready to advance your career in Toronto? Let's get started today.",
            order: 4,
            variant: 'location',
            layout: 'split',
            data: {
              contact: {
                phone: '437 774 3721',
                email: 'toronto@gtaresumebuilder.com',
                serviceAreas: [
                  'Downtown Toronto',
                  'North York',
                  'Scarborough',
                  'Etobicoke',
                  'York',
                  'East York',
                ],
              },
              testimonials: [
                {
                  text: 'Got interviews at 3 major Bay Street firms within 2 weeks of getting my resume. Absolutely worth it!',
                  author: 'Michael Chen',
                  position: 'Financial Analyst, Toronto',
                  avatar: '👨‍💼',
                  rating: 5,
                },
                {
                  text: 'As a nurse looking to switch hospitals in Toronto, this resume got me interviews at SickKids and UHN immediately.',
                  author: 'Sarah Johnson',
                  position: 'Registered Nurse, Toronto',
                  avatar: '👩‍⚕️',
                  rating: 5,
                },
              ],
              ctaHeading: 'Ready to Get Started?',
              ctaParagraph:
                'Get your professional resume today and start landing interviews next week.',
              mobileCTAHeading: 'Join Our Success Stories',
              mobileCTAParagraph: 'Ready to be our next success story? Get started today!',
            },
          },
        ],
      } as EnhancedCMSPage,
      brampton: {
        id: 'brampton',
        slug: 'brampton',
        title: 'Professional Resume Writing Services in Brampton',
        content: '',
        status: 'published',
        updatedAt: new Date().toISOString(),
        type: 'location',
        template: 'default',
        locationData: {
          city: 'Brampton',
          province: 'Ontario',
          coordinates: { lat: 43.7315, lng: -79.7624 },
          serviceAreas: ['Downtown Brampton', 'Bramalea', 'Heart Lake', 'Churchville'],
          specificServices: [
            'Manufacturing Resume Writing',
            'Logistics Resume Writing',
            'Healthcare Resume Writing',
          ],
        },
        sections: [
          {
            id: 'location-hero-1',
            type: 'heroSection',
            title: 'Professional Resume Writing Services in Brampton',
            subtitle:
              "Expert Resume Writing for Brampton's Growing Job Market - Manufacturing, Logistics & More",
            order: 1,
            variant: 'location',
            data: {
              buttonText: 'Get Your Brampton Resume Today',
              buttonUrl: 'tel:4377743721',
              backgroundImage: '/images/brampton-city.jpg',
              highlights: [
                'Located Right in Brampton - 1495 Sandalwood Pkwy E',
                'Expert in Local Manufacturing & Logistics Jobs',
                'Serving All Brampton Neighborhoods',
              ],
            },
          },
          {
            id: 'location-services-1',
            type: 'serviceSection',
            title: 'Brampton-Focused Resume Services',
            subtitle:
              "Tailored for Brampton's key industries: manufacturing, logistics, and healthcare",
            order: 2,
            variant: 'location',
            columns: 3,
            data: {
              services: [
                {
                  icon: '🏭',
                  title: 'Manufacturing Resume Writing',
                  description:
                    "Perfect for Brampton's major manufacturing employers and industrial companies.",
                  features: [
                    'Safety Certification Focus',
                    'Production Experience',
                    'Quality Control Skills',
                  ],
                },
                {
                  icon: '🚛',
                  title: 'Logistics & Transportation',
                  description:
                    "Specialized resumes for Brampton's logistics hub and transportation companies.",
                  features: [
                    'CDL & License Highlighting',
                    'Supply Chain Focus',
                    'Warehouse Operations',
                  ],
                },
                {
                  icon: '🏥',
                  title: 'Healthcare Support Roles',
                  description:
                    'For healthcare support roles at Brampton Civic Hospital and local clinics.',
                  features: ['PSW Certification', 'Patient Care Focus', 'Medical Administration'],
                },
              ],
            },
          },
          {
            id: 'location-contact-1',
            type: 'contactSection',
            title: 'Visit Our Brampton Office',
            subtitle: 'Conveniently located in Brampton to serve you better.',
            order: 3,
            variant: 'location',
            layout: 'split',
            data: {
              contact: {
                phone: '437 774 3721',
                email: 'brampton@gtaresumebuilder.com',
                address: '1495 Sandalwood Pkwy E, Brampton, ON L6R 1T2',
                serviceAreas: [
                  'Downtown Brampton',
                  'Bramalea',
                  'Heart Lake',
                  'Churchville',
                  'Caledon',
                ],
              },
              testimonials: [
                {
                  text: 'Working in manufacturing for years, I needed a resume that showed my skills properly. Got 2 interviews within a week!',
                  author: 'Raj Patel',
                  position: 'Production Supervisor, Brampton',
                  avatar: '👨‍🔧',
                  rating: 5,
                },
                {
                  text: 'As a new PSW graduate, this resume helped me land my first job at Brampton Civic Hospital quickly.',
                  author: 'Maria Santos',
                  position: 'Personal Support Worker, Brampton',
                  avatar: '👩‍⚕️',
                  rating: 5,
                },
              ],
              ctaHeading: 'Ready to Get Started?',
              ctaParagraph:
                'Get your professional resume today and start landing interviews next week.',
              mobileCTAHeading: 'Join Our Success Stories',
              mobileCTAParagraph: 'Ready to be our next success story? Get started today!',
            },
          },
        ],
      } as EnhancedCMSPage,
    },
  },
};
