'use client';

import { cn } from '@heroui/react';

type Props = {
  testimony: string;
  name: string;
  job: string;
  className?: string;
};

export function TestimonyCard(props: Props) {
  const { testimony, name, job, className } = props;

  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-8 transition-all duration-200 hover:-translate-y-2',
        // Shadow Neumorphism saat hover
        'hover:shadow-[8px_8px_16px_rgba(209,217,230,0.4),_-8px_-8px_16px_rgba(255,255,255,0.7)]',
        className
      )}
    >
      <p className="text-text-muted mb-6 italic">{`"${testimony}"`}</p>
      <h1 className="text-text text-lg font-bold">{name}</h1>
      <h2 className="text-text-muted text-sm">{job}</h2>
    </div>
  );
}
