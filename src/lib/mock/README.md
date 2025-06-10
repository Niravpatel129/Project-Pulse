# Mock Data for Development

This directory contains organized mock data for development and testing of the multi-tenant CMS platform.

## Structure

```
mock/
├── workspaces/           # Individual workspace mock data
│   ├── bolocreate.ts    # Resume writing service (with locations)
│   ├── techcorp.ts      # Tech company (minimal)
│   └── localservice.ts  # Home services (location-based)
├── dev-panel.tsx        # Development workspace switcher UI
├── index.ts             # Main exports and utilities
└── README.md           # This file
```

## Available Mock Workspaces

### 1. **bolocreate** - GTA Resume Builder

- **Industry**: Professional Services
- **Has Locations**: Yes (Toronto, Brampton)
- **Features**: Resume writing service with location-specific pages
- **Use Case**: Testing location-based content and service pages

### 2. **techcorp** - TechCorp Solutions

- **Industry**: Technology
- **Has Locations**: No
- **Features**: Minimal tech company site with portfolio focus
- **Use Case**: Testing simple corporate layouts

### 3. **localservice** - Elite Home Services

- **Industry**: Home Services
- **Has Locations**: Yes (Mississauga)
- **Features**: Service-based business with pricing and testimonials
- **Use Case**: Testing service businesses with complex contact forms

## Development Features

### Dev Panel

- Fixed bottom-right development panel (dev mode only)
- Click to switch between workspaces instantly
- View workspace metadata and quick actions
- Clear storage, reload, and debug helpers

### URL-Based Testing

```
# Test specific workspaces via URL
/?workspace=bolocreate
/?workspace=techcorp
/?workspace=localservice

# Test location pages
/locations/toronto
/locations/brampton
/locations/mississauga
```

### Console Logging

All mock data usage is logged to console in development:

```
[DEV] Using mock data for workspace: bolocreate
[DEV] Using mock CMS content for workspace: bolocreate
[DEV] Using mock page data for workspace: bolocreate, page: home
```

## Adding New Mock Workspaces

1. **Create workspace file**: `src/lib/mock/workspaces/newworkspace.ts`
2. **Follow the structure**:

   ```typescript
   import { WorkspaceCMSData, EnhancedCMSPage } from '@/lib/cms';

   export const newworkspace: WorkspaceCMSData = {
     workspace: 'newworkspace',
     settings: {
       siteName: 'New Workspace',
       siteDescription: 'Description...',
       // ... other settings
     },
     navigation: [...],
     pages: {
       home: { /* home page data */ },
       locations: { /* location pages */ }
     }
   };
   ```

3. **Export in index**: Add to `src/lib/mock/workspaces/index.ts`
4. **Add to dev panel**: Update `DEV_WORKSPACES` in `src/lib/mock/index.ts`

## Mock Data Integration

The mock data is automatically integrated into:

- **Workspace Utils** (`src/utils/workspace.ts`)
- **CMS Utils** (`src/utils/cms.ts`)
- **Main App Page** (`src/app/page.tsx`)

In development mode, the system checks for mock data first before making API calls, providing instant testing without backend dependencies.

## Benefits

✅ **Instant Testing** - No backend setup required  
✅ **Multiple Scenarios** - Different business types and structures  
✅ **Location Testing** - Multi-location business scenarios  
✅ **Component Variants** - Different hero, service, and contact variants  
✅ **Easy Switching** - Visual dev panel for quick workspace changes  
✅ **Realistic Data** - Production-like content and structure

## Production Notes

- Mock data is only used in `NODE_ENV === 'development'`
- All development helpers are automatically excluded in production builds
- Production mode will always use real API endpoints
- Dev panel and console logs are development-only features
