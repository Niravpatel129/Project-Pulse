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
  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        <div className='max-w-8xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Instagram Embed */}
            <div className='col-span-full'>
              <div className='aspect-w-16 aspect-h-9'>
                <iframe
                  src={`${instagramUrl}/embed`}
                  className='w-full h-[600px] border-0'
                  allowFullScreen
                  loading='lazy'
                  allow='encrypted-media'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
