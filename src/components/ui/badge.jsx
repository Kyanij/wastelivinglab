import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-green-100 text-green-700',
        secondary: 'border-transparent bg-gray-100 text-gray-600',
        success: 'border-transparent bg-emerald-100 text-emerald-700',
        warning: 'border-transparent bg-yellow-100 text-yellow-700',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline: 'border-gray-300 text-gray-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };