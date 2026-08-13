import React from 'react';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const ClayCard: React.FC<ClayCardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`clay-card p-6 ${hoverable ? 'clay-card-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
