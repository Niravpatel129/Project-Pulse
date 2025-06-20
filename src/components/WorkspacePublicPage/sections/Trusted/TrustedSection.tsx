import Image from 'next/image';

export default function TrustedSection({ id }: { id: string }) {
  const trustedBrands = [
    {
      alt: 'Billboard',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FBillboard_logo%201.png?alt=media',
    },
    {
      alt: 'quickbooks',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup%201000005293.svg?alt=media',
    },
    {
      alt: 'deloitte',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup%201000005294.png?alt=media',
    },
    {
      alt: 'prime',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup%201000005295.png?alt=media',
    },
    {
      alt: 'group',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup.png?alt=media',
    },
    {
      alt: 'microsoft',
      image:
        'https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FMicrosoft_logo_(2012)%201.png?alt=media',
    },
  ];
  return (
    <div className='min-h-[50vh] px-6 md:px-10 lg:px-24 py-10 md:py-14'>
      <div className='text-xl md:text-2xl text-[#111213] mb-8 md:mb-10 text-center'>
        Trusted by ambitious brands everywhere.
      </div>
      <div className='flex flex-wrap gap-6 md:gap-4 justify-center md:justify-between items-center'>
        {trustedBrands.map((brand) => {
          return (
            <Image
              key={brand.alt}
              src={brand.image}
              alt={brand.alt}
              width={120}
              height={60}
              className='w-[100px] h-[50px] md:w-[120px] md:h-[60px] object-contain transition-all duration-300'
            />
          );
        })}
      </div>
      <div className='mt-6 md:mt-4 text-base md:text-lg text-[#111213] mb-8 md:mb-10 text-center'>
        We&apos;re ready when you are.
      </div>
    </div>
  );
}
