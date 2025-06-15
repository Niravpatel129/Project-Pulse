'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import SectionHeader from './SectionHeader';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  profession?: string;
  avatar?: string;
  source?: string;
}

interface GoogleReviewsSectionProps {
  title?: string;
  subtitle?: string;
  reviews?: Review[];
  id?: string;
  showGoogleBadge?: boolean;
  averageRating?: number;
  totalReviews?: number;
  primaryColor?: string;
  sectionNumber?: string;
}

export default function GoogleReviewsSection({
  title,
  subtitle,
  reviews = [],
  id,
  sectionNumber,
}: GoogleReviewsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const starVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => {
      return {
        scale: 1,
        opacity: 1,
        transition: {
          delay: i * 0.1,
          type: 'spring',
          stiffness: 500,
          damping: 15,
        },
      };
    },
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center space-x-1 mb-4'>
        {[...Array(5)].map((_, index) => {
          return (
            <FaStar
              key={index}
              className={index < rating ? 'text-black-400' : 'text-gray-300'}
              size={12}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section
      id={id}
      className='py-16 overflow-hidden mb-22 relative'
      style={{ background: 'linear-gradient(rgb(245, 243, 240), rgb(254, 253, 253))' }}
    >
      <div className='container mx-auto px-2 max-w-8xl'>
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        {/* Reviews Grid with fade and podium effect */}
        <div className='relative mt-10 md:mt-20'>
          <motion.div
            ref={ref}
            variants={isMobile ? {} : containerVariants}
            initial={isMobile ? false : 'hidden'}
            animate={isMobile ? false : isInView ? 'visible' : 'hidden'}
            className='hp-reviews_grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10'
          >
            {reviews.map((review, idx) => {
              // For podium effect: middle column in each row on large screens only
              const isMiddle = idx % 3 === 1;
              return (
                <motion.div
                  key={review.id}
                  variants={isMobile ? {} : itemVariants}
                  className={
                    `hp-reviews_item bg-white rounded-xl shadow-lg p-6 flex flex-col transition-all duration-300 w-full` +
                    (isMiddle ? ' lg:mt-[-40px] lg:mb-8 ' : '')
                  }
                  style={{
                    minHeight: 180,
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    ...(isMiddle ? { zIndex: 30 } : {}),
                  }}
                >
                  <a
                    href='https://g.co/kgs/waq8Rav'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block h-full'
                  >
                    {renderStars(review.rating)}
                    <p className='text-sm text-gray-700 mb-2 leading-snug'>
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className='row-meta flex items-center mt-auto'>
                      <div>
                        <p className='text-xs font-semibold text-gray-900 flex items-center gap-2'>
                          {review.author}
                        </p>
                      </div>
                    </div>
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
