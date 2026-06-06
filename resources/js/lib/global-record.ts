export type GlobalRecordRow = {
    is_global?: boolean;
    company_id?: string | null;
};

export type GlobalRecordCan = {
    update: boolean;
    delete: boolean;
};

export function isGlobalRecord(row: GlobalRecordRow): boolean {
    if (row.is_global === true) {
        return true;
    }

    return row.company_id === null;
}

export function canModifyGlobalRecordRow(
    row: GlobalRecordRow,
    can: Pick<GlobalRecordCan, 'update'>,
): boolean {
    if (isGlobalRecord(row)) {
        return false;
    }

    return can.update;
}

export function canDeleteGlobalRecordRow(
    row: GlobalRecordRow,
    can: Pick<GlobalRecordCan, 'delete'>,
): boolean {
    if (isGlobalRecord(row)) {
        return false;
    }

    return can.delete;
}

export function buildCanModifyGlobalRecordRow<T extends GlobalRecordRow>(
    can: Pick<GlobalRecordCan, 'update'>,
): (row: T) => boolean {
    return (row) => canModifyGlobalRecordRow(row, can);
}

export function buildCanDeleteGlobalRecordRow<T extends GlobalRecordRow>(
    can: Pick<GlobalRecordCan, 'delete'>,
): (row: T) => boolean {
    return (row) => canDeleteGlobalRecordRow(row, can);
}
