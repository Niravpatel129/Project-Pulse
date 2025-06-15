import { AnimatePresence, motion, Variants } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import SectionHeader from './SectionHeader';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

interface TeamSectionProps {
  id?: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  team: TeamMember[];
  sectionNumber?: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  id,
  title,
  subtitle,
  buttonText = 'Read more',
  onButtonClick,
  team,
  sectionNumber,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [shuffledTeam, setShuffledTeam] = useState(team);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 4) {
      // Shuffle the team array
      const shuffled = [...team].sort(() => {
        return Math.random() - 0.5;
      });
      setShuffledTeam(shuffled);
      setClickCount(0);
    }
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
      rotate: -5,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <section id={id} className='py-16 bg-white' onClick={handleClick}>
      <div className='container mx-auto px-4'>
        <SectionHeader
          number={sectionNumber}
          title={title}
          subtitle={subtitle}
          buttonText={buttonText}
          onButtonClick={onButtonClick}
        />
        <motion.div
          variants={container}
          initial='hidden'
          animate='show'
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'
        >
          <AnimatePresence mode='popLayout'>
            {shuffledTeam.map((member, idx) => {
              return (
                <motion.div
                  key={member.name}
                  variants={item}
                  layout
                  className='flex flex-col items-center'
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className='w-full h-96 mb-6'
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={400}
                      height={640}
                      className='w-full h-full rounded-2xl object-cover'
                      sizes='100vw'
                    />
                  </motion.div>
                  <motion.div className='font-semibold text-xl text-gray-900 mb-1' layout>
                    {member.name}
                  </motion.div>
                  <motion.div className='text-gray-400 text-base font-mono tracking-wide' layout>
                    {member.role}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
