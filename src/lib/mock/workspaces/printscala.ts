import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';

export const printscala: WorkspaceCMSData = {
  workspace: 'printscala',
  settings: {
    siteName: 'GTA Resume Builder',
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
      email: 'gtaresumebuilder@gmail.com',
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
          type: 'heroSection',
          title: 'Professional Resumes.',
          subtitle: 'We build resumes that get you interviews and brand you as a professional.',
          order: 1,
          variant: 'default',
          data: {
            buttonText: 'Get Started',
            buttonAction: 'openOnboardingSheet',
            backgroundImage: '/images/resume-hero-bg.jpg',
            buttons: [{ type: 'callOrText', text: 'Get Started', url: 'tel:4377743721' }],
          },
        },
        {
          id: 'team-1',
          type: 'teamSection',
          title: 'Our team',
          subtitle:
            'We craft solutions that amplify key characteristics, achieving a harmonious balance of function and intent. Through careful analysis and collaborative engagement, our spaces transcend the conventional.',
          order: 3,
          data: {
            buttonText: 'Read more',
            team: [
              {
                name: 'Michael Scott',
                role: 'Co-Founder, Chief Architect',
                image: 'https://i.postimg.cc/mrR8sf7p/a4.avif',
              },
              {
                name: 'Chandler Rigs',
                role: 'Co-Founder, Architect',
                image: 'https://i.postimg.cc/mrR8sf7p/a4.avif',
              },
              {
                name: 'Isabella Rodriguez',
                role: 'Architect',
                image: 'https://i.postimg.cc/mrR8sf7p/a4.avif',
              },
              {
                name: 'Ava Wilson',
                role: '3D Artist',
                image: 'https://i.postimg.cc/mrR8sf7p/a4.avif',
              },
            ],
          },
        },
        {
          id: 'clients-1',
          type: 'clientsSection',
          title: 'Client Success Stories',
          subtitle: 'Results that Speak for Themselves - Land Interviews Within Weeks',
          order: 4,
          data: {
            clients: [
              {
                name: 'Sarah M.',
                profession: 'Personal Support Worker',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Landed 4 interviews within 2 weeks',
              },
              {
                name: 'Ahmed K.',
                profession: 'Security Guard',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Got hired at premium security firm',
              },
              {
                name: 'Maria L.',
                profession: 'Customer Service Rep',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: '3 job offers in first month',
              },
              {
                name: 'David T.',
                profession: 'Warehouse Associate',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: '40% salary increase at new job',
              },
              {
                name: 'Jennifer C.',
                profession: 'Office Administrator',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Promoted to supervisor role',
              },
              {
                name: 'Raj P.',
                profession: 'Forklift Operator',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Landed dream job at FedEx',
              },
              {
                name: 'Lisa W.',
                profession: 'Receptionist',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: '5 interviews in 3 weeks',
              },
              {
                name: 'Carlos M.',
                profession: 'Maintenance Tech',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Got into tech apprenticeship',
              },
              {
                name: 'Priya S.',
                profession: 'Registered Nurse',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Hired at Toronto General Hospital',
              },
              {
                name: 'Michael T.',
                profession: 'Truck Driver',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Secured long-haul position',
              },
              {
                name: 'Jessica R.',
                profession: 'Data Entry Clerk',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Remote work opportunity found',
              },
              {
                name: 'Hassan A.',
                profession: 'Food Service Worker',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Became restaurant supervisor',
              },
              {
                name: 'Karen L.',
                profession: 'Retail Manager',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'District manager promotion',
              },
              {
                name: 'Tony G.',
                profession: 'Construction Worker',
                logo: 'https://cdn.prod.website-files.com/666eec3edcc552b5eecc7fcd/673b3eea9f5ea46db334110b_gyro-main-2.jpg',
                result: 'Site supervisor position secured',
              },
            ],
          },
        },
        {
          id: 'google-reviews-1',
          type: 'googleReviewsSection',
          title: "See why we're rated #1 in the business",
          subtitle:
            'Real Google Reviews from Real Clients - Trusted by 100+ Professionals Across the GTA',
          order: 5,
          variant: 'default',
          data: {
            reviews: [
              {
                id: '1',
                author: 'Sarah Thompson',
                rating: 5,
                text: 'Amazing service! Got my resume done in 24 hours and landed 3 interviews within a week. Highly recommend!',
                date: '2024-01-15',
                profession: 'Registered Nurse',
                avatar: '👩‍⚕️',
                source: 'google',
              },
              {
                id: '2',
                author: 'Ahmed Hassan',
                rating: 5,
                text: 'Professional and fast service. My new resume got me hired at a security company with better pay. Worth every penny!',
                date: '2024-01-10',
                profession: 'Security Guard',
                avatar: '👨‍💼',
                source: 'google',
              },
              {
                id: '3',
                author: 'Maria Rodriguez',
                rating: 5,
                text: 'Excellent work! The team understood exactly what I needed for customer service roles. Got multiple job offers!',
                date: '2024-01-08',
                profession: 'Customer Service Representative',
                avatar: '👩‍💻',
                source: 'google',
              },
              {
                id: '4',
                author: 'David Chen',
                rating: 5,
                text: 'Outstanding resume writing service. Helped me transition from warehouse work to a supervisory role. Thank you!',
                date: '2024-01-05',
                profession: 'Warehouse Supervisor',
                avatar: '👨‍🔧',
                source: 'google',
              },
              {
                id: '5',
                author: 'Jennifer Wilson',
                rating: 5,
                text: 'Very impressed with the quality and speed. My office admin resume looks so professional now. Highly recommend!',
                date: '2024-01-03',
                profession: 'Office Administrator',
                avatar: '👩‍💼',
                source: 'google',
              },
              {
                id: '6',
                author: 'Raj Patel',
                rating: 5,
                text: 'Great experience! Got my forklift operator resume done quickly and landed my dream job at FedEx. Thank you so much!',
                date: '2024-01-01',
                profession: 'Forklift Operator',
                avatar: '👨‍🏭',
                source: 'google',
              },
            ],
            showGoogleBadge: true,
            averageRating: 5.0,
            totalReviews: 127,
          },
        },
        {
          id: 'onboarding-services-1',
          type: 'onboardingServiceSection',
          title: 'Start Your Resume in Minutes',
          subtitle: 'Interactive onboarding to match you with the perfect resume service',
          order: 7,
          variant: 'onboarding',
          data: {
            description:
              "Answer a few quick questions and we'll guide you to the right service. At the end, you'll get a personalized contact form based on your choices. All in a clean, right-side sheet (shadcn).",
            steps: [
              {
                id: 'role',
                question: 'What type of role are you applying for?',
                options: [
                  'Healthcare (e.g. PSW, Nurse)',
                  'Security',
                  'Warehouse/Logistics',
                  'Office/Admin',
                  'Customer Service',
                  'Other',
                ],
              },
              {
                id: 'urgency',
                question: 'How soon do you need your resume?',
                options: ['Within 24 hours', '2-3 days', 'Flexible'],
              },
              {
                id: 'experience',
                question: 'What is your experience level?',
                options: ['Entry Level', 'Mid Level', 'Senior/Management'],
              },
            ],
            contactForm: {
              dynamic: true,
              description:
                'The contact form at the end adapts to your answers (e.g., asks for certifications if Healthcare, or license if Security/Logistics).',
              baseFields: [
                { label: 'Full Name', type: 'text', required: true },
                { label: 'Email', type: 'email', required: true },
                { label: 'Phone', type: 'tel', required: false },
              ],
              dynamicFields: [
                {
                  dependsOn: 'role',
                  value: 'Healthcare (e.g. PSW, Nurse)',
                  fields: [{ label: 'Healthcare Certifications', type: 'text', required: false }],
                },
                {
                  dependsOn: 'role',
                  value: 'Security',
                  fields: [{ label: 'Security License Number', type: 'text', required: false }],
                },
                {
                  dependsOn: 'role',
                  value: 'Warehouse/Logistics',
                  fields: [{ label: 'Forklift License', type: 'text', required: false }],
                },
              ],
            },
            sheet: {
              position: 'right',
              style: 'shadcn',
            },
          },
        },
        {
          id: 'instagram-1',
          type: 'instagramSection',
          title: 'Follow Our Journey',
          subtitle: 'See our latest projects and behind-the-scenes moments',
          order: 9,
          data: {
            instagramUrl: 'https://www.instagram.com/lukedobsonn',
          },
        },
        {
          id: 'services-1',
          type: 'serviceSection',
          title: 'Professional Resume Writing Services',
          subtitle: 'Expert resume writing tailored to your industry and career goals',
          order: 9,
          variant: 'default',
          columns: 3,
          data: {
            services: [
              {
                icon: '📝',
                title: 'Professional Resume Writing',
                description:
                  'Get a professionally written resume that highlights your skills and experience.',
                features: [
                  'ATS-Optimized Format',
                  'Industry-Specific Keywords',
                  '24-48 Hour Turnaround',
                ],
              },
              {
                icon: '🎯',
                title: 'Career Change Resumes',
                description:
                  'Transition smoothly to a new industry with a resume that emphasizes transferable skills.',
                features: [
                  'Transferable Skills Focus',
                  'Industry Research',
                  'Career Path Planning',
                ],
              },
              {
                icon: '📈',
                title: 'Executive Resume Writing',
                description:
                  'Stand out in senior-level positions with an executive resume that showcases leadership.',
                features: [
                  'Leadership Highlighting',
                  'Strategic Achievements',
                  'Board-Ready Format',
                ],
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
