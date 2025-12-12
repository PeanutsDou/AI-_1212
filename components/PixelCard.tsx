
import React from 'react';
import { playSound } from '../services/audio';

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'primary' | 'danger' | 'success';
}

export const PixelCard: React.FC<PixelCardProps> = ({ 
  children, 
  className = '', 
  title,
  variant = 'default',
  onClick,
  ...props 
}) => {
  const isClickable = !!onClick;

  // Simplified style: Dark green border usually (retro-border)
  // On hover (if clickable): Neon green border (retro-accent) and slight background tint
  const baseBorder = variant === 'danger' ? 'border-red-900' : 'border-retro-border';
  
  const hoverClass = isClickable 
    ? 'cursor-pointer hover:border-retro-accent hover:bg-[#0a1a0a] transition-all duration-200' 
    : '';

  return (
    <div 
      onClick={onClick}
      className={`
        relative 
        bg-retro-card
        border-2 
        ${baseBorder}
        p-4 
        text-retro-text
        ${hoverClass}
        ${className}
      `}
      {...props}
    >
      {/* Simpler Title Tag */}
      {title && (
        <div className="mb-4 border-b border-retro-border pb-1">
          <span className="text-retro-purple font-bold tracking-widest uppercase text-sm">
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

export const PixelButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'success' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  disabled,
  onClick,
  ...props 
}) => {
  
  const baseClass = "px-4 py-2 font-bold text-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider active:translate-y-0.5";
  
  const variantStyles = {
    primary: 'bg-retro-accent text-black border-retro-accent hover:bg-white hover:border-white',
    secondary: 'bg-transparent text-gray-400 border-retro-border hover:text-white hover:border-white',
    danger: 'bg-red-900/50 text-red-200 border-red-900 hover:bg-red-800 hover:text-white hover:border-red-500',
    success: 'bg-green-900/50 text-green-200 border-green-900 hover:bg-green-800 hover:text-white hover:border-green-500'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playSound('click');
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`
        ${baseClass}
        ${variantStyles[variant]} 
        ${className}
      `}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
