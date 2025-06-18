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
      email: 'niravpatelp129@gmail.com',
      phone: 'tel:4377743721',
    },
    socialMedia: {
      linkedin: 'https://linkedin.com/company/gta-resume-builder',
      instagram: 'https://instagram.com/gtaresumebuilder',
      facebook: 'https://facebook.com/gtaresumebuilder',
    },
    seo: {
      keywords: [
        'resume writing services',
        'professional resume writer',
        'Toronto resume services',
        'Brampton resume writing',
        'GTA resume builder',
        'career services',
        'job search help',
        'resume optimization',
        'ATS resume',
        'cover letter writing',
        'LinkedIn profile optimization',
        'career coaching Toronto',
        'resume writing near me',
        'professional CV writing',
      ],
      author: 'GTA Resume Builder Team',
      robots: 'index, follow',
      canonical: 'https://www.printscala.com',
      ogTitle: 'GTA Resume Builder - Professional Resume Writing Services in Toronto & GTA',
      ogDescription:
        'Get hired faster with professionally written resumes. Serving Toronto, Brampton & the entire GTA. ATS-optimized resumes that get interviews. Free consultation available.',
      ogImage: {
        id: 'og-image-resume',
        url: '/images/gta-resume-builder-og.jpg',
        alt: 'GTA Resume Builder - Professional Resume Writing Services',
        width: 1200,
        height: 630,
        mimeType: 'image/jpeg',
        size: 0,
      },
      ogUrl: 'https://www.printscala.com',
      ogSiteName: 'GTA Resume Builder',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'GTA Resume Builder - Professional Resume Writing Services',
      twitterDescription:
        'Get hired faster with professionally written resumes. Serving Toronto, Brampton & the entire GTA. ATS-optimized resumes that get interviews.',
      twitterImage: {
        id: 'twitter-image-resume',
        url: '/images/gta-resume-builder-twitter.jpg',
        alt: 'GTA Resume Builder - Professional Resume Writing Services',
        width: 1200,
        height: 675,
        mimeType: 'image/jpeg',
        size: 0,
      },
      twitterCreator: '@GTAResumeBuilder',
      twitterSite: '@GTAResumeBuilder',
      applicationName: 'GTA Resume Builder',
      themeColor: '#015bf8',
      msapplicationTileColor: '#015bf8',
      manifestPath: '/api/manifest/printscala',
    },
    favicons: {
      icon16: '/favicons/printscala/favicon-16x16.png',
      icon32: '/favicons/printscala/favicon-32x32.png',
      appleTouchIcon: '/favicons/printscala/apple-touch-icon.png',
      safariPinnedTab: '/favicons/printscala/safari-pinned-tab.svg',
      msapplicationTileImage: '/favicons/printscala/mstile-144x144.png',
    },
    favicon: {
      id: 'printscala-favicon',
      url: '/favicons/printscala/favicon.ico',
      alt: 'GTA Resume Builder Favicon',
      mimeType: 'image/x-icon',
      size: 0,
    },
    logo: {
      id: 'printscala-logo',
      url: '/images/gta-resume-builder-logo.png',
      alt: 'GTA Resume Builder Logo',
      width: 200,
      height: 50,
      mimeType: 'image/png',
      size: 0,
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
          subtitle: 'We build resumes that get you interviews, starting with a free consultation.',
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
          title: 'Client Success',
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
            services: [
              {
                name: 'Professional Resume Writing',
                price: '$99',
                subtitle: '2-3 business days',
                description:
                  'Get a professionally written resume that highlights your skills and experience.',
                features: [
                  'ATS-Optimized Format',
                  'Industry-Specific Keywords',
                  '24-48 Hour Turnaround',
                ],
              },
              {
                name: 'Same-Day Rush Service',
                price: '$49',
                subtitle: 'Delivered today',
                description: 'Emergency resume service for urgent job applications.',
                features: ['Same Day Delivery', 'Priority Queue', 'Express Review'],
              },
              {
                name: 'Specialized Industries',
                price: '$129',
                subtitle: '1 session',
                description: 'Industry-specific resume writing with expert consultation.',
                features: ['Industry Expert Review', 'Specialized Keywords', 'Custom Formatting'],
              },
              {
                name: 'Free Consulting',
                price: 'Free',
                subtitle: '20 mins',
                description: 'Free consultation to assess your resume needs.',
                features: ['Resume Review', 'Career Advice', 'Service Recommendations'],
              },
            ],
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
            forms: {
              contactForm: {
                title: 'Contact Details',
                description: 'Please provide your contact information so we can reach you.',
                fields: [
                  {
                    name: 'name',
                    label: 'Name *',
                    type: 'text',
                    placeholder: 'Jane Smith',
                    required: true,
                  },
                  {
                    name: 'email',
                    label: 'Email address *',
                    type: 'email',
                    placeholder: 'email@website.com',
                    required: true,
                  },
                  {
                    name: 'phone',
                    label: 'Phone number *',
                    type: 'tel',
                    placeholder: '555-555-5555',
                    required: true,
                  },
                  {
                    name: 'files',
                    label: 'Upload your current resume (optional)',
                    type: 'file',
                    required: false,
                    accept: '.pdf,.doc,.docx,.txt',
                    multiple: true,
                    maxSize: 5,
                    maxFiles: 3,
                    description:
                      'Upload your current resume so we can review it and provide better suggestions. PDF, DOC, DOCX, or TXT files only.',
                  },
                  {
                    name: 'message',
                    label: 'Message',
                    type: 'textarea',
                    placeholder: 'Your message here...',
                    required: false,
                    rows: 4,
                  },
                ],
                consentField: {
                  name: 'consent',
                  label:
                    'I allow this website to store my submission so they can respond to my inquiry. *',
                  required: true,
                },
              },
              callbackForm: {
                title: 'Schedule a Callback',
                description: 'Choose a time that works for you or request an immediate callback.',
                timingOptions: [
                  {
                    value: 'asap',
                    label: 'ASAP',
                    description: 'We will call you back as soon as possible',
                  },
                  {
                    value: 'scheduled',
                    label: 'Schedule',
                    description: 'Choose a specific time for your callback',
                  },
                ],
                fields: [
                  {
                    name: 'name',
                    label: 'Your Name *',
                    type: 'text',
                    placeholder: 'Jane Smith',
                    required: true,
                  },
                  {
                    name: 'phone',
                    label: 'Phone Number *',
                    type: 'tel',
                    placeholder: '555-555-5555',
                    required: true,
                  },
                  {
                    name: 'date',
                    label: 'Preferred Date *',
                    type: 'date',
                    required: true,
                    showWhen: 'scheduled',
                  },
                  {
                    name: 'time',
                    label: 'Preferred Time *',
                    type: 'time',
                    required: true,
                    showWhen: 'scheduled',
                  },
                  {
                    name: 'notes',
                    label: 'Additional Notes',
                    type: 'textarea',
                    placeholder: "Any specific topics you'd like to discuss?",
                    required: false,
                    rows: 4,
                  },
                ],
              },
              callNowSection: {
                title: 'Call Now',
                description: 'Get immediate assistance from our team',
                buttonText: 'Start Call',
                icon: 'phone',
              },
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
              email: 'niravpatelp129@gmail.com',
              phone: '437 774 3721 (Call or Text)',
              address: '1495 Sandalwood Pkwy E, Brampton, ON L6R 1T2',
            },
            socials: {
              linkedin: 'https://linkedin.com/company/gta-resume-builder',
              instagram: 'https://instagram.com/gtaresumebuilder',
              facebook: 'https://facebook.com/gtaresumebuilder',
            },
            tagline: 'Building success through innovation and dedication.',
            ctaButtonText: 'Get Started',
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
