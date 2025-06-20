import Image from 'next/image';

export default function HeroSectionV2({ id }: { id: string }) {
  return (
    <div
      id={id}
      className='bg-black/80 min-h-[95vh] relative font-inter'
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
        backgroundImage:
          'url(https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FIMG_7081%201.png?alt=media&token=01fcaa72-556d-4311-8469-91a3b49b07e3)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className='absolute inset-0 bg-black/80'
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
        }}
      ></div>
      <div className='flex flex-col items-center justify-center pt-32 relative z-10 text-white'>
        <Image
          className='mb-16'
          src='https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup%201000004469.svg?alt=media&token=019151a4-31ba-41f1-9ecf-3d27a8c64bf6'
          alt='Hero Section'
          width={100}
          height={100}
        />
        <div className='text-2xl font-semibold text-center my-8'>
          Every project tells a story, what’s yours?
        </div>
        <button className='border-2 border-white text-white px-6 py-2 rounded-full bg-[#0C55BB] mb-8 hover:bg-[#0C55BB]/80 transition-all duration-300'>
          Create Now
        </button>
        <div className='flex flex-col items-center justify-center text-white text-xl gap-4 font-medium mt-8'>
          <div className='hover:underline cursor-pointer'>
            1 (844) 321 <span className='font-extrabold'>BOLO</span>
          </div>
          <div className='hover:underline cursor-pointer'>hello@bolocreate.com</div>
          <div className='hover:underline cursor-pointer'>3883 Nashua Drive, #9</div>
        </div>
      </div>
    </div>
  );
}
