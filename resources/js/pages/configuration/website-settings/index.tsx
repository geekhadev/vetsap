import { Head, usePage } from '@inertiajs/react';
import {
    SplitSettingsAside,
    SplitSettingsHeading,
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
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

            <SplitSettingsLayout>
                <SplitSettingsAside>
                    <SplitSettingsHeading
                        title={WEBSITE_SETTINGS_PAGE.title}
                        description={WEBSITE_SETTINGS_PAGE.description}
                    />
                </SplitSettingsAside>

                <SplitSettingsPanel>
                    <WebsiteSettingsPanel />
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}

WebsiteSettingsIndex.layout = {
    breadcrumbs: WEBSITE_SETTINGS_PAGE.breadcrumbs(),
};

export default WebsiteSettingsIndex;
