import React from 'react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ 
  size = 'default', 
  className,
  text 
}) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    default: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-slate-200 border-t-slate-800',
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
}

export function PageLoading({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export function InlineLoading({ message }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner text={message} />
    </div>
  );
}

export function ButtonLoading() {
  return <LoadingSpinner size="small" className="border-white border-t-transparent" />;
}
