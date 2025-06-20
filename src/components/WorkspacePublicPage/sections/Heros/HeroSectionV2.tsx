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
      <div className='flex flex-col items-center justify-center pt-20 relative z-10 text-white'>
        <Image
          src='https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup%201000004469.svg?alt=media&token=019151a4-31ba-41f1-9ecf-3d27a8c64bf6'
          alt='Hero Section'
          width={100}
          height={100}
        />
        <div>Every project tells a story, what’s yours?</div>
        <button>Create Now</button>
        <div>
          1 (844) 321 <span className='font-bold'>BOLO</span>
        </div>
        <div>hello@bolocreate.com</div>
        <div>3883 Nashua Drive, #9</div>
      </div>
    </div>
  );
}
