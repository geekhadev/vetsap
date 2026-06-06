import type { ReactNode } from 'react';

export type FilterDropdownProps = {
    children: ReactNode;
    footer?: ReactNode;
    triggerLabel?: string;
    align?: 'start' | 'center' | 'end';
    triggerClassName?: string;
    contentClassName?: string;
    bodyClassName?: string;
    modal?: boolean;
};
