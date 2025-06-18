'use client';

import { motion, useAnimationControls, useInView } from 'framer-motion';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SectionHeader from './SectionHeader';

interface Client {
  name: string;
  profession?: string;
  backgroundImage: string;
  result?: string;
}

interface ClientsSectionProps {
  title?: string;
  subtitle?: string;
  clients?: Client[];
  id?: string;
  sectionNumber?: string;
}

const ClientsSection = memo(function ClientsSection({
  title,
  subtitle,
  clients = [],
  id,
  sectionNumber,
}: ClientsSectionProps) {
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false });
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const clickTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const clickCounts = useRef<{ [key: number]: number }>({});

  // Memoize duplicated clients array to prevent recreation on every render
  const duplicatedClients = useMemo(() => {
    return [...clients, ...clients];
  }, [clients]);

  // Memoize the handleClick function to prevent recreation on every render
  const handleClick = useCallback((index: number) => {
    clickCounts.current[index] = (clickCounts.current[index] || 0) + 1;

    // Clear existing timeout
    if (clickTimeouts.current[index]) {
      clearTimeout(clickTimeouts.current[index]);
    }

    // Set new timeout
    clickTimeouts.current[index] = setTimeout(() => {
      if (clickCounts.current[index] === 3) {
        setFlippedIndices((prev) => {
          return prev.includes(index)
            ? prev.filter((i) => {
                return i !== index;
              })
            : [...prev, index];
        });
      }
      clickCounts.current[index] = 0;
    }, 300); // 300ms window for triple click
  }, []);

  // Memoize the image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(clickTimeouts.current).forEach((timeout) => {
        return clearTimeout(timeout);
      });
    };
  }, []);

  // Memoize animation configuration
  const animationConfig = useMemo(() => {
    return {
      x: [0, -50 * clients.length],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 20,
          ease: 'linear' as const,
        },
      },
    };
  }, [clients.length]);

  useEffect(() => {
    if (isInView) {
      controls.start(animationConfig);
    } else {
      controls.stop();
    }
  }, [isInView, controls, animationConfig]);

  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
      </div>

      {/* Full Width Scrolling Carousel */}
      <div ref={containerRef} className='relative w-full overflow-hidden'>
        <motion.div animate={controls} className='flex gap-6 px-6'>
          {duplicatedClients.map((client, index) => {
            return (
              <ClientCard
                key={`${client.name}-${index}`}
                client={client}
                index={index}
                isFlipped={flippedIndices.includes(index)}
                onClick={handleClick}
                onImageError={handleImageError}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

// Extract ClientCard as a separate memoized component to prevent unnecessary re-renders
interface ClientCardProps {
  client: Client;
  index: number;
  isFlipped: boolean;
  onClick: (index: number) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ClientCard = memo(function ClientCard({
  client,
  index,
  isFlipped,
  onClick,
  onImageError,
}: ClientCardProps) {
  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <motion.div
      className='relative w-[368px] h-[480px] rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex-shrink-0 cursor-pointer'
      style={{ perspective: '1000px' }}
      onClick={handleClick}
      animate={{
        rotateX: isFlipped ? 180 : 0,
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Front of card */}
      <motion.div
        className='absolute inset-0 w-full h-full'
        style={{ backfaceVisibility: 'hidden' }}
      >
        {/* Background Image Container */}
        <div className='absolute inset-0 overflow-hidden'>
          {/* Background Image */}
          <Image
            src={client.backgroundImage}
            alt={`${client.name}'s logo`}
            fill
            unoptimized
            className='object-cover transition-transform duration-700 ease-out scale-110 group-hover:scale-100'
            onError={onImageError}
          />
          {/* Overlay for better text readability */}
          <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 group-hover:from-black/50 group-hover:to-black/70 transition-all duration-300'></div>
        </div>

        {/* Fallback when image doesn't load */}
        <div className='absolute inset-0 bg-gradient-to-br from-gray-500 to-white-600 opacity-80'>
          <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 group-hover:from-black/30 group-hover:to-black/50 transition-all duration-300'></div>
        </div>

        {/* Content */}
        <div className='relative h-full flex flex-col justify-between p-6 text-white z-10'>
          {/* Top Left - Name and Profession */}
          <div className='space-y-1'>
            <h3 className='text-xl font-bold text-white drop-shadow-lg'>{client.name}</h3>
            {client.profession && (
              <p className='text-sm text-white/90 drop-shadow-md'>{client.profession}</p>
            )}
          </div>

          {/* Bottom - Results */}
          {client.result && (
            <div className=''>
              <p className='text-xl font-semibold text-white drop-shadow-lg leading-relaxed'>
                {client.result}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Back of card */}
      <motion.div
        className='absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex items-center justify-center'
        style={{
          backfaceVisibility: 'hidden',
          rotateX: 180,
          transform: 'rotateX(180deg)',
        }}
      >
        <div className='text-white text-center'>
          <h3 className='text-2xl font-bold mb-4'>{client.name}</h3>
          {client.profession && <p className='text-lg mb-6'>{client.profession}</p>}
          {client.result && <p className='text-xl font-semibold'>{client.result}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default ClientsSection;
