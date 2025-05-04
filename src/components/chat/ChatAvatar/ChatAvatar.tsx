'use client';

export default function GoffyFace({
  wiggle,
  setWiggle,
}: {
  wiggle: boolean;
  setWiggle: (wiggle: boolean) => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-6'>
      <div
        className={`relative w-10 h-10 rounded-sm bg-[#8470d8] shadow-lg ${
          wiggle ? 'animate-wiggle' : ''
        }`}
        onAnimationEnd={() => {
          return setWiggle(false);
        }}
      >
        {/* Eyes */}
        <div className='absolute top-[30%] left-[25%] w-1 h-1 rounded-full bg-white'></div>
        <div className='absolute top-[30%] right-[25%] w-1 h-1 rounded-full bg-white'></div>

        {/* Mouth - :D style (wider and taller) */}
        <div className='absolute bottom-[25%] left-1/2 -translate-x-1/2 w-4 h-2 bg-white rounded-full'></div>
      </div>

      <style jsx global>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(0deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
