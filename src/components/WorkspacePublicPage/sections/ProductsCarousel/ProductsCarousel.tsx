export default function ProductsCarousel({ id }: { id: string }) {
  const cardComponents = [
    {
      title: 'Product 1',
      description: 'High-quality product with amazing features and benefits',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fimage.png?alt=media&token=0eaaf4a0-e29f-49b3-b7de-646aca3241b7',
      price: '$99.99',
    },
    {
      title: 'Product 2',
      description: 'Another excellent product that customers love',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fimage.png?alt=media&token=0eaaf4a0-e29f-49b3-b7de-646aca3241b7',
      price: '$149.99',
    },
    {
      title: 'Product 3',
      description: 'Premium product with exceptional quality',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fimage.png?alt=media&token=0eaaf4a0-e29f-49b3-b7de-646aca3241b7',
      price: '$199.99',
    },
    {
      title: 'Product 4',
      description: 'Innovative solution for modern needs',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2Fimage.png?alt=media&token=0eaaf4a0-e29f-49b3-b7de-646aca3241b7',
      price: '$249.99',
    },
  ];

  return (
    <div className='min-h-[50vh] px-6 md:px-10 lg:px-24 py-10 md:py-14'>
      <div className='mb-8'>
        <h2 className='text-2xl md:text-3xl font-medium text-left mb-3'>Products</h2>
      </div>

      {/* Carousel Container */}
      <div className='overflow-x-auto'>
        <div className='flex gap-6 pb-4' style={{ minWidth: 'fit-content' }}>
          {cardComponents.map((card, index) => {
            return (
              <div
                key={card.title}
                className='flex-shrink-0 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300
                          w-[280px] h-[380px] sm:w-[320px] sm:h-[420px] md:w-[360px] md:h-[460px] lg:w-[400px] lg:h-[500px]
                          border border-gray-200 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform'
              >
                {/* Image Section */}
                <div className='relative w-full h-full bg-gray-100'>
                  <img src={card.image} alt={card.title} className='w-full h-full object-cover' />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
