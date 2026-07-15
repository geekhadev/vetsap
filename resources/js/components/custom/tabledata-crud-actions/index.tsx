import { PencilIcon, TrashIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ActiveStatusBadge } from '@/components/custom/active-status-badge';
import { ConfiguredStatusBadge } from '@/components/custom/configured-status-badge';
import type { TabledataColumn } from '@/components/custom/tabledata';
import { WebVisibilityBadge } from '@/components/custom/web-visibility-badge';
import { Button } from '@/components/ui/button';
import type { ActiveRecordGender } from '@/types/active-record';

const TABLEDATA_STATUS_COLUMN_CLASS = 'w-0 whitespace-nowrap';

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
    editIcon?: LucideIcon;
    editTitle?: string;
};

export function buildTabledataCrudActionsColumn<T>({
    onEdit,
    onDelete,
    can,
    canModifyRow,
    canDeleteRow,
    editIcon: EditIcon = PencilIcon,
    editTitle,
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
        label: '',
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
                        title={editTitle}
                        onClick={() => onEdit(row)}
                    >
                        <EditIcon className="size-3" />
                        {editTitle ? (
                            <span className="sr-only">{editTitle}</span>
                        ) : null}
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
};

export function buildTabledataIsActiveStatusColumn<T extends { is_active: boolean }>({
    gender = 'm',
}: TabledataIsActiveStatusColumnParams = {}): TabledataColumn<T> {
    return {
        key: 'is_active',
        label: 'Estado',
        sortable: false,
        headerClassName: TABLEDATA_STATUS_COLUMN_CLASS,
        className: TABLEDATA_STATUS_COLUMN_CLASS,
        render: (row) => (
            <ActiveStatusBadge active={row.is_active} gender={gender} />
        ),
    };
}

export type TabledataConfiguredStatusColumnParams<T> = {
    key: string;
    label: string;
    isConfigured: (row: T) => boolean;
    sortable?: boolean;
    icon?: LucideIcon;
};

export function buildTabledataConfiguredStatusColumn<T>({
    key,
    label,
    isConfigured,
    sortable = false,
    icon,
}: TabledataConfiguredStatusColumnParams<T>): TabledataColumn<T> {
    return {
        key,
        label,
        sortable,
        headerClassName: TABLEDATA_STATUS_COLUMN_CLASS,
        className: TABLEDATA_STATUS_COLUMN_CLASS,
        render: (row) => (
            <ConfiguredStatusBadge
                configured={isConfigured(row)}
                icon={icon}
            />
        ),
    };
}

export function buildTabledataWebVisibilityColumn<
    T extends { use_web: boolean },
>(): TabledataColumn<T> {
    return {
        key: 'use_web',
        label: 'Web',
        sortable: false,
        headerClassName: TABLEDATA_STATUS_COLUMN_CLASS,
        className: TABLEDATA_STATUS_COLUMN_CLASS,
        render: (row) => <WebVisibilityBadge visible={row.use_web} />,
    };
}
