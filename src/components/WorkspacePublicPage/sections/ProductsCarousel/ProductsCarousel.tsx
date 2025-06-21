import Image from 'next/image';

export default function ProductsCarousel({ id }: { id: string }) {
  const cardComponents = [
    {
      title: 'Custom Apparel',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fimage.png?alt=media&token=0eaaf4a0-e29f-49b3-b7de-646aca3241b7',
    },
    {
      title: 'Event Signage',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fbolo%2Fimage%20(1).png?alt=media&token=a0437c28-7c4a-42fa-945b-6c654fd335d2',
    },
    {
      title: 'Business Essentials',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fbolo%2Fimage%20(2).png?alt=media&token=bc11d389-8123-4cce-98a3-0a72196ca00c',
    },
    {
      title: 'Decor',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fbolo%2Fimage%20(3).png?alt=media&token=ce4b535e-1364-4dd4-b3ac-cdab59dbee24',
    },
    {
      title: 'Large Format',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fimage.png?alt=media&token=0eaaf4a0-e29f-49b3-b7de-646aca3241b7',
    },
  ];

  return (
    <div className='min-h-[50vh] py-10 md:py-14'>
      {/* Title Section - Respects left padding */}
      <div className='pl-6 md:pl-10 lg:pl-24 mb-8'>
        <h2 className='text-2xl md:text-3xl font-medium text-left mb-3'>Products</h2>
      </div>

      {/* Carousel Container - Full width, breaks out of padding */}
      <div className='overflow-x-auto scrollbar-hide'>
        <div className='flex gap-6 pb-4' style={{ minWidth: 'fit-content' }}>
          {cardComponents.map((card, index) => {
            const isFirst = index === 0;
            const isLast = index === cardComponents.length - 1;

            return (
              <div
                key={card.title}
                className={`flex-shrink-0 bg-white rounded-lg shadow-lg hover:shadow-xl duration-300
                          w-[280px] h-[380px] sm:w-[320px] sm:h-[420px] md:w-[360px] md:h-[460px] lg:w-[400px] lg:h-[500px]
                          border border-gray-200 overflow-hidden cursor-pointer transition-all
                          ${isFirst ? 'ml-6 md:ml-10 lg:ml-24' : ''}
                          ${isLast ? 'mr-6 md:mr-10 lg:mr-24' : ''}`}
              >
                {/* Image Section */}
                <div className='relative w-full h-full bg-gray-100'>
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className='object-cover hover:scale-110 transition-transform duration-300'
                    sizes='(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 360px, 400px'
                  />

                  {/* Black Overlay */}
                  <div className='absolute inset-0 bg-black/30'></div>

                  {/* Text Content - Top Left */}
                  <div className='absolute top-4 left-4 text-white'>
                    <h3 className='text-4xl font-semibold mb-1 max-w-[200px] text-left'>
                      {card.title}
                    </h3>
                  </div>

                  {/* Button - Bottom Right */}
                  <button className='absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors'>
                    Create Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
