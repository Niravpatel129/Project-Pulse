import React from 'react';

interface SectionHeaderProps {
  number?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      <div>
        <div className='text-3xl font-semibold flex items-baseline gap-4'>
          {number && <span className='text-gray-300 text-4xl font-bold'>{number}</span>}
          <span>{title}</span>
        </div>
        {subtitle && <div className='mt-4 text-gray-600 max-w-2xl'>{subtitle}</div>}
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
  );
};

export default SectionHeader;
