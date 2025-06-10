import { EnhancedCMSPage, getWorkspaceCMS } from '@/lib/cms';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface LocationsPageProps {
  params: Promise<{
    workspace: string;
  }>;
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  const { workspace } = await params;

  // Fetch workspace CMS data to get available locations
  const cmsData = await getWorkspaceCMS(workspace);

  if (!cmsData) {
    notFound();
  }

  const { settings, pages } = cmsData;
  const locations = pages.locations || {};
  const locationEntries = Object.entries(locations);

  if (locationEntries.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>No Locations Available</h1>
          <p className='text-gray-600 mb-8'>
            This workspace doesn&apos;t have any location pages set up yet.
          </p>
          <Link
            href='/'
            className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = settings.theme?.primaryColor || '#7C3AED';

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation */}
      <nav className='shadow-sm border-b'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            <Link href='/' className='font-bold text-xl' style={{ color: primaryColor }}>
              {settings.siteName}
            </Link>
            <div className='hidden md:flex space-x-8'>
              <Link href='/' className='text-gray-600 hover:text-gray-900 transition-colors'>
                Home
              </Link>
              <span className='text-gray-900 font-medium'>Locations</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className='bg-gray-100 py-4'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center text-sm text-gray-600'>
            <Link href='/' className='hover:underline'>
              Home
            </Link>
            <span className='mx-2'>›</span>
            <span className='font-medium'>Locations</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>Our Locations</h1>
            <p className='text-lg text-gray-600'>
              We serve multiple locations across the Greater Toronto Area. Choose your location to
              see specific services and contact information.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {locationEntries.map(([slug, locationPage]) => {
              const enhancedLocationPage = locationPage as EnhancedCMSPage;
              return (
                <Link
                  key={slug}
                  href={`/locations/${slug}`}
                  className='bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 group'
                >
                  <div className='text-center'>
                    <h3
                      className='text-2xl font-bold mb-3 group-hover:underline'
                      style={{ color: primaryColor }}
                    >
                      {enhancedLocationPage.locationData?.city}
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      {enhancedLocationPage.locationData?.province}
                    </p>

                    {enhancedLocationPage.locationData?.serviceAreas && (
                      <div className='mb-4'>
                        <h4 className='font-semibold text-gray-900 mb-2'>Service Areas:</h4>
                        <div className='text-sm text-gray-600'>
                          {enhancedLocationPage.locationData.serviceAreas
                            .slice(0, 3)
                            .map((area, index) => {
                              return <div key={index}>• {area}</div>;
                            })}
                          {enhancedLocationPage.locationData.serviceAreas.length > 3 && (
                            <div className='text-gray-500'>
                              + {enhancedLocationPage.locationData.serviceAreas.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className='inline-block px-4 py-2 rounded-lg text-white font-medium transition-colors'
                      style={{ backgroundColor: primaryColor }}
                    >
                      View Details →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Contact CTA */}
          <div className='text-center mt-12'>
            <div className='bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto'>
              <h3 className='text-2xl font-bold mb-4' style={{ color: primaryColor }}>
                Need Help Choosing?
              </h3>
              <p className='text-gray-600 mb-6'>
                Not sure which location is best for you? Contact us and we&apos;ll help you find the
                right fit.
              </p>
              <div className='space-y-3'>
                <a
                  href={`tel:${settings.contact?.phone?.replace(/\D/g, '') || '4377743721'}`}
                  className='inline-block px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-300 mr-4'
                  style={{ backgroundColor: primaryColor }}
                >
                  Call: {settings.contact?.phone || '(437) 774-3721'}
                </a>
                <a
                  href={`mailto:${settings.contact?.email || 'gtaresumebuilder@gmail.com'}`}
                  className='inline-block px-8 py-3 rounded-lg font-semibold border-2 transition-colors duration-300'
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
