import { CalendarDays, Landmark, Mail } from 'lucide-react';
import type { IntegrationTabId } from '@/pages/configuration/integration-settings/types';

export const INTEGRATION_TABS = [
    { id: 'sii' as const, label: 'SII', icon: Landmark },
    {
        id: 'google-calendar' as const,
        label: 'Google Calendar',
        icon: CalendarDays,
    },
    { id: 'google-gmail' as const, label: 'Google Gmail', icon: Mail },
] satisfies ReadonlyArray<{
    id: IntegrationTabId;
    label: string;
    icon: typeof Landmark;
}>;
