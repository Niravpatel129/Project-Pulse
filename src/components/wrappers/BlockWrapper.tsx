import React from 'react';

export default function BlockWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`bg-white rounded-lg p-4 overflow-hidden ${className}`}>{children}</div>;
}
