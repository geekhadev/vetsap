import { ChevronDown, FilterIcon } from 'lucide-react';
import { useState } from 'react';
import {
    TABLEDATA_LIST_SHELL_ICON_BUTTON_CLASS,
    TABLEDATA_LIST_SHELL_ICON_BUTTON_LABEL_CLASS,
} from '@/components/custom/tabledata/config';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import type { FilterDropdownProps } from './types';

export type { FilterDropdownProps } from './types';

const defaultContentClassName =
    'w-[min(24rem,calc(100vw-2rem))] max-h-[min(85vh,36rem)] overflow-y-auto overflow-x-hidden p-4';

/**
 * Menú desplegable reutilizable para paneles de filtros (toolbar de listados).
 */
export function FilterDropdown({
    children,
    footer,
    triggerLabel = 'Filtros',
    align = 'end',
    triggerClassName,
    contentClassName,
    bodyClassName = 'grid gap-3',
    modal = false,
}: FilterDropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu modal={modal} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    aria-label={triggerLabel}
                    className={cn(
                        TABLEDATA_LIST_SHELL_ICON_BUTTON_CLASS,
                        'shadow-xs sm:gap-2',
                        triggerClassName,
                    )}
                    disabled={open}
                >
                    <FilterIcon
                        className={cn('size-4', open && 'rotate-20')}
                        aria-hidden
                    />
                    <span className={TABLEDATA_LIST_SHELL_ICON_BUTTON_LABEL_CLASS}>
                        {triggerLabel}
                    </span>
                    <ChevronDown
                        className={cn(
                            TABLEDATA_LIST_SHELL_ICON_BUTTON_LABEL_CLASS,
                            'size-4 opacity-70',
                        )}
                        aria-hidden
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={align}
                collisionPadding={16}
                className={cn(defaultContentClassName, contentClassName)}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <div className={bodyClassName}>{children}</div>
                {footer}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
