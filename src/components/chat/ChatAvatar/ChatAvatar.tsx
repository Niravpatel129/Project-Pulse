'use client';

import { TbRobot } from 'react-icons/tb';

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
        className={`flex items-center justify-center relative w-9 h-9 rounded-sm bg-gradient-to-t from-[#444444] to-[#6f6f6f]  shadow-lg ${
          wiggle ? 'animate-wiggle' : ''
        }`}
        onAnimationEnd={() => {
          return setWiggle(false);
        }}
      >
        <TbRobot className='text-white text-2xl' />
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
