'use client';

import { motion, useAnimationControls, useInView } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader';

interface Client {
  name: string;
  profession?: string;
  logo: string;
  result?: string;
}

interface ClientsSectionProps {
  title?: string;
  subtitle?: string;
  clients?: Client[];
  id?: string;
  sectionNumber?: string;
}

export default function ClientsSection({
  title,
  subtitle,
  clients = [],
  id,
  sectionNumber,
}: ClientsSectionProps) {
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false });

  useEffect(() => {
    if (isInView) {
      controls.start({
        x: [0, -50 * clients.length],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          },
        },
      });
    } else {
      controls.stop();
    }
  }, [isInView, controls, clients.length]);

  // Duplicate clients for seamless infinite scroll
  const duplicatedClients = [...clients, ...clients];

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
              <div
                key={`${client.name}-${index}`}
                className='relative w-[368px] h-[480px] rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex-shrink-0'
              >
                {/* Background Image Container */}
                <div className='absolute inset-0 overflow-hidden'>
                  {/* Background Image */}
                  <Image
                    src={client.logo}
                    alt={`${client.name}'s logo`}
                    fill
                    unoptimized
                    className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
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
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
