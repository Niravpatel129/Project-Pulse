import Image from 'next/image';
import { useState } from 'react';

export default function HeroSectionV2({ id }: { id: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);

  return (
    <div
      id={id}
      className='bg-black/80 min-h-[95vh] relative font-inter'
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
      }}
    >
      {/* Background Image */}
      <Image
        src='https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FIMG_7081%201.png?alt=media'
        alt='Hero Background'
        fill
        priority
        onLoad={() => {
          return setBgImageLoaded(true);
        }}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: bgImageLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
        }}
      />
      <div
        className='absolute inset-0 bg-black/80'
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)',
        }}
      ></div>
      <div className='flex flex-col items-center justify-center pt-32 relative z-10 text-white'>
        {/* Fixed container to prevent layout shift */}
        <div className='w-[100px] h-[100px] mb-16 flex items-center justify-center'>
          <Image
            src='https://firebasestorage.googleapis.com/v0/b/pulse-20181.firebasestorage.app/o/manual%2FGroup%201000004469.svg?alt=media'
            alt='Hero Section'
            width={100}
            height={100}
            priority
            onLoad={() => {
              return setImageLoaded(true);
            }}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          />
        </div>
        <div className='text-2xl font-semibold text-center my-8'>
          Every project tells a story, what&apos;s yours?
        </div>
        <button className='border-2 border-white text-white px-6 py-2 rounded-full bg-[#0C55BB] mb-8 hover:bg-[#0C55BB]/80 transition-all duration-300'>
          Create Now
        </button>
        <div className='flex flex-col items-center justify-center text-white text-xl gap-4 font-medium mt-8'>
          <a href='tel:+18443212656' className='hover:underline cursor-pointer'>
            1 (844) 321 <span className='font-extrabold'>BOLO</span>
          </a>
          <a
            href='mailto:hello@bolocreate.com'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline cursor-pointer'
          >
            hello@bolocreate.com
          </a>
          <a
            href='https://maps.google.com/?q=3883+Nashua+Drive+%239'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline cursor-pointer'
          >
            3883 Nashua Drive, #9
          </a>
        </div>
      </div>
    </div>
  );
}
