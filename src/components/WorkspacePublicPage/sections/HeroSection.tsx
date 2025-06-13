import { StarFilledIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

interface HeroSectionButton {
  type: 'skip' | 'callOrText';
  text: string;
  url?: string;
  action?: string;
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
  variant?: 'default' | 'location' | 'minimal';
  highlights?: string[];
  overlayOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
  additionalContent?: React.ReactNode;
  buttonAction?: string;
  buttons?: HeroSectionButton[];
  showSheet: boolean;
  setShowSheet: (show: boolean) => void;
  onOpenOnboardingSheet: () => void;
}

const AnimatedText = ({
  text,
  className,
}: {
  text: string | React.ReactNode;
  className?: string;
}) => {
  // Extract text content from React node if needed
  const textContent = React.isValidElement(text)
    ? (text.props as { children: string }).children
    : typeof text === 'string'
    ? text
    : '';

  if (!textContent) return null;

  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {textContent.split('').map((char, index) => {
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            className='inline-block'
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </motion.h1>
  );
};

const AnimatedSubtitle = ({
  text,
  className,
}: {
  text: string | React.ReactNode;
  className?: string;
}) => {
  // Extract text content from React node if needed
  const textContent = React.isValidElement(text)
    ? (text.props as { children: string }).children
    : typeof text === 'string'
    ? text
    : '';

  if (!textContent) return null;

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {textContent}
    </motion.p>
  );
};

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
        minHeight,
      }}
    >
      {/* Content */}
      <div className='relative z-10 container mx-auto px-4 pt-20'>
        <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''} mt-20`}>
          {title && (
            <AnimatedText
              text={title}
              className='text-4xl md:text-7xl font-bold mb-6 leading-tight'
            />
          )}

          {subtitle && (
            <AnimatedSubtitle text={subtitle} className='text-xl md:text-2xl mb-8 text-gray-700' />
          )}

          {/* Highlights (for location variant or key points) */}
          {highlights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className='mb-8'
            >
              <div
                className={`grid ${
                  highlights.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-4 max-w-3xl ${textAlign === 'center' ? 'mx-auto' : ''}`}
              >
                {highlights.map((highlight, index) => {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className='bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-200'
                    >
                      <p className='text-sm font-medium text-gray-800'>{highlight}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Additional Content */}
          {additionalContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className='mb-8'
            >
              {additionalContent}
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.5 }}
            className='space-y-4 flex items-center justify-center flex-col'
          >
            {/* If buttonAction is present, render a button */}
            {buttonText && buttonAction && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type='button'
                className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg bg-black text-white mt-4'
                onClick={onOpenOnboardingSheet}
              >
                {buttonText}
              </motion.button>
            )}
            {/* If buttonUrl is present, render the link */}
            {buttonText && buttonUrl && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={buttonUrl}
                  className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg bg-black text-white mt-4'
                >
                  {buttonText}
                </Link>
              </motion.div>
            )}
            {variant === 'location' && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className='text-sm text-gray-600'
              >
                Call or text anytime • Free consultation • Same-day response
              </motion.p>
            )}
            {variant === 'default' && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.5 }}
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
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
