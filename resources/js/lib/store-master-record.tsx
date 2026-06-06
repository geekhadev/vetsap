import type { ReactNode } from 'react';
import { GlobalRecordBadge } from '@/components/custom/global-record-badge';
import type { GlobalRecordCan, GlobalRecordRow } from '@/lib/global-record';
import {
    canDeleteGlobalRecordRow,
    canModifyGlobalRecordRow,
    isGlobalRecord,
} from '@/lib/global-record';

export type StoreMasterRecordRow = GlobalRecordRow;

export type StoreMasterRecordCan = GlobalRecordCan;

export { isGlobalRecord };

export function canModifyStoreMasterRow(
    row: StoreMasterRecordRow,
    can: Pick<StoreMasterRecordCan, 'update'>,
): boolean {
    return canModifyGlobalRecordRow(row, can);
}

export function canDeleteStoreMasterRow(
    row: StoreMasterRecordRow,
    can: Pick<StoreMasterRecordCan, 'delete'>,
): boolean {
    return canDeleteGlobalRecordRow(row, can);
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
