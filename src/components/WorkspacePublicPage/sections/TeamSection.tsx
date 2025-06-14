import Image from 'next/image';
import React from 'react';
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
  sectionNumber = '04',
}) => {
  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <SectionHeader
          number={sectionNumber}
          title={title}
          subtitle={subtitle}
          buttonText={buttonText}
          onButtonClick={onButtonClick}
        />
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {team.map((member, idx) => {
            return (
              <div key={member.name} className='flex flex-col items-center'>
                <div className='w-full h-96 mb-6'>
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={640}
                    className='w-full h-full rounded-2xl object-cover'
                    sizes='100vw'
                  />
                </div>
                <div className='font-semibold text-xl text-gray-900 mb-1'>{member.name}</div>
                <div className='text-gray-400 text-base font-mono tracking-wide'>{member.role}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
