import { router, usePage } from '@inertiajs/react';
import { Building2, Check, ChevronsUpDown, Globe, Plus } from 'lucide-react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { CompanyCreateDialog } from '@/components/custom/company-switcher/company-create-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { show as clinicShow } from '@/routes/clinic';
import { store as companySelectionStore } from '@/routes/company-selection';
import type { CompanySelectedSession, SelectableCompanyOption } from '@/types';

function companyPrimaryLabel(row: {
    name: string;
    alias: string | null;
}): string {
    const trimmed = row.alias?.trim();

    return trimmed ? trimmed : row.name;
}

export function CompanySwitcher() {
    const page = usePage<{
        show_company_switcher: boolean;
        can_create_company: boolean;
        company_selected: CompanySelectedSession | null;
        selectable_companies: SelectableCompanyOption[];
    }>();

    const {
        show_company_switcher: showSwitcher,
        can_create_company: canCreateCompany,
        company_selected: selected,
        selectable_companies: options,
    } = page.props;

    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const primaryLabel = useMemo(() => {
        if (!selected) {
            return 'Empresa';
        }

        return companyPrimaryLabel(selected);
    }, [selected]);

    const selectCompany = useCallback(
        (companyId: string) => {
            if (companyId === selected?.id) {
                return;
            }

            router.post(
                companySelectionStore.url(),
                { company_id: companyId },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Las respuestas prefetch del menú incluyen props compartidas antiguas
                        // (p. ej. `company_selected`); sin vaciar la caché, la siguiente visita
                        // puede reutilizar datos obsoletos hasta que expire el prefetch.
                        router.flushAll();
                    },
                },
            );
        },
        [selected?.id],
    );

    const clinicSlug = selected?.slug?.trim();

    if (!showSwitcher && !clinicSlug) {
        return null;
    }

    return (
        <>
            <div className="flex shrink-0 items-center gap-1">
                {clinicSlug ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="border-sidebar-border/70 text-muted-foreground size-9 shrink-0"
                                asChild
                            >
                                <a
                                    href={clinicShow.url(clinicSlug)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Ver sitio web de la empresa"
                                >
                                    <Globe className="size-4" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Sitio web de la empresa
                        </TooltipContent>
                    </Tooltip>
                ) : null}
                {showSwitcher ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-sidebar-border/70 text-muted-foreground data-[state=open]:bg-sidebar-accent h-auto max-w-[220px] shrink-0 gap-2 py-2"
                                aria-label="Cambiar empresa"
                            >
                                <Building2 className="size-4 shrink-0 self-center" />
                                <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
                                    <span className="text-foreground w-full truncate font-medium">
                                        {primaryLabel}
                                    </span>
                                </div>
                                <ChevronsUpDown className="size-4 shrink-0 self-center opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                                Cambiar empresa
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {options.map((row, index) => {
                                const isSelected = row.id === selected?.id;

                                return (
                                    <Fragment key={row.id}>
                                        {index > 0 ? (
                                            <DropdownMenuSeparator />
                                        ) : null}
                                        <DropdownMenuItem
                                            onSelect={() =>
                                                selectCompany(row.id)
                                            }
                                            className={cn(
                                                'cursor-pointer',
                                                isSelected &&
                                                    'bg-accent text-accent-foreground font-semibold',
                                            )}
                                        >
                                            <span className="min-w-0 flex-1 truncate">
                                                {companyPrimaryLabel(row)}
                                            </span>
                                            {isSelected ? (
                                                <Check className="text-accent-foreground size-4 shrink-0" />
                                            ) : null}
                                        </DropdownMenuItem>
                                    </Fragment>
                                );
                            })}
                            {canCreateCompany ? (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onSelect={() =>
                                            setCreateDialogOpen(true)
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Plus className="size-4" />
                                        Crear nueva empresa
                                    </DropdownMenuItem>
                                </>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>

            {canCreateCompany && createDialogOpen ? (
                <CompanyCreateDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                />
            ) : null}
        </>
    );
}
