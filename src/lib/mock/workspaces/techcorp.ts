import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';

export const techcorp: WorkspaceCMSData = {
  workspace: 'techcorp',
  settings: {
    siteName: 'TechCorp Solutions',
    siteDescription: 'Innovative Software Development & IT Consulting Services',
    theme: {
      primaryColor: '#0F172A',
      secondaryColor: '#3B82F6',
    },
    contact: {
      email: 'hello@techcorp.dev',
      phone: '1-800-TECH-CORP',
    },
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techcorp-solutions',
      twitter: 'https://twitter.com/techcorpsolutions',
    },
  },
  navigation: [
    { id: '1', label: 'Home', url: '/', target: '_self', order: 1 },
    { id: '2', label: 'Services', url: '#services', target: '_self', order: 2 },
    { id: '3', label: 'Portfolio', url: '#portfolio', target: '_self', order: 3 },
    { id: '4', label: 'About', url: '#about', target: '_self', order: 4 },
    { id: '5', label: 'Contact', url: '#contact', target: '_self', order: 5 },
  ],
  pages: {
    home: {
      id: 'home',
      slug: 'home',
      title: 'TechCorp Solutions - Software Development & IT Consulting',
      content: '',
      status: 'published',
      updatedAt: new Date().toISOString(),
      type: 'home',
      template: 'default',
      sections: [
        {
          id: 'hero-1',
          type: 'heroSection',
          title: 'Building the Future, One Line of Code at a Time',
          subtitle:
            'Full-stack development, cloud architecture, and digital transformation for modern businesses',
          order: 1,
          variant: 'minimal',
          data: {
            buttonText: 'Start Your Project',
            buttonUrl: '#contact',
            backgroundImage: '/images/tech-hero-bg.jpg',
            textAlign: 'left',
            minHeight: '80vh',
          },
        },
        {
          id: 'services-1',
          type: 'serviceSection',
          title: 'Our Development Services',
          subtitle: 'From concept to deployment, we build scalable solutions that drive results',
          order: 2,
          variant: 'cards',
          columns: 2,
          backgroundColor: '#F8FAFC',
          data: {
            services: [
              {
                icon: '⚛️',
                title: 'Frontend Development',
                description:
                  'Modern, responsive web applications using React, Next.js, and cutting-edge technologies.',
                features: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'Mobile-First Design'],
                cta: { text: 'View Frontend Work', url: '#portfolio' },
              },
              {
                icon: '🚀',
                title: 'Backend Development',
                description:
                  'Scalable APIs and microservices architecture built for performance and reliability.',
                features: [
                  'Node.js & Python',
                  'API Development',
                  'Database Design',
                  'Cloud Integration',
                ],
                cta: { text: 'See Backend Solutions', url: '#portfolio' },
              },
              {
                icon: '☁️',
                title: 'Cloud Architecture',
                description: 'AWS and Azure infrastructure that scales with your business needs.',
                features: [
                  'AWS & Azure',
                  'DevOps & CI/CD',
                  'Serverless Functions',
                  'Container Orchestration',
                ],
                cta: { text: 'Explore Cloud Services', url: '#contact' },
              },
              {
                icon: '📱',
                title: 'Mobile Development',
                description:
                  'Native and cross-platform mobile apps that deliver exceptional user experiences.',
                features: [
                  'React Native',
                  'iOS & Android',
                  'Push Notifications',
                  'App Store Deployment',
                ],
                cta: { text: 'See Mobile Apps', url: '#portfolio' },
              },
            ],
          },
        },
        {
          id: 'contact-1',
          type: 'contactSection',
          title: 'Ready to Build Something Amazing?',
          subtitle: "Let's discuss your project and turn your vision into reality",
          order: 3,
          variant: 'full',
          layout: 'centered',
          data: {
            contact: {
              email: 'hello@techcorp.dev',
              phone: '1-800-TECH-CORP',
              address: 'Toronto, ON - Remote Worldwide',
            },
            formFields: [
              { name: 'name', label: 'Full Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'company', label: 'Company', type: 'text', required: false },
              {
                name: 'project',
                label: 'Project Type',
                type: 'select',
                options: ['Web App', 'Mobile App', 'API Development', 'Cloud Migration', 'Other'],
                required: true,
              },
              {
                name: 'budget',
                label: 'Budget Range',
                type: 'select',
                options: ['$10K - $25K', '$25K - $50K', '$50K - $100K', '$100K+'],
                required: false,
              },
              { name: 'message', label: 'Project Details', type: 'textarea', required: true },
            ],
          },
        },
      ],
    } as EnhancedCMSPage,
    locations: {},
  },
};
