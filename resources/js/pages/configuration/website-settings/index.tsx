import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { WEBSITE_SETTINGS_PAGE } from '@/pages/configuration/website-settings/config';
import type { WebsiteSettingsIndexPageProps } from '@/pages/configuration/website-settings/types';
import { WebsiteSettingsPanel } from '@/pages/configuration/website-settings/website-settings-panel';

function WebsiteSettingsIndex() {
    const { companyMissing } =
        usePage<WebsiteSettingsIndexPageProps>().props;

    if (companyMissing) {
        return (
            <>
                <Head title={WEBSITE_SETTINGS_PAGE.title} />
                <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                        Debes seleccionar una empresa para configurar el sitio
                        web.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={WEBSITE_SETTINGS_PAGE.title} />

            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 lg:max-w-[1400px] lg:flex-row lg:items-start lg:gap-12">
                <div className="flex max-w-xs flex-col gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {WEBSITE_SETTINGS_PAGE.title}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {WEBSITE_SETTINGS_PAGE.description}
                    </p>
                </div>

                <Card className="min-w-0 flex-1 gap-0 py-0 shadow-xs">
                    <CardContent className="px-0">
                        <div className="p-6">
                            <WebsiteSettingsPanel />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

WebsiteSettingsIndex.layout = {
    breadcrumbs: WEBSITE_SETTINGS_PAGE.breadcrumbs(),
};

export default WebsiteSettingsIndex;
