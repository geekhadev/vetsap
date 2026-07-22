import { Link, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { filterNavByUser } from '@/lib/filter-nav';
import { customerNavItems, mainNavItems } from '@/nav';
import { dashboard } from '@/routes';
import { index as petsIndex } from '@/routes/customer/pets';
import type { NavLeafItem } from '@/types';

const footerNavItems: NavLeafItem[] = [
    {
        title: 'Manual de usuario',
        href: '#',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isCustomer = auth.user.type === 'customer';
    const visibleNavItems = filterNavByUser(
        mainNavItems,
        auth.user,
        auth.permissions ?? [],
        customerNavItems,
    );
    const homeHref = isCustomer ? petsIndex() : dashboard();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={visibleNavItems}
                    label={isCustomer ? 'Portal del cliente' : 'ERP - Veterinario'}
                />
            </SidebarContent>

            <SidebarFooter>
                {!isCustomer ? (
                    <NavFooter items={footerNavItems} className="mt-auto" />
                ) : null}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
