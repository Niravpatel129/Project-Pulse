'use client';

import { FaStar } from 'react-icons/fa';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section id={id} className='py-16 bg-gray-50 overflow-hidden mb-22 relative'>
      <div className='container mx-auto px-2 max-w-6xl'>
        {/* Header Section */}
        <div className='max-w-4xl mx-auto text-center mb-30'>
          <h2 className='text-5xl font-bold mb-4 max-w-4xl mx-auto'>{title}</h2>
        </div>
        {/* Reviews Grid with fade and podium effect */}
        <div className='relative mt-20'>
          <div className='hp-reviews_grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10'>
            {reviews.map((review, idx) => {
              // For podium effect: middle column in each row on large screens
              const isMiddle = idx % 3 === 1;
              return (
                <div
                  key={review.id}
                  className={
                    `hp-reviews_item bg-white rounded-xl shadow-lg p-6 flex flex-col transition-all duration-300 w-full` +
                    (isMiddle ? ' lg:mt-[-40px] lg:mb-8 ' : '')
                  }
                  style={isMiddle ? { zIndex: 30, minHeight: 180 } : { minHeight: 180 }}
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
                </div>
              );
            })}
          </div>
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
    </section>
  );
}
