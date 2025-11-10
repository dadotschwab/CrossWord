import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
