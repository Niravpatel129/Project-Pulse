import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import SectionHeader from './SectionHeader';

interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
  link?: string;
  price?: string;
}

interface ServiceSectionProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
  id?: string;

  // Generic configuration options
  variant?: 'default' | 'cards' | 'list' | 'pricing';
  backgroundColor?: 'white' | 'gray' | 'transparent';
  columns?: 1 | 2 | 3 | 4;
  showCTA?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  primaryColor?: string;
  layout?: 'grid' | 'carousel' | 'stacked';
  sectionNumber?: string;
}

export default function ServiceSection({
  title,
  subtitle,
  services = [],
  id,
  variant = 'default',
  backgroundColor = 'gray',
  columns = 3,
  showCTA = true,
  ctaText = 'Get Started Today',
  ctaUrl = 'tel:4377743721',
  primaryColor = '#7C3AED',
  layout = 'grid',
  sectionNumber,
}: ServiceSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoSwitchInterval = useRef<NodeJS.Timeout | null>(null);
  const PROGRESS_DURATION = 5000; // 5 seconds per tab

  useEffect(() => {
    // Start auto-switching
    autoSwitchInterval.current = setInterval(() => {
      setActiveTab((prev) => {
        return prev === services.length - 1 ? 0 : prev + 1;
      });
    }, PROGRESS_DURATION);

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / (PROGRESS_DURATION / 100); // Increment progress every 100ms
      });
    }, 100);

    return () => {
      if (autoSwitchInterval.current) {
        clearInterval(autoSwitchInterval.current);
      }
      clearInterval(progressInterval);
    };
  }, [services.length]);

  // Reset progress when tab changes
  useEffect(() => {
    setProgress(0);
  }, [activeTab]);

  if (services.length === 0) return null;

  const handlePrevious = () => {
    setActiveTab((prev) => {
      return prev === 0 ? services.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setActiveTab((prev) => {
      return prev === services.length - 1 ? 0 : prev + 1;
    });
  };

  const currentService = services[activeTab];

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const renderService = (service: Service, index: number) => {
    const baseClasses =
      'bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300';

    if (variant === 'pricing') {
      return (
        <div key={index} className={`${baseClasses} relative`}>
          {service.price && (
            <div className='absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-bl-lg rounded-tr-lg'>
              {service.price}
            </div>
          )}
          <div className='text-center mb-6'>
            <div className='text-4xl mb-4'>{service.icon}</div>
            <h3 className='text-xl font-semibold mb-3'>{service.title}</h3>
            <p className='text-gray-600 mb-6'>{service.description}</p>
          </div>
          {renderFeatures(service.features)}
          {renderServiceCTA(service)}
        </div>
      );
    }

    if (variant === 'list') {
      return (
        <div key={index} className='flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm'>
          <div className='text-3xl flex-shrink-0'>{service.icon}</div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold mb-2'>{service.title}</h3>
            <p className='text-gray-600 mb-3'>{service.description}</p>
            {renderFeatures(service.features, true)}
          </div>
        </div>
      );
    }

    // Default card variant
    return (
      <div key={index} className={baseClasses}>
        <div className='text-center mb-6'>
          <div className='text-4xl mb-4'>{service.icon}</div>
          <h3 className='text-xl font-semibold mb-3'>{service.title}</h3>
          <p className='text-gray-600 mb-6'>{service.description}</p>
        </div>
        {renderFeatures(service.features)}
        {renderServiceCTA(service)}
      </div>
    );
  };

  const renderFeatures = (features: string[], inline = false) => {
    if (inline) {
      return (
        <div className='flex flex-wrap gap-2'>
          {features.map((feature, featureIndex) => {
            return (
              <span
                key={featureIndex}
                className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'
              >
                {feature}
              </span>
            );
          })}
        </div>
      );
    }

    return (
      <div className='space-y-3'>
        {features.map((feature, featureIndex) => {
          return (
            <div key={featureIndex} className='flex items-center'>
              <span className='mr-3 text-lg'>✓</span>
              <span className='text-gray-700 text-sm'>{feature}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderServiceCTA = (service: Service) => {
    if (!showCTA) return null;

    const url = service.link || ctaUrl;
    const text = variant === 'pricing' ? 'Choose Plan' : 'Learn More';

    return (
      <div className=''>
        <Button className=''>{text}</Button>
      </div>
    );
  };

  const renderLayout = () => {
    if (layout === 'stacked') {
      return <div className='space-y-6 max-w-3xl mx-auto'>{services.map(renderService)}</div>;
    }

    // Default grid layout
    return <div className={`grid ${gridCols} gap-8`}>{services.map(renderService)}</div>;
  };

  return (
    <section id={id} className={`py-16 bg-white`}>
      <div className='container mx-auto px-4 max-w-5xl'>
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        <div className='max-w-6xl mx-auto'>
          {/* Custom Tabs */}
          <div className='flex justify-center mb-12'>
            <div className='flex w-full justify-between border-b border-gray-200'>
              {services.map((service, index) => {
                return (
                  <button
                    key={service.title}
                    onClick={() => {
                      setActiveTab(index);
                    }}
                    className={`py-3 px-6 focus:outline-none transition-colors duration-200 ease-in-out text-base relative flex-1 text-center ${
                      activeTab === index
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <span
                      className={`mr-2 font-mono text-sm ${
                        activeTab === index ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    {service.title}
                    {activeTab === index && (
                      <motion.div
                        className='absolute bottom-0 left-0 h-0.5 bg-gray-900'
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className='relative bg-white rounded-2xl shadow-xl overflow-hidden min-h-[550px]'>
            {/* Blurred background image */}
            <Image
              width={1000}
              height={1000}
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/images/restaurant-blurred-bg-aN2fnA4yLMGweDLJTwWhghbSeI49SI.png'
              alt='Abstract restaurant background'
              className='absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none select-none'
              style={{ zIndex: 0 }}
            />
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='relative z-10 flex flex-col md:flex-row h-full'
              >
                <div className='w-full md:w-1/2 p-8 py-16 sm:p-12 md:p-16 flex flex-col justify-center'>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='text-lg sm:text-xl md:text-2xl text-gray-700 mb-3'
                  >
                    {currentService.title}
                  </motion.p>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-4'
                  >
                    {currentService.description}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {renderFeatures(currentService.features)}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Previous/Next Navigation */}
          <div className='flex justify-between items-center mt-12'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              className='flex items-center space-x-3 group'
            >
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center transition-colors group-hover:bg-gray-200'>
                <span className='material-icons text-gray-600'>&#8592;</span>
              </div>
              <span className='text-gray-600 font-medium transition-colors group-hover:text-gray-900'>
                Previous
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className='flex items-center space-x-3 group'
            >
              <span className='text-gray-600 font-medium transition-colors group-hover:text-gray-900'>
                Next
              </span>
              <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center transition-colors group-hover:bg-gray-200'>
                <span className='material-icons text-gray-600'>&#8594;</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
