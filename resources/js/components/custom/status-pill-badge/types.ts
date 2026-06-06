import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type StatusPillTone = 'positive' | 'negative' | 'neutral';

export type StatusPillBadgeProps = {
    icon: LucideIcon;
    tone: StatusPillTone;
    children: ReactNode;
    className?: string;
};
