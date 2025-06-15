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
  navigation?: any;
  settings?: any;
  sectionNavigation?: any;
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
      {textContent.split(' ').map((word, index, array) => {
        return (
          <React.Fragment key={index}>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className='inline-block'
            >
              {word}
            </motion.span>
            {index < array.length - 1 && <span className='inline-block w-4' />}
          </React.Fragment>
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
      className='px-6 py-2 text-lg font-medium rounded-full border-2 border-black'
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
  navigation,
  settings,
  sectionNavigation,
}: HeroSectionProps) {
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  return (
    <section
      id={id}
      className={`bg-white relative flex items-center justify-center text-gray-900 h-[60vh] md:h-[87vh] ${textAlignClass} p-4 md:p-3`}
      style={{
        // background: backgroundImage
        //   ? `linear-gradient(#f5f3f0,#fefdfd))`
        //   : 'linear-gradient(#f5f3f0,#fefdfd)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight,
      }}
    >
      {navigation.length > 0 && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='absolute top-10 left-0 right-0 px-4 md:px-0 z-20'
        >
          <div className='container px-4'>
            <div className='flex items-center justify-between h-16'>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className='sitename font-bold text-xl'
                style={{ color: 'black' }}
              >
                {settings.siteName}
              </motion.span>
              <div className='hidden md:flex space-x-4'>
                {sectionNavigation.map((item, index) => {
                  return (
                    <motion.a
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      href={item.url}
                      className='text-[#222222] hover:text-gray-900 transition-colors font-semibold text-sm hover:bg-gray-100 rounded-md px-2 py-1'
                      target={item.target}
                    >
                      {item.label}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.nav>
      )}
      <div className='bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] sm:bg-[linear-gradient(145deg,var(--tw-gradient-stops))] w-full h-full rounded-[30px] overflow-hidden'>
        {/* Content */}
        <div className='relative z-10 container mx-auto px-4 pt-20'>
          <div className={`${textAlign === 'center' ? 'mx-auto' : ''} mt-[10%]`}>
            {title && (
              <AnimatedText
                text={title}
                className='text-3xl md:text-8xl font-bold mb-3 leading-tight text-left flex'
              />
            )}

            {subtitle && (
              <AnimatedSubtitle
                text={subtitle}
                className='text-2xl md:text-2xl mb-8 text-[#3d3c43] text-left  max-w-[80%] md:max-w-[60%] font-bold'
              />
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <motion.div
                className='space-y-4 mb-10'
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
              className='space-y-4 flex flex-col md:flex-row'
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
      </div>
    </section>
  );
}
