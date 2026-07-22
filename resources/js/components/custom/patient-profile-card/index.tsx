import {
    Cake,
    CircuitBoard,
    Droplets,
    Palette,
    PawPrint,
    Scale,
    Scissors,
} from 'lucide-react';
import { DateDisplay } from '@/components/custom/date-display';
import { InfoItem } from '@/components/custom/info-item';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import {
    formatOptionalText,
    formatOptionalWithSuffix,
} from '@/lib/format-display';
import { cn } from '@/lib/utils';
import {
    formatSex,
    formatSterilized,
} from '@/pages/medic/patients/types';
import type { PatientSexValue } from '@/pages/medic/patients/types';
import type { PatientProfileCardProps } from './types';

export type { PatientProfileCardData, PatientProfileCardProps } from './types';

type PatientPhotoPillProps = {
    label: string;
    value: string;
    colorClassName: string;
};

const PHOTO_PILL_SEX_CLASS: Record<'male' | 'female', string> = {
    male: APPOINTMENT_STATUS_COLOR_BADGE_CLASS.green,
    female: APPOINTMENT_STATUS_COLOR_BADGE_CLASS.pink,
};

function PatientPhotoPill({ label, value, colorClassName }: PatientPhotoPillProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'max-w-full rounded-full px-2.5 py-0.5 text-xs font-normal shadow-xs',
                colorClassName,
            )}
        >
            <span className="truncate">
                <span className="font-medium">{label}:</span> {value}
            </span>
        </Badge>
    );
}

function isKnownPatientSex(sex: PatientSexValue): sex is 'male' | 'female' {
    return sex === 'male' || sex === 'female';
}

export function PatientProfileCard({
    patient,
    className,
    actions,
    expandedContent,
}: PatientProfileCardProps) {
    const speciesName = patient.species?.name?.trim() ?? '';
    const recordNumber = patient.record_number?.trim() ?? '';
    const hasKnownSex = isKnownPatientSex(patient.sex);
    const hasPhoto =
        typeof patient.photo_url === 'string' && patient.photo_url !== '';

    return (
        <Card
            className={cn('gap-0 overflow-hidden py-0 shadow-xs', className)}
        >
            <div className="flex flex-col sm:flex-row">
                <div
                    className={cn(
                        'bg-muted relative aspect-4/3 w-full shrink-0 overflow-hidden sm:w-52 md:w-60',
                        'dark:bg-muted/80',
                    )}
                >
                    {hasPhoto ? (
                        <img
                            src={patient.photo_url ?? undefined}
                            alt={`Foto de ${patient.name}`}
                            className="absolute inset-0 size-full object-cover"
                        />
                    ) : (
                        <div className="text-muted-foreground/70 flex size-full flex-col items-center justify-center gap-2">
                            <PawPrint className="size-12" strokeWidth={1.25} />
                            <span className="text-xs font-medium tracking-wide uppercase">
                                Sin foto
                            </span>
                        </div>
                    )}

                    <h2
                        className={cn(
                            'pointer-events-none absolute top-2.5 left-2.5 z-10 max-w-[calc(100%-1.25rem)] truncate',
                            'rounded-md bg-background/95 px-2.5 py-1 text-base font-semibold tracking-tight shadow-xs',
                        )}
                    >
                        {patient.name}
                    </h2>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-1.5 p-2.5">
                        {speciesName !== '' ? (
                            <PatientPhotoPill
                                label="Especie"
                                value={speciesName}
                                colorClassName={
                                    APPOINTMENT_STATUS_COLOR_BADGE_CLASS.blue
                                }
                            />
                        ) : null}
                        {hasKnownSex ? (
                            <PatientPhotoPill
                                label="Sexo"
                                value={formatSex(patient.sex)}
                                colorClassName={
                                    PHOTO_PILL_SEX_CLASS[patient.sex]
                                }
                            />
                        ) : null}
                        {recordNumber !== '' ? (
                            <PatientPhotoPill
                                label="Ficha"
                                value={recordNumber}
                                colorClassName={
                                    APPOINTMENT_STATUS_COLOR_BADGE_CLASS.slate
                                }
                            />
                        ) : null}
                    </div>
                </div>

                <CardContent className="flex min-w-0 flex-1 flex-col gap-4 p-4">
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
                        <InfoItem icon={PawPrint} label="Raza">
                            {formatOptionalText(patient.breed)}
                        </InfoItem>
                        <InfoItem icon={Cake} label="Nacimiento">
                            <DateDisplay
                                value={patient.birth_date}
                                mode="date"
                            />
                        </InfoItem>
                        <InfoItem icon={Scale} label="Peso">
                            {formatOptionalWithSuffix(patient.weight_kg, 'kg')}
                        </InfoItem>
                        <InfoItem icon={Palette} label="Colores">
                            {formatOptionalText(patient.colors)}
                        </InfoItem>
                        <InfoItem icon={Droplets} label="Tipo sanguíneo">
                            {formatOptionalText(patient.blood_type)}
                        </InfoItem>
                        <InfoItem icon={CircuitBoard} label="Chip">
                            {formatOptionalText(patient.microchip_number)}
                        </InfoItem>
                        <InfoItem icon={Scissors} label="Esterilizado">
                            {formatSterilized(patient.is_sterilized)}
                        </InfoItem>
                    </dl>

                    {actions ? (
                        <div className="mt-auto border-t pt-3">{actions}</div>
                    ) : null}
                </CardContent>
            </div>

            {expandedContent ? (
                <div className="border-border border-t px-3 py-4 sm:px-4">
                    {expandedContent}
                </div>
            ) : null}
        </Card>
    );
}
