export const mockCMSData = {
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
  cms: {
    navigation: [
      { id: 1, label: 'Home', url: '#home', target: '_self' as const, order: 1 },
      { id: 2, label: 'Services', url: '#services', target: '_self' as const, order: 2 },
      { id: 3, label: 'Success Stories', url: '#success', target: '_self' as const, order: 3 },
      { id: 4, label: 'About', url: '#about', target: '_self' as const, order: 4 },
      { id: 5, label: 'Contact', url: '#contact', target: '_self' as const, order: 5 },
    ],
    sections: [
      {
        id: 1,
        type: 'heroSection',
        title: 'Professional Resumes - Only $50',
        subtitle:
          'Delivered in 24 - 48 hours • Trusted by 100+ Across the Greater Toronto Area • Land Interviews Within Weeks',
        buttonText: 'Call Now to Start Your Resume',
        buttonUrl: 'tel:4377743721',
        backgroundImage: '/images/resume-hero-bg.jpg',
      },
      {
        id: 2,
        type: 'clientsSection',
        title: 'Client Success Stories',
        subtitle: 'Results that Speak for Themselves - Land Interviews Within Weeks',
        clients: [
          { name: 'Sarah M. - PSW', logo: '/images/success/psw-success.png' },
          { name: 'Ahmed K. - Security Guard', logo: '/images/success/security-success.png' },
          { name: 'Maria L. - Customer Service', logo: '/images/success/cs-success.png' },
          { name: 'David T. - Warehouse Associate', logo: '/images/success/warehouse-success.png' },
          { name: 'Jennifer C. - Office Admin', logo: '/images/success/admin-success.png' },
        ],
      },
      {
        id: 3,
        type: 'serviceSection',
        title: 'Our Resume Writing Services',
        subtitle: 'Expert, ATS-compliant, interview-ready resumes for every profession',
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
      {
        id: 4,
        type: 'outcomesSection',
        title: 'Proven Results That Get You Hired',
        subtitle: 'Why thousands trust us with their career success',
        outcomes: [
          { metric: '100+', label: 'Clients Helped Across Canada', icon: '🍁' },
          { metric: '60-Day', label: 'Interview Guarantee', icon: '✅' },
          { metric: '24-48hrs', label: 'Standard Delivery', icon: '⚡' },
          { metric: '$50', label: 'Affordable Pricing', icon: '💰' },
        ],
      },
      {
        id: 5,
        type: 'storySection',
        title: 'Empowering Job Seekers Across Canada',
        subtitle: 'Professional Resume Writing That Gets Interviews',
        story: {
          founding: '2020',
          mission:
            'At GTA Resume Builder, we help job seekers craft expert, ATS-compliant, interview-ready resumes across Canada — including Toronto, Mississauga, Brampton, Caledon, Vancouver, Calgary, and Montreal.',
          vision:
            "To be Canada's most trusted resume writing service, helping every job seeker land their dream job faster.",
          values: ['Quality', 'Speed', 'Affordability', 'Results'],
          milestones: [
            { year: '2020', event: 'Founded to help job seekers during the pandemic' },
            { year: '2021', event: 'Helped first 50 clients land interviews within weeks' },
            { year: '2023', event: 'Expanded services across all major Canadian cities' },
            { year: '2024', event: 'Trusted by 100+ clients with 60-day interview guarantee' },
          ],
        },
      },
      {
        id: 6,
        type: 'socialsSection',
        title: 'What Our Clients Say',
        subtitle: 'Real testimonials from job seekers who landed their dream jobs',
        socialLinks: [
          {
            platform: 'LinkedIn',
            url: 'https://linkedin.com/company/gta-resume-builder',
            icon: '💼',
          },
          { platform: 'Instagram', url: 'https://instagram.com/gtaresumebuilder', icon: '📸' },
          { platform: 'Facebook', url: 'https://facebook.com/gtaresumebuilder', icon: '📘' },
          { platform: 'Google Reviews', url: 'https://g.page/gtaresumebuilder', icon: '⭐' },
        ],
        testimonials: [
          {
            text: 'I got 3 interview calls within 2 weeks of getting my resume from GTA Resume Builder. The investment was worth every penny!',
            author: 'Sarah Martinez',
            position: 'PSW, Brampton',
            avatar: '👩‍⚕️',
          },
          {
            text: 'As a new immigrant to Canada, I struggled with my resume format. GTA Resume Builder helped me land my first Canadian job in security within a month!',
            author: 'Ahmed Khan',
            position: 'Security Guard, Mississauga',
            avatar: '👨‍💼',
          },
          {
            text: 'Fast, professional, and affordable. Got my resume delivered in 24 hours and started getting interview calls immediately.',
            author: 'Jennifer Chen',
            position: 'Office Administrator, Toronto',
            avatar: '👩‍💻',
          },
        ],
      },
      {
        id: 7,
        type: 'footerSection',
        title: 'Get Started Today!',
        subtitle: "Ready to land your dream job? Let's craft your winning resume",
        contact: {
          email: 'gtaresumebuilder@gmail.com',
          phone: '437 774 3721 (Call or Text)',
          address: '1495 Sandalwood Pkwy E, Brampton, ON L6R 1T2',
        },
        quickLinks: [
          { label: 'Resume Writing', url: '#services' },
          { label: 'Success Stories', url: '#success' },
          { label: 'Schedule Appointment', url: '#contact' },
          { label: 'Same-Day Service', url: '#rush' },
        ],
        legalLinks: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
          { label: 'Refund Policy', url: '/refund' },
        ],
        additionalInfo: {
          citiesServed: [
            'Brampton',
            'Mississauga',
            'North York',
            'Vaughan',
            'Scarborough',
            'Etobicoke',
            'Markham',
            'Toronto',
            'Caledon',
            'Milton',
          ],
          specializations: [
            'PSW Resumes',
            'Security Guard Resumes',
            'Warehouse Worker Resumes',
            'Customer Service Resumes',
            'Office Admin Resumes',
            'New Immigrant Resumes',
          ],
        },
      },
    ],
  },
  about:
    "Whether you're new to Canada, a recent graduate, switching careers, or simply ready for your next opportunity — we're here to help you stand out and get hired, faster. With over 100+ clients helped across Canada, we offer a 60-day interview guarantee and specialize in creating personalized, ATS-compliant resumes with no templates.",
};
