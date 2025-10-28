//Loader
import * as React from 'react';

import { cn } from '@/lib/utils';

const Loader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div className='flex flex-col items-center gap-4' >
            <div
                ref={ref}
                className={cn(
                    'inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-lg text-primary',
                    className,
                )}
                {...props}
            />
            <p className='text-lg text-primary font-semibold'>
                Loading...
            </p>
        </div>
    ),
);
Loader.displayName = 'Loader';

export { Loader };