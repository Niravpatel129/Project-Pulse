'use client';

import { motion, useAnimationControls, useInView } from 'framer-motion';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SectionHeader from './SectionHeader';

interface Screenshot {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface GallerySectionProps {
  title?: string;
  subtitle?: string;
  screenshots?: Screenshot[];
  id?: string;
  sectionNumber?: string;
}

const GallerySection = memo(function GallerySection({
  title,
  subtitle,
  screenshots = [],
  id,
  sectionNumber,
}: GallerySectionProps) {
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Memoize duplicated screenshots array to prevent recreation on every render
  const duplicatedScreenshots = useMemo(() => {
    return [...screenshots, ...screenshots];
  }, [screenshots]);

  // Memoize the image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  }, []);

  // Handle screenshot click for modal view
  const handleScreenshotClick = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Memoize animation configuration
  const animationConfig = useMemo(() => {
    return {
      x: [0, -424 * screenshots.length], // 400px width + 24px gap
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 30,
          ease: 'linear' as const,
        },
      },
    };
  }, [screenshots.length]);

  useEffect(() => {
    if (isInView) {
      controls.start(animationConfig);
    } else {
      controls.stop();
    }
  }, [isInView, controls, animationConfig]);

  return (
    <>
      <section id={id} className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        </div>

        {/* Full Width Scrolling Carousel */}
        <div ref={containerRef} className='relative w-full overflow-hidden'>
          <motion.div animate={controls} className='flex gap-6 px-6'>
            {duplicatedScreenshots.map((screenshot, index) => {
              return (
                <ScreenshotCard
                  key={`${screenshot.alt}-${index}`}
                  screenshot={screenshot}
                  index={index}
                  onClick={handleScreenshotClick}
                  onImageError={handleImageError}
                />
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Modal for enlarged view */}
      {selectedIndex !== null && (
        <motion.div
          className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className='relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <button
              onClick={closeModal}
              className='absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors'
            >
              ×
            </button>
            <Image
              src={screenshots[selectedIndex % screenshots.length].src}
              alt={screenshots[selectedIndex % screenshots.length].alt}
              width={1200}
              height={800}
              className='w-full h-auto object-contain'
              onError={handleImageError}
            />
            {screenshots[selectedIndex % screenshots.length].title && (
              <div className='p-4 bg-white'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {screenshots[selectedIndex % screenshots.length].title}
                </h3>
                {screenshots[selectedIndex % screenshots.length].description && (
                  <p className='text-gray-600 mt-2'>
                    {screenshots[selectedIndex % screenshots.length].description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
});

// Extract ScreenshotCard as a separate memoized component
interface ScreenshotCardProps {
  screenshot: Screenshot;
  index: number;
  onClick: (index: number) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ScreenshotCard = memo(function ScreenshotCard({
  screenshot,
  index,
  onClick,
  onImageError,
}: ScreenshotCardProps) {
  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <motion.div
      className='relative w-[400px] h-[280px] rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300 flex-shrink-0 cursor-pointer bg-white'
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Screenshot frame effect */}
      <div className='absolute inset-0 rounded-lg bg-white shadow-lg z-0'></div>

      {/* Screenshot Container with subtle border */}
      <div className='absolute inset-2 rounded-md overflow-hidden border border-gray-200 z-10'>
        <Image
          src={screenshot.src}
          alt={screenshot.alt}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          onError={onImageError}
        />

        {/* Subtle overlay on hover */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-20'></div>
      </div>

      {/* Title overlay */}
      {screenshot.title && (
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 z-30'>
          <p className='text-white text-sm font-medium truncate'>{screenshot.title}</p>
        </div>
      )}

      {/* Hover indicator */}
      <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30'>
        <div className='bg-white/90 rounded-full p-1'>
          <svg
            className='w-4 h-4 text-gray-700'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
});

export default GallerySection;
