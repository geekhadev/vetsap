export type ActiveRecordGender = 'm' | 'f';

const ACTIVE_LABELS = {
    m: {
        active: 'Activo',
        inactive: 'Inactivo',
        filterActive: 'Activos',
        filterInactive: 'Inactivos',
    },
    f: {
        active: 'Activa',
        inactive: 'Inactiva',
        filterActive: 'Activas',
        filterInactive: 'Inactivas',
    },
} as const;

export type IsActiveFilterOption = {
    id: '1' | '0';
    label: string;
};

export function formatIsActive(
    value: boolean,
    gender: ActiveRecordGender = 'm',
): string {
    const labels = ACTIVE_LABELS[gender];

    return value ? labels.active : labels.inactive;
}

export function isActiveFilterOptions(
    gender: ActiveRecordGender = 'm',
): readonly IsActiveFilterOption[] {
    const labels = ACTIVE_LABELS[gender];

    return [
        { id: '1', label: labels.filterActive },
        { id: '0', label: labels.filterInactive },
    ] as const;
}

/** @deprecated Prefer `isActiveFilterOptions(gender)` */
export const IS_ACTIVE_FILTER_OPTIONS = isActiveFilterOptions('m');
