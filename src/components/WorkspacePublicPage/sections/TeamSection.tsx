import React from 'react';

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
}

const TeamSection: React.FC<TeamSectionProps> = ({
  id,
  title,
  subtitle,
  buttonText = 'Read more',
  onButtonClick,
  team,
}) => {
  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <div className='text-3xl font-semibold flex items-baseline gap-4'>
              <span className='text-gray-300 text-4xl font-bold'>04</span>
              <span>{title}</span>
            </div>
            <div className='mt-4 text-gray-600 max-w-2xl'>{subtitle}</div>
          </div>
          {buttonText && (
            <button
              className='bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-5 py-2 rounded-lg shadow-sm transition'
              onClick={onButtonClick}
            >
              {buttonText}
            </button>
          )}
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {team.map((member, idx) => {
            return (
              <div
                key={member.name}
                className='bg-gray-100 rounded-xl flex flex-col items-center p-6 shadow-sm'
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className='w-32 h-32 rounded-xl object-cover mb-4'
                />
                <div className='font-semibold text-lg text-gray-900 mb-1'>{member.name}</div>
                <div className='text-gray-500 text-sm'>{member.role}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
