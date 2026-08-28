import React from 'react';
import { Loader2 } from 'lucide-react';

export const Skeleton = ({ className = '', ...props }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} {...props} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const LoadingState = ({ message = 'Loading carbon intelligence data...', type = 'card' }) => {
  if (type === 'page') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
};

export default LoadingState;
