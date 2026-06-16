'use client';

import { ReactNode } from 'react';
import { cn } from '@heroui/react';

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  index?: number;
  className?: string;
};

export function BaseCard(props: Props) {
  const { icon, title, description, index, className } = props;
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl bg-white p-8 text-center',
        'transition-all duration-300 hover:-translate-y-2',
        // Shadow Neumorphism saat hover
        'hover:shadow-[8px_8px_16px_rgba(209,217,230,0.4),_-8px_-8px_16px_rgba(255,255,255,0.7)]',
        className
      )}
    >
      <div className="mb-6 flex justify-center">
        <div
          className={cn('rounded-full p-4', {
            'bg-primary/10 text-primary text-4xl': !index,
            'bg-primary flex h-16 w-16 items-center justify-center text-3xl font-bold text-white':
              index,
          })}
        >
          {icon || <div className="leading-none">{index}</div>}
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-text mb-2 text-xl font-bold">{title}</h1>
        <p className="text-text-muted text-sm">{description}</p>
      </div>
    </div>
  );
}
