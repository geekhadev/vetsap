import type { ReactNode } from 'react';
import { GlobalRecordBadge } from '@/components/custom/global-record-badge';

export type StoreMasterRecordRow = {
    company_id: string | null;
};

export type StoreMasterRecordCan = {
    update: boolean;
    delete: boolean;
};

export function isGlobalRecord(row: StoreMasterRecordRow): boolean {
    return row.company_id === null;
}

export function canModifyStoreMasterRow(
    row: StoreMasterRecordRow,
    can: StoreMasterRecordCan,
    isRoot: boolean,
): boolean {
    if (isGlobalRecord(row)) {
        return isRoot && can.update;
    }

    return can.update;
}

export function canDeleteStoreMasterRow(
    row: StoreMasterRecordRow,
    can: StoreMasterRecordCan,
    isRoot: boolean,
): boolean {
    if (isGlobalRecord(row)) {
        return isRoot && can.delete;
    }

    return can.delete;
}

export function renderMasterRecordName(
    name: string | undefined,
    companyId: string | null | undefined,
): ReactNode {
    if (!name) {
        return '—';
    }

    return (
        <span className="inline-flex flex-wrap items-center gap-2">
            {name}
            {companyId === null ? <GlobalRecordBadge /> : null}
        </span>
    );
}
