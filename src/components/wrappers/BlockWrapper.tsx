import React from 'react';

export default function BlockWrapper({ children }: { children: React.ReactNode }) {
  return <div className='bg-white rounded-lg p-4'>{children}</div>;
}
