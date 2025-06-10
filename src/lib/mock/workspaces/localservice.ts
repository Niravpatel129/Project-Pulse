import { EnhancedCMSPage, WorkspaceCMSData } from '@/lib/cms';

export const localservice: WorkspaceCMSData = {
  workspace: 'localservice',
  settings: {
    siteName: 'Elite Home Services',
    siteDescription: 'Premium Home Maintenance & Repair Services in the GTA',
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#DC2626',
    },
    contact: {
      email: 'info@elitehomeservices.ca',
      phone: '416-HOME-ELITE',
    },
    socialMedia: {
      facebook: 'https://facebook.com/elitehomeservices',
      instagram: 'https://instagram.com/elitehomeservices',
    },
  },
  navigation: [
    { id: '1', label: 'Home', url: '/', target: '_self', order: 1 },
    { id: '2', label: 'Services', url: '#services', target: '_self', order: 2 },
    { id: '3', label: 'Locations', url: '/locations', target: '_self', order: 3 },
    { id: '4', label: 'Reviews', url: '#reviews', target: '_self', order: 4 },
    { id: '5', label: 'Contact', url: '#contact', target: '_self', order: 5 },
  ],
  pages: {
    home: {
      id: 'home',
      slug: 'home',
      title: 'Elite Home Services - Premium Home Maintenance & Repair in the GTA',
      content: '',
      status: 'published',
      updatedAt: new Date().toISOString(),
      type: 'home',
      template: 'landing',
      sections: [
        {
          id: 'hero-1',
          type: 'heroSection',
          title: 'Your Home Deserves Elite Care',
          subtitle:
            'Professional plumbing, electrical, HVAC, and home maintenance services across the Greater Toronto Area',
          order: 1,
          variant: 'default',
          data: {
            buttonText: 'Get Free Estimate',
            buttonUrl: 'tel:416-HOME-ELITE',
            backgroundImage: '/images/home-services-hero.jpg',
            overlayOpacity: 0.6,
          },
        },
        {
          id: 'services-1',
          type: 'serviceSection',
          title: 'Professional Home Services',
          subtitle: 'Licensed, insured, and trusted by homeowners across the GTA',
          order: 2,
          variant: 'pricing',
          columns: 3,
          data: {
            services: [
              {
                icon: '🔧',
                title: 'Plumbing Services',
                description:
                  'From leaky faucets to full bathroom renovations, our certified plumbers handle it all.',
                features: [
                  'Emergency Repairs',
                  'Fixture Installation',
                  'Pipe Replacement',
                  'Drain Cleaning',
                ],
                pricing: 'Starting at $89/hour',
                cta: { text: 'Book Plumber', url: 'tel:416-HOME-ELITE' },
              },
              {
                icon: '⚡',
                title: 'Electrical Work',
                description:
                  'Safe, code-compliant electrical services from panel upgrades to smart home installations.',
                features: [
                  'Panel Upgrades',
                  'Outlet Installation',
                  'Smart Home Setup',
                  'Safety Inspections',
                ],
                pricing: 'Starting at $99/hour',
                cta: { text: 'Book Electrician', url: 'tel:416-HOME-ELITE' },
              },
              {
                icon: '🌡️',
                title: 'HVAC Services',
                description:
                  'Keep your home comfortable year-round with our heating and cooling expertise.',
                features: [
                  'AC Installation',
                  'Furnace Repair',
                  'Duct Cleaning',
                  'Maintenance Plans',
                ],
                pricing: 'Starting at $79/hour',
                cta: { text: 'Book HVAC Tech', url: 'tel:416-HOME-ELITE' },
              },
            ],
          },
        },
        {
          id: 'contact-1',
          type: 'contactSection',
          title: 'Ready to Get Started?',
          subtitle: 'Contact us today for a free estimate on your home service needs',
          order: 3,
          variant: 'default',
          layout: 'split',
          showServiceAreas: true,
          data: {
            contact: {
              email: 'info@elitehomeservices.ca',
              phone: '416-HOME-ELITE',
              address: 'Serving Greater Toronto Area',
              serviceAreas: [
                'Toronto',
                'Mississauga',
                'Brampton',
                'Markham',
                'Richmond Hill',
                'Vaughan',
              ],
              hours: {
                monday: '7:00 AM - 7:00 PM',
                tuesday: '7:00 AM - 7:00 PM',
                wednesday: '7:00 AM - 7:00 PM',
                thursday: '7:00 AM - 7:00 PM',
                friday: '7:00 AM - 7:00 PM',
                saturday: '8:00 AM - 5:00 PM',
                sunday: 'Emergency Only',
              },
            },
            emergencyMessage: '24/7 Emergency Service Available - Call Now!',
          },
        },
      ],
    } as EnhancedCMSPage,
    locations: {
      mississauga: {
        id: 'mississauga',
        slug: 'mississauga',
        title: 'Home Services in Mississauga - Elite Home Services',
        content: '',
        status: 'published',
        updatedAt: new Date().toISOString(),
        type: 'location',
        template: 'default',
        locationData: {
          city: 'Mississauga',
          province: 'Ontario',
          coordinates: { lat: 43.589, lng: -79.6441 },
          serviceAreas: ['Downtown Mississauga', 'Port Credit', 'Streetsville', 'Meadowvale'],
          specificServices: ['Condo Plumbing', 'Townhouse Electrical', 'High-rise HVAC'],
        },
        sections: [
          {
            id: 'location-hero-1',
            type: 'heroSection',
            title: 'Premium Home Services in Mississauga',
            subtitle:
              'Trusted by Mississauga homeowners for over 10 years - plumbing, electrical, and HVAC services',
            order: 1,
            variant: 'location',
            data: {
              buttonText: 'Call Mississauga Team',
              buttonUrl: 'tel:416-HOME-ELITE',
              backgroundImage: '/images/mississauga-homes.jpg',
              highlights: [
                'Serving All Mississauga Neighborhoods',
                'Same-Day Service Available',
                'Licensed & Insured Technicians',
              ],
            },
          },
          {
            id: 'location-contact-1',
            type: 'contactSection',
            title: 'Mississauga Home Services',
            subtitle: 'Your local home service experts in Mississauga',
            order: 2,
            variant: 'location',
            layout: 'split',
            data: {
              contact: {
                phone: '416-HOME-ELITE',
                email: 'mississauga@elitehomeservices.ca',
                serviceAreas: [
                  'Downtown Mississauga',
                  'Port Credit',
                  'Streetsville',
                  'Meadowvale',
                  'Square One Area',
                ],
              },
              testimonials: [
                {
                  text: 'Had an emergency plumbing issue on Sunday night. They came out within 2 hours and fixed everything perfectly!',
                  author: 'Jennifer L.',
                  position: 'Homeowner, Port Credit',
                  avatar: '🏠',
                  rating: 5,
                },
                {
                  text: 'Upgraded our entire electrical panel. Professional, clean work, and great communication throughout.',
                  author: 'Mike S.',
                  position: 'Homeowner, Streetsville',
                  avatar: '⚡',
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
