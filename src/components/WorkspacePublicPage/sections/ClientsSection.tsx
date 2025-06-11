'use client';

import { useEffect, useRef } from 'react';

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
}

export default function ClientsSection({ title, subtitle, clients = [], id }: ClientsSectionProps) {
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

  // Duplicate clients for seamless infinite scroll
  const duplicatedClients = [...clients, ...clients];

  return (
    <section id={id} className='py-16 bg-white overflow-hidden'>
      <div className='container mx-auto px-4 mb-12'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-5xl font-bold mb-4'>{title}</h2>
          <p className='text-lg text-gray-600'>{subtitle}</p>
        </div>
      </div>

      {/* Full Width Scrolling Carousel */}
      <div
        ref={scrollRef}
        className='flex gap-6 overflow-x-hidden pl-6 pr-6'
        style={{
          scrollBehavior: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {duplicatedClients.map((client, index) => {
          return (
            <div
              key={`${client.name}-${index}`}
              className='relative w-[368px] h-[480px] rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex-shrink-0'
            >
              {/* Background Image */}
              <div
                className='absolute inset-0 bg-cover bg-center bg-gray-300 transition-transform duration-700 ease-out group-hover:scale-110'
                style={{
                  backgroundImage: `url(${client.logo})`,
                }}
              >
                {/* Overlay for better text readability */}
                <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 group-hover:from-black/50 group-hover:to-black/70 transition-all duration-300'></div>
              </div>

              {/* Fallback when image doesn't load */}
              <div className='absolute inset-0 bg-gradient-to-br from-gray-500 to-white-600 opacity-80 transition-transform duration-700 ease-out group-hover:scale-110'>
                <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 group-hover:from-black/30 group-hover:to-black/50 transition-all duration-300'></div>
              </div>

              {/* Content */}
              <div className='relative h-full flex flex-col justify-between p-6 text-white z-10'>
                {/* Top Left - Name and Profession */}
                <div className='space-y-1 transform transition-transform duration-300 group-hover:translate-y-[-2px]'>
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
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
