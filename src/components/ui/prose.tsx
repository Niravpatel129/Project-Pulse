import React from 'react';

type ProseProps = React.HTMLAttributes<HTMLDivElement> & {
  /** You can pass Tailwind’s prose classes here if you want variants */
  className?: string;
};

export function Prose({ className = '', children, ...rest }: ProseProps) {
  return (
    <div
      className={`prose prose-sm dark:prose-invert prose-a:text-primary prose-img:rounded-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
