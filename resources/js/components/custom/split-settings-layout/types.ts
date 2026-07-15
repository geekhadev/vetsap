import type { ReactNode } from 'react';

export type SplitSettingsLayoutProps = {
    children: ReactNode;
    className?: string;
};

export type SplitSettingsAsideProps = {
    children: ReactNode;
    className?: string;
};

export type SplitSettingsHeadingProps = {
    title: string;
    description?: string;
    className?: string;
};

export type SplitSettingsPanelProps = {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    /** Renders children directly in CardContent (sin wrapper interno). */
    unwrapped?: boolean;
};
