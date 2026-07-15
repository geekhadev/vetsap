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
