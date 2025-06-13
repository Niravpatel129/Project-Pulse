import { StarFilledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

interface HeroSectionButton {
  type: 'skip' | 'callOrText';
  text: string;
  url?: string; // for call/text
  action?: string; // for skip or custom
}

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  id?: string;

  // Generic configuration options
  variant?: 'default' | 'location' | 'minimal';
  highlights?: string[]; // For location highlights or key points
  overlayOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
  additionalContent?: React.ReactNode;
  buttonAction?: string;
  buttons?: HeroSectionButton[];

  // Onboarding sheet props
  showSheet: boolean;
  setShowSheet: (show: boolean) => void;
  onOpenOnboardingSheet: () => void;
}

export default function HeroSection({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  backgroundImage,
  primaryColor = '#7C3AED',
  secondaryColor = '#2563EB',
  id,
  variant = 'default',
  highlights = [],
  overlayOpacity = 0.5,
  textAlign = 'center',
  minHeight = '600px',
  additionalContent,
  buttonAction,
  buttons = [],
  showSheet,
  setShowSheet,
  onOpenOnboardingSheet,
}: HeroSectionProps) {
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  return (
    <section
      id={id}
      className={`relative flex items-center justify-center text-gray-900 ${textAlignClass} py-16`}
      style={{
        background: backgroundImage
          ? `linear-gradient(#f5f3f0,#fefdfd), url(${backgroundImage})`
          : 'linear-gradient(#f5f3f0,#fefdfd)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Content */}
      <div className='relative z-10 container mx-auto px-4 pt-20'>
        <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''} mt-20`}>
          <h1 className='text-4xl md:text-7xl font-bold mb-6 leading-tight'>{title}</h1>

          {/* <p className='text-xl md:text-2xl mb-8 text-gray-700'>{subtitle}</p> */}

          {/* Highlights (for location variant or key points) */}
          {highlights.length > 0 && (
            <div className='mb-8'>
              <div
                className={`grid ${
                  highlights.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-4 max-w-3xl ${textAlign === 'center' ? 'mx-auto' : ''}`}
              >
                {highlights.map((highlight, index) => {
                  return (
                    <div
                      key={index}
                      className='bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-200'
                    >
                      <p className='text-sm font-medium text-gray-800'>{highlight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Content */}
          {additionalContent && <div className='mb-8'>{additionalContent}</div>}

          {/* CTA Button */}
          <div className='space-y-4 flex items-center justify-center flex-col'>
            {/* If buttonAction is present, render a button */}
            {buttonText && buttonAction && (
              <button
                type='button'
                className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-black text-white mt-4'
                onClick={onOpenOnboardingSheet}
              >
                {buttonText}
              </button>
            )}
            {/* If buttonUrl is present, render the link */}
            {buttonText && buttonUrl && (
              <Link
                href={buttonUrl}
                className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-black text-white mt-4'
              >
                {buttonText}
              </Link>
            )}
            {variant === 'location' && (
              <p className='text-sm text-gray-600'>
                Call or text anytime • Free consultation • Same-day response
              </p>
            )}
            {variant === 'default' && (
              <div
                className='mb-8 flex items-center gap-1 w-full text-center justify-center text-sm'
                style={{ color: '#222', fontWeight: 400 }}
              >
                <span style={{ color: '#222', fontWeight: 400 }}>
                  #1 Top-Rated Restaurant Software
                </span>
                <span
                  className='flex items-center gap-0 ml-2'
                  style={{ color: '#888', fontWeight: 400 }}
                >
                  <span
                    className='flex items-center gap-0'
                    style={{ color: '#888', fontWeight: 400 }}
                  >
                    4.8
                    <StarFilledIcon className='w-4 h-4 ml-0.5' style={{ color: '#ddd' }} />
                  </span>
                  <span className='ml-1' style={{ color: '#bbb', fontWeight: 400 }}>
                    across 279 reviews
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
