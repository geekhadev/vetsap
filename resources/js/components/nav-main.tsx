import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { isNavParent } from '@/types';
import type { NavItem, NavParentItem } from '@/types';

type ManualOpenSection = { parentTitle: string; pathname: string };

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { currentUrl, isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const [manualOpen, setManualOpen] = useState<ManualOpenSection | null>(
        null,
    );

    const [accordionDismissed, setAccordionDismissed] =
        useState<ManualOpenSection | null>(null);

    const manualOpenApplies =
        manualOpen !== null && manualOpen.pathname === currentUrl;

    const dismissApplies =
        accordionDismissed !== null &&
        accordionDismissed.pathname === currentUrl;

    const handleParentOpenChange = (
        item: NavParentItem,
        nextOpen: boolean,
    ): void => {
        const childActive = item.items.some(
            (c) => !c.disabled && isCurrentOrParentUrl(c.href),
        );

        if (nextOpen) {
            setAccordionDismissed((d) =>
                d?.pathname === currentUrl && d.parentTitle === item.title
                    ? null
                    : d,
            );
            setManualOpen({
                parentTitle: item.title,
                pathname: currentUrl,
            });

            return;
        }

        setManualOpen((prev) =>
            prev?.parentTitle === item.title ? null : prev,
        );

        if (childActive) {
            setAccordionDismissed({
                parentTitle: item.title,
                pathname: currentUrl,
            });
        } else {
            setAccordionDismissed((d) =>
                d?.pathname === currentUrl && d.parentTitle === item.title
                    ? null
                    : d,
            );
        }
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>ERP - Veterinario</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    isNavParent(item) ? (
                        <NavMainCollapsibleParent
                            key={item.title}
                            item={item}
                            isCurrentOrParentUrl={isCurrentOrParentUrl}
                            manualOpenApplies={manualOpenApplies}
                            manualOpenParentTitle={manualOpen?.parentTitle ?? null}
                            sectionDismissed={
                                dismissApplies &&
                                accordionDismissed?.parentTitle === item.title
                            }
                            onOpenChange={(open) =>
                                handleParentOpenChange(item, open)
                            }
                        />
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    isCurrentUrl(item.href) &&
                                        'bg-primary text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                )}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
function NavMainCollapsibleParent({
    item,
    isCurrentOrParentUrl,
    manualOpenApplies,
    manualOpenParentTitle,
    sectionDismissed,
    onOpenChange,
}: {
    item: NavParentItem;
    isCurrentOrParentUrl: ReturnType<
        typeof useCurrentUrl
    >['isCurrentOrParentUrl'];
    manualOpenApplies: boolean;
    manualOpenParentTitle: string | null;
    sectionDismissed: boolean;
    onOpenChange: (open: boolean) => void;
}): ReactElement {
    const { isMobile, state } = useSidebar();
    const childActive = item.items.some(
        (c) => !c.disabled && isCurrentOrParentUrl(c.href),
    );
    const isOpen =
        (childActive && !sectionDismissed) ||
        (manualOpenApplies && manualOpenParentTitle === item.title);

    if (state === 'collapsed' && !isMobile) {
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            isActive={childActive}
                            className={cn(
                                'w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                                childActive &&
                                    'bg-primary text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=open]:bg-primary data-[state=open]:text-primary-foreground',
                            )}
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        align="start"
                        sideOffset={4}
                        className="min-w-48 rounded-lg"
                    >
                        <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.items.map((child) => {
                            if (child.disabled) {
                                return (
                                    <DropdownMenuItem
                                        key={child.title}
                                        disabled
                                    >
                                        {child.icon && <child.icon />}
                                        <span>{child.title}</span>
                                    </DropdownMenuItem>
                                );
                            }

                            const isActive = isCurrentOrParentUrl(child.href);

                            return (
                                <DropdownMenuItem
                                    key={child.title}
                                    asChild
                                    className={cn(
                                        isActive &&
                                            'bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground [&_svg]:text-primary-foreground',
                                    )}
                                >
                                    <Link href={child.href} prefetch>
                                        {child.icon && <child.icon />}
                                        <span>{child.title}</span>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible w-full"
                open={isOpen}
                onOpenChange={onOpenChange}
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={childActive} className="w-full">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight
                            className={cn(
                                'ml-auto transition-transform duration-200',
                                isOpen && 'rotate-90',
                            )}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.items.map((child) => {
                            if (child.disabled) {
                                return (
                                    <SidebarMenuSubItem key={child.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            aria-disabled="true"
                                            className="pointer-events-none opacity-50"
                                        >
                                            <span>
                                                {child.icon && <child.icon />}
                                                <span>{child.title}</span>
                                            </span>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                );
                            }

                            const isActive = isCurrentOrParentUrl(child.href);

                            return (
                                <SidebarMenuSubItem key={child.title}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isActive}
                                        className={cn(
                                            isActive &&
                                                'bg-primary text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground [&>svg]:text-primary-foreground',
                                        )}
                                    >
                                        <Link href={child.href} prefetch>
                                            {child.icon && <child.icon />}
                                            <span>{child.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            );
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}
