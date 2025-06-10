// Export all mock workspace data
export * from './workspaces';

// Export dev helpers
export { DevPanel } from './dev-panel';

// Development mode check
export const isDevelopment = process.env.NODE_ENV === 'development';

// Quick access to mock workspace slugs for dev
export const DEV_WORKSPACE_SLUGS = ['bolocreate', 'techcorp', 'localservice'];

// Development configuration
export const DEV_CONFIG = {
  // Default mock workspace for dev
  defaultWorkspace: 'bolocreate',
  // Enable dev panel in development
  showDevPanel: process.env.NODE_ENV === 'development',
  // Mock API responses in dev
  mockApiResponses: process.env.NODE_ENV === 'development',
};

// Development workspace switcher data
export const DEV_WORKSPACES = [
  {
    slug: 'bolocreate',
    name: 'GTA Resume Builder',
    description: 'Resume writing service with location pages',
    industry: 'Professional Services',
    hasLocations: true,
    locations: ['toronto', 'brampton'],
  },
  {
    slug: 'techcorp',
    name: 'TechCorp Solutions',
    description: 'Software development and IT consulting',
    industry: 'Technology',
    hasLocations: false,
    locations: [],
  },
  {
    slug: 'localservice',
    name: 'Elite Home Services',
    description: 'Home maintenance and repair services',
    industry: 'Home Services',
    hasLocations: true,
    locations: ['mississauga'],
  },
];

/**
 * Get a random mock workspace slug for testing
 */
export const getRandomMockWorkspace = () => {
  const slugs = DEV_WORKSPACE_SLUGS;
  return slugs[Math.floor(Math.random() * slugs.length)];
};
