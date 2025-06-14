import { StarFilledIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
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
  sectionNumber?: string;
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

const AnimatedHighlight = ({
  text,
  index,
  primaryColor,
}: {
  text: string;
  index: number;
  primaryColor: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
      className='flex items-center space-x-2'
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 + index * 0.1, type: 'spring', stiffness: 200 }}
      >
        <StarFilledIcon className='w-5 h-5' style={{ color: primaryColor }} />
      </motion.div>
      <span className='text-lg'>{text}</span>
    </motion.div>
  );
};

const AnimatedButton = ({
  text = 'Get Started',
  index,
  onOpenOnboardingSheet,
}: {
  text?: string;
  index: number;
  onOpenOnboardingSheet: () => void;
}) => {
  const buttonContent = (
    <motion.button
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      whileHover={{
        backgroundColor: '#fff',
        color: '#000',
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        delay: 1.2 + index * 0.1,
        duration: 0.4,
        backgroundColor: { duration: 0.15 },
        color: { duration: 0.15 },
      }}
      className='px-8 py-4 text-lg font-medium rounded-full border-2 border-black'
      style={{
        backgroundColor: '#000',
        color: '#fff',
      }}
      onClick={onOpenOnboardingSheet}
    >
      {text}
    </motion.button>
  );

  return buttonContent;
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
  sectionNumber,
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

          {/* Highlights */}
          {highlights.length > 0 && (
            <motion.div
              className='space-y-4 mb-8'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {highlights.map((highlight, index) => {
                return (
                  <AnimatedHighlight
                    key={index}
                    text={highlight}
                    index={index}
                    primaryColor={primaryColor}
                  />
                );
              })}
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            className='space-y-4'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {buttons.length > 0 ? (
              buttons.map((button, index) => {
                return (
                  <AnimatedButton
                    key={index}
                    text={button.text}
                    index={index}
                    onOpenOnboardingSheet={onOpenOnboardingSheet}
                  />
                );
              })
            ) : (
              <AnimatedButton index={0} onOpenOnboardingSheet={onOpenOnboardingSheet} />
            )}
          </motion.div>

          {/* Additional Content */}
          {additionalContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              {additionalContent}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
