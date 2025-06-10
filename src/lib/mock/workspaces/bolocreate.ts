import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';

export const bolocreate: WorkspaceCMSData = {
  workspace: 'bolocreate',
  settings: {
    siteName: 'GTA Resume Builder',
    siteDescription:
      'Professional Resume Writing That Gets Interviews - Trusted by 100+ Across the Greater Toronto Area',
    theme: {
      primaryColor: '#1E40AF',
      secondaryColor: '#DC2626',
    },
    contact: {
      email: 'gtaresumebuilder@gmail.com',
      phone: '437 774 3721',
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
          type: 'heroSection',
          title: 'Professional Resumes - Only $50',
          subtitle:
            'Delivered in 24 - 48 hours • Trusted by 100+ Across the Greater Toronto Area • Land Interviews Within Weeks',
          order: 1,
          variant: 'default',
          data: {
            buttonText: 'Call Now to Start Your Resume',
            buttonUrl: 'tel:4377743721',
            backgroundImage: '/images/resume-hero-bg.jpg',
          },
        },
        {
          id: 'clients-1',
          type: 'clientsSection',
          title: 'Client Success Stories',
          subtitle: 'Results that Speak for Themselves - Land Interviews Within Weeks',
          order: 2,
          data: {
            clients: [
              { name: 'Sarah M. - PSW', logo: '/images/success/psw-success.png' },
              { name: 'Ahmed K. - Security Guard', logo: '/images/success/security-success.png' },
              { name: 'Maria L. - Customer Service', logo: '/images/success/cs-success.png' },
              {
                name: 'David T. - Warehouse Associate',
                logo: '/images/success/warehouse-success.png',
              },
              { name: 'Jennifer C. - Office Admin', logo: '/images/success/admin-success.png' },
            ],
          },
        },
        {
          id: 'services-1',
          type: 'serviceSection',
          title: 'Our Resume Writing Services',
          subtitle: 'Expert, ATS-compliant, interview-ready resumes for every profession',
          order: 3,
          variant: 'default',
          columns: 3,
          data: {
            services: [
              {
                icon: '📄',
                title: 'Professional Resume Writing',
                description:
                  'Custom-crafted resumes that get past ATS systems and land you interviews. No templates - personalized for your industry.',
                features: [
                  'ATS-Compliant Format',
                  'Industry-Specific Keywords',
                  '60-Day Interview Guarantee',
                ],
              },
              {
                icon: '⚡',
                title: 'Same-Day Rush Service',
                description:
                  'Need your resume urgently? Our same-day delivery service gets you interview-ready in hours, not days.',
                features: ['24-Hour Delivery', 'Priority Support', 'Rush Processing'],
              },
              {
                icon: '🎯',
                title: 'Specialized Industries',
                description:
                  'Expert resume writing for PSWs, security guards, warehouse workers, customer service, and office admin roles.',
                features: ['Healthcare & PSW', 'Security & Safety', 'Warehouse & Logistics'],
              },
            ],
          },
        },
        {
          id: 'footer-1',
          type: 'footerSection',
          title: 'Get Started Today!',
          subtitle: "Ready to land your dream job? Let's craft your winning resume",
          order: 10,
          data: {
            contact: {
              email: 'gtaresumebuilder@gmail.com',
              phone: '437 774 3721 (Call or Text)',
              address: '1495 Sandalwood Pkwy E, Brampton, ON L6R 1T2',
            },
            quickLinks: [
              { label: 'Resume Writing', url: '#services' },
              { label: 'Success Stories', url: '#success' },
              { label: 'Schedule Appointment', url: '#contact' },
            ],
            legalLinks: [
              { label: 'Privacy Policy', url: '/privacy' },
              { label: 'Terms of Service', url: '/terms' },
            ],
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
            order: 3,
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
            },
          },
        ],
      } as EnhancedCMSPage,
    },
  },
};
