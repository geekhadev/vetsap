import { PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PatientSexBadgeProps, PatientSexValue } from './types';
import { formatPatientSexLabel } from './types';

export type { PatientSexBadgeProps, PatientSexValue } from './types';
export { formatPatientSexLabel } from './types';

const PATIENT_SEX_BADGE_CLASS: Record<PatientSexValue, string> = {
    male: 'border-green-200/90 bg-green-50 text-green-800 dark:border-green-900/35 dark:bg-green-950/45 dark:text-green-200',
    female: 'border-pink-200/90 bg-pink-50 text-pink-900 dark:border-pink-900/35 dark:bg-pink-950/45 dark:text-pink-200',
    unknown:
        'border-slate-200/90 bg-slate-50 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/45 dark:text-slate-400',
};

export function PatientSexBadge({ sex, className }: PatientSexBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1 rounded-full px-2.5 py-0.5 font-normal [&>svg]:size-3',
                PATIENT_SEX_BADGE_CLASS[sex],
                className,
            )}
        >
            <PawPrint aria-hidden />
            {formatPatientSexLabel(sex)}
        </Badge>
    );
}
