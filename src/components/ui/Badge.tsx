import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'danger';
  className?: string;
}

const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
  const variants = {
    primary: 'bg-brand-light text-brand-primary border-brand-primary/10',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    neutral: 'bg-slate-50 text-text-muted border-border-subtle',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`badge-enterprise ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
