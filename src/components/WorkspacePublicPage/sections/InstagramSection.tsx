import { useEffect, useRef, useState } from 'react';
import SectionHeader from './SectionHeader';

interface InstagramSectionProps {
  title?: string;
  subtitle?: string;
  instagramUrl?: string;
  primaryColor?: string;
  id?: string;
  sectionNumber?: string;
}

export default function InstagramSection({
  title,
  subtitle,
  instagramUrl,
  primaryColor = '#7C3AED',
  id,
  sectionNumber,
}: InstagramSectionProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(() => {
    // Set initial height based on viewport width
    return window.innerWidth < 768 ? 600 : 1200;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current?.contentWindow) {
        try {
          const height = iframeRef.current.contentWindow.document.body.scrollHeight;
          // Adjust height based on viewport width
          const adjustedHeight = window.innerWidth < 768 ? Math.min(height, 800) : height;
          setIframeHeight(adjustedHeight);
        } catch (e) {
          // Handle cross-origin errors silently
        }
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        handleResize();
        // Additional resize after a short delay to catch any late-loading content
        setTimeout(handleResize, 1000);
      };
    }

    window.addEventListener('resize', handleResize);
    return () => {
      return window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!instagramUrl) {
    return null;
  }

  return (
    <section id={id} className='pt-16 pb-0 bg-white'>
      <div className='container mx-auto px-4'>
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        <div className='max-w-8xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Instagram Embed */}
            <div className='col-span-full'>
              <div className='w-full'>
                {error ? (
                  <div className='p-4 text-center text-red-500 bg-red-50 rounded-lg'>{error}</div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    src={`${instagramUrl}/embed`}
                    className='w-full'
                    style={{ height: `${iframeHeight}px` }}
                    allowFullScreen
                    loading='lazy'
                    allow='encrypted-media'
                    onError={() => {
                      return setError('Failed to load Instagram content');
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
