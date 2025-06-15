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
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeHeight, setIframeHeight] = useState(600);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Calculate height based on width with a 1.5:1 aspect ratio
        const calculatedHeight = Math.round(width * 1.3);
        // Set minimum and maximum heights
        const height = Math.min(Math.max(calculatedHeight, 400), 1200);
        setIframeHeight(height);
      }
    };

    const handleResize = () => {
      calculateHeight();
    };

    // Initial calculation
    calculateHeight();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!instagramUrl) {
    return null;
  }

  return (
    <section id={id} className='pt-16 -mb-32 md:mb-32  bg-white'>
      <div className='container mx-auto px-4'>
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        <div className='max-w-8xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Instagram Embed */}
            <div className='col-span-full'>
              <div className='w-full' ref={containerRef}>
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
