import {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import type {
    DocumentTemplateVariableFlat,
    MentionListHandle,
    MentionListProps,
} from '@/components/custom/document-template-editor/types';
import { cn } from '@/lib/utils';

type MentionRow =
    | { kind: 'header'; groupLabel: string }
    | { kind: 'item'; item: DocumentTemplateVariableFlat; index: number };

export const MentionList = forwardRef<MentionListHandle, MentionListProps>(
    function MentionList({ items, command }, ref) {
        const [selectedIndex, setSelectedIndex] = useState(0);
        const activeIndex =
            items.length === 0 ? 0 : selectedIndex % items.length;

        const rows = useMemo(() => {
            const next: MentionRow[] = [];
            let index = 0;
            let lastGroup = '';

            for (const item of items) {
                if (item.group_label !== lastGroup) {
                    next.push({
                        kind: 'header',
                        groupLabel: item.group_label,
                    });
                    lastGroup = item.group_label;
                }

                next.push({ kind: 'item', item, index });
                index += 1;
            }

            return next;
        }, [items]);

        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }) => {
                if (event.key === 'ArrowUp') {
                    setSelectedIndex((index) =>
                        (index + items.length - 1) % Math.max(items.length, 1),
                    );

                    return true;
                }

                if (event.key === 'ArrowDown') {
                    setSelectedIndex((index) =>
                        (index + 1) % Math.max(items.length, 1),
                    );

                    return true;
                }

                if (event.key === 'Enter') {
                    const item = items[activeIndex];

                    if (item) {
                        command({ id: item.id, label: item.id });
                    }

                    return true;
                }

                return false;
            },
        }));

        if (items.length === 0) {
            return (
                <div className="rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                    Sin variables
                </div>
            );
        }

        return (
            <div className="max-h-64 w-72 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                {rows.map((row) => {
                    if (row.kind === 'header') {
                        return (
                            <div
                                key={`header-${row.groupLabel}`}
                                className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                {row.groupLabel}
                            </div>
                        );
                    }

                    return (
                        <button
                            key={row.item.id}
                            type="button"
                            className={cn(
                                'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm',
                                row.index === activeIndex
                                    ? 'bg-accent text-accent-foreground'
                                    : 'hover:bg-accent/60',
                            )}
                            onClick={() =>
                                command({
                                    id: row.item.id,
                                    label: row.item.id,
                                })
                            }
                        >
                            <span>{row.item.label}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                                @{row.item.id}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    },
);
