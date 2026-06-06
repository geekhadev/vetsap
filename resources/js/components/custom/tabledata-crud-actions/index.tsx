import { PencilIcon, TrashIcon } from 'lucide-react';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    formatIsActive as formatIsActiveDefault
    
} from '@/types/active-record';
import type {ActiveRecordGender} from '@/types/active-record';

export type TabledataCrudActionsCan = {
    update?: boolean;
    delete?: boolean;
};

export type BuildTabledataCrudActionsColumnParams<T> = {
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    can?: TabledataCrudActionsCan;
    canModifyRow?: (row: T) => boolean;
    canDeleteRow?: (row: T) => boolean;
};

export function buildTabledataCrudActionsColumn<T>({
    onEdit,
    onDelete,
    can,
    canModifyRow,
    canDeleteRow,
}: BuildTabledataCrudActionsColumnParams<T>): TabledataColumn<T> {
    const resolveCanUpdate = (row: T): boolean => {
        if (canModifyRow) {
            return canModifyRow(row);
        }

        return can?.update ?? true;
    };

    const resolveCanDelete = (row: T): boolean => {
        if (canDeleteRow) {
            return canDeleteRow(row);
        }

        return can?.delete ?? true;
    };

    return {
        key: 'actions',
        label: 'Acciones',
        sortable: false,
        hideable: false,
        headerClassName: 'w-0 text-right',
        render: (row) => (
            <div className="flex justify-end gap-1">
                {resolveCanUpdate(row) ? (
                    <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => onEdit(row)}
                    >
                        <PencilIcon className="size-3" />
                    </Button>
                ) : null}
                {resolveCanDelete(row) ? (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="p-0.5"
                        type="button"
                        onClick={() => onDelete(row)}
                    >
                        <TrashIcon className="size-3" />
                    </Button>
                ) : null}
            </div>
        ),
    };
}

export type TabledataIsActiveStatusColumnParams = {
    gender?: ActiveRecordGender;
    formatIsActive?: (value: boolean) => string;
};

export function buildTabledataIsActiveStatusColumn<T extends { is_active: boolean }>({
    gender = 'm',
    formatIsActive: formatFn,
}: TabledataIsActiveStatusColumnParams = {}): TabledataColumn<T> {
    const resolveLabel = formatFn ?? ((value: boolean) => formatIsActiveDefault(value, gender));

    return {
        key: 'is_active',
        label: 'Estado',
        sortable: true,
        render: (row) => (
            <Badge variant={row.is_active ? 'default' : 'secondary'}>
                {resolveLabel(row.is_active)}
            </Badge>
        ),
    };
}
