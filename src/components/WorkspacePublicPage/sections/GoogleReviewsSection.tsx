'use client';

import { useEffect, useRef } from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  profession?: string;
  avatar?: string;
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
}

export default function GoogleReviewsSection({
  title,
  subtitle,
  reviews = [],
  id,
  showGoogleBadge = true,
  averageRating = 5.0,
  totalReviews = 0,
  primaryColor = '#7C3AED',
}: GoogleReviewsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let isHovered = false;

    const scroll = () => {
      if (!isHovered && scrollContainer) {
        scrollContainer.scrollLeft += 0.5;

        // Reset scroll when we reach the end to create infinite loop
        if (
          scrollContainer.scrollLeft >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    // Start the scroll animation
    animationId = requestAnimationFrame(scroll);

    // Add hover event listeners
    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer?.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center space-x-1'>
        {[...Array(5)].map((_, index) => {
          return (
            <span
              key={index}
              className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </span>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section id={id} className='py-16 bg-gray-50 overflow-hidden'>
      <div className='container mx-auto px-4'>
        {/* Header Section */}
        <div className='max-w-4xl mx-auto text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>{title}</h2>
          <p className='text-lg text-gray-600 mb-8'>{subtitle}</p>

          {/* Google Badge & Rating Summary */}
          {showGoogleBadge && (
            <div className='flex items-center justify-center space-x-6 mb-8'>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center space-x-1'>
                  <span className='text-2xl'>🔍</span>
                  <span className='font-bold text-lg'>Google</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-2xl font-bold'>{averageRating}</span>
                  {renderStars(Math.floor(averageRating))}
                  <span className='text-gray-600'>({totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Carousel */}
        <div
          ref={scrollRef}
          className='flex gap-6 overflow-x-hidden pl-6 pr-6'
          style={{
            scrollBehavior: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {duplicatedReviews.map((review, index) => {
            return (
              <div
                key={`${review.id}-${index}`}
                className='relative w-[350px] bg-white rounded-xl shadow-lg p-6 flex-shrink-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105'
              >
                {/* Rating Stars */}
                <div className='mb-4'>{renderStars(review.rating)}</div>

                {/* Review Text */}
                <p className='text-gray-700 mb-6 leading-relaxed line-clamp-4'>
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author Info */}
                <div className='flex items-center space-x-3'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0'
                    style={{ backgroundColor: primaryColor }}
                  >
                    {review.avatar || review.author.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold text-gray-900 truncate'>{review.author}</h4>
                    {review.profession && (
                      <p className='text-sm text-gray-600 truncate'>{review.profession}</p>
                    )}
                    <p className='text-xs text-gray-500'>{formatDate(review.date)}</p>
                  </div>
                </div>

                {/* Google Icon */}
                <div className='absolute top-4 right-4'>
                  <div className='w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center'>
                    <span className='text-xs'>G</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className='text-center mt-12'>
          <div className='bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto'>
            <h3 className='text-2xl font-bold mb-4' style={{ color: primaryColor }}>
              Join Our Satisfied Clients
            </h3>
            <p className='text-gray-600 mb-6'>
              Ready to get the same results? Let&apos;s create your professional resume today.
            </p>
            <div className='space-y-4'>
              <a
                href='tel:4377743721'
                className='inline-block px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-300'
                style={{ backgroundColor: primaryColor }}
              >
                Call Now - (437) 774-3721
              </a>
              <p className='text-sm text-gray-500'>
                Free consultation • Same-day response • 60-day guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
