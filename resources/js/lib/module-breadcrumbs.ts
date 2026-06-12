import type { InertiaLinkProps } from '@inertiajs/react';
import { mainNavItems } from '@/nav';
import { dashboard } from '@/routes';
import { isNavParent } from '@/types';
import type { BreadcrumbItem } from '@/types/navigation';

type ModuleHref = NonNullable<InertiaLinkProps['href']>;

const APP_ROOT_BREADCRUMB: BreadcrumbItem = {
    title: 'Vetsap',
    href: dashboard(),
};

function normalizeHref(href: ModuleHref): string {
    const url = typeof href === 'string' ? href : href.url;
    const [path] = url.split('?');

    return path.replace(/\/$/, '') || '/';
}

function buildScopeByModuleHrefLookup(): Map<string, string> {
    const lookup = new Map<string, string>();

    for (const item of mainNavItems) {
        if (!isNavParent(item)) {
            continue;
        }

        for (const child of item.items) {
            lookup.set(normalizeHref(child.href), item.title);
        }
    }

    return lookup;
}

const scopeByModuleHref = buildScopeByModuleHrefLookup();

export function buildAppRootBreadcrumbs(): BreadcrumbItem[] {
    return [APP_ROOT_BREADCRUMB];
}

export function buildModuleBreadcrumbs(
    moduleTitle: string,
    moduleIndexHref: ModuleHref,
    ...trail: BreadcrumbItem[]
): BreadcrumbItem[] {
    const scopeTitle = scopeByModuleHref.get(normalizeHref(moduleIndexHref));
    const items: BreadcrumbItem[] = [APP_ROOT_BREADCRUMB];

    if (scopeTitle !== undefined) {
        items.push({ title: scopeTitle });
    }

    items.push({ title: moduleTitle, href: moduleIndexHref });

    return [...items, ...trail];
}
