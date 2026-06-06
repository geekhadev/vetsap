export type PatientSexValue = 'male' | 'female' | 'unknown';

export type PatientSexBadgeProps = {
    sex: PatientSexValue;
    className?: string;
};

const SEX_LABELS: Record<PatientSexValue, string> = {
    male: 'Macho',
    female: 'Hembra',
    unknown: 'Desconocido',
};

export function formatPatientSexLabel(sex: PatientSexValue): string {
    return SEX_LABELS[sex];
}
