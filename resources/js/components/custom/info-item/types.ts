import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type InfoItemProps = {
    label: string;
    children: ReactNode;
    className?: string;
    icon?: LucideIcon;
};
