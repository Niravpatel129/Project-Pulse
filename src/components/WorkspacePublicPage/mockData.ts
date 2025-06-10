export const mockCMSData = {
  settings: {
    siteName: 'Pulse Solutions',
    siteDescription: 'Your trusted partner for exceptional service and innovative solutions',
    theme: {
      primaryColor: '#7C3AED',
      secondaryColor: '#2563EB',
    },
    contact: {
      email: 'hello@pulsesolutions.com',
      phone: '+1 (555) 123-4567',
    },
    socialMedia: {
      linkedin: 'https://linkedin.com/company/pulse-solutions',
      twitter: 'https://twitter.com/pulsesolutions',
      facebook: 'https://facebook.com/pulsesolutions',
    },
  },
  cms: {
    navigation: [
      { id: 1, label: 'Home', url: '#home', target: '_self' as const, order: 1 },
      { id: 2, label: 'Services', url: '#services', target: '_self' as const, order: 2 },
      { id: 3, label: 'About', url: '#about', target: '_self' as const, order: 3 },
      { id: 4, label: 'Contact', url: '#contact', target: '_self' as const, order: 4 },
    ],
    sections: [
      {
        id: 1,
        type: 'heroSection',
        title: 'Transform Your Business with Pulse Solutions',
        subtitle:
          'We deliver cutting-edge solutions that drive growth and innovation for your business',
        buttonText: 'Get Started Today',
        buttonUrl: '#contact',
        backgroundImage: '/images/hero-bg.jpg',
      },
      {
        id: 2,
        type: 'clientsSection',
        title: 'Trusted by Industry Leaders',
        subtitle:
          'Join hundreds of satisfied clients who have transformed their businesses with us',
        clients: [
          { name: 'TechCorp', logo: '/images/logos/techcorp.png' },
          { name: 'InnovateLab', logo: '/images/logos/innovatelab.png' },
          { name: 'FutureWorks', logo: '/images/logos/futureworks.png' },
          { name: 'DataDrive', logo: '/images/logos/datadrive.png' },
          { name: 'CloudFirst', logo: '/images/logos/cloudfirst.png' },
        ],
      },
      {
        id: 3,
        type: 'serviceSection',
        title: 'Our Core Services',
        subtitle: 'Comprehensive solutions tailored to your business needs',
        services: [
          {
            icon: '🚀',
            title: 'Digital Transformation',
            description:
              'Modernize your business with our comprehensive digital solutions and expert guidance.',
            features: ['Cloud Migration', 'Process Automation', 'Digital Strategy'],
          },
          {
            icon: '💼',
            title: 'Business Consulting',
            description:
              'Strategic consulting services to optimize your operations and maximize efficiency.',
            features: ['Strategic Planning', 'Process Optimization', 'Change Management'],
          },
          {
            icon: '🎯',
            title: 'Custom Development',
            description:
              'Tailored software solutions built specifically for your unique business requirements.',
            features: ['Web Applications', 'Mobile Apps', 'API Integration'],
          },
        ],
      },
      {
        id: 4,
        type: 'outcomesSection',
        title: 'Proven Results That Matter',
        subtitle: 'Our track record speaks for itself',
        outcomes: [
          { metric: '500+', label: 'Projects Completed', icon: '📊' },
          { metric: '98%', label: 'Client Satisfaction', icon: '😊' },
          { metric: '40%', label: 'Average Growth', icon: '📈' },
          { metric: '24/7', label: 'Support Available', icon: '🛠️' },
        ],
      },
      {
        id: 5,
        type: 'storySection',
        title: 'Our Story',
        subtitle: 'Building excellence since day one',
        story: {
          founding: '2018',
          mission:
            'To empower businesses through innovative technology solutions that drive growth and efficiency.',
          vision:
            'To be the leading partner for digital transformation, helping companies thrive in the modern economy.',
          values: ['Innovation', 'Excellence', 'Integrity', 'Collaboration'],
          milestones: [
            { year: '2018', event: 'Company founded with a vision to transform businesses' },
            { year: '2020', event: 'Reached 100+ successful project completions' },
            { year: '2022', event: 'Expanded services to include AI and automation' },
            { year: '2024', event: 'Serving 500+ clients across multiple industries' },
          ],
        },
      },
      {
        id: 6,
        type: 'socialsSection',
        title: 'Connect With Us',
        subtitle: 'Follow our journey and stay updated with the latest news',
        socialLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/company/pulse-solutions', icon: '💼' },
          { platform: 'Twitter', url: 'https://twitter.com/pulsesolutions', icon: '🐦' },
          { platform: 'Facebook', url: 'https://facebook.com/pulsesolutions', icon: '📘' },
          { platform: 'Instagram', url: 'https://instagram.com/pulsesolutions', icon: '📸' },
        ],
        testimonials: [
          {
            text: 'Pulse Solutions transformed our business processes and helped us achieve 40% growth in just 6 months.',
            author: 'John Smith',
            position: 'CEO, TechCorp',
            avatar: '👨‍💼',
          },
          {
            text: 'Outstanding service and innovative solutions. They truly understand our business needs.',
            author: 'Maria Johnson',
            position: 'Founder, InnovateLab',
            avatar: '👩‍💼',
          },
        ],
      },
      {
        id: 7,
        type: 'footerSection',
        title: 'Ready to Get Started?',
        subtitle: "Let's discuss how we can help transform your business",
        contact: {
          email: 'hello@pulsesolutions.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Ave, Suite 100, Tech City, TC 12345',
        },
        quickLinks: [
          { label: 'About Us', url: '#about' },
          { label: 'Services', url: '#services' },
          { label: 'Portfolio', url: '#portfolio' },
          { label: 'Contact', url: '#contact' },
        ],
        legalLinks: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
          { label: 'Cookie Policy', url: '/cookies' },
        ],
      },
    ],
  },
  about:
    "We are a forward-thinking company dedicated to providing exceptional service and innovative solutions that help our clients achieve their goals. With years of experience and a commitment to excellence, we're here to support your success every step of the way.",
};
