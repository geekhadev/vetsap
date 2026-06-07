import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { buildEmptySiiIntegrationFormData } from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import { IntegrationsTabPanel } from '@/pages/configuration/companies/tabs/integrations-tab-panel';
import { INTEGRATION_SETTINGS_PAGE } from '@/pages/configuration/integration-settings/config';
import { IntegrationSettingsSidebar } from '@/pages/configuration/integration-settings/integration-settings-sidebar';
import type {
    IntegrationTabId,
    IntegrationsSettingsIndexPageProps,
} from '@/pages/configuration/integration-settings/types';

function IntegrationsSettingsIndex() {
    const [activeTab, setActiveTab] = useState<IntegrationTabId>('sii');
    const {
        companyMissing,
        companyId,
        siiIntegration: siiIntegrationProp,
        siiEconomicActivities,
        siiCertificateDownloadUrl,
    } = usePage<IntegrationsSettingsIndexPageProps>().props;

    const siiIntegration = useMemo(
        () =>
            siiIntegrationProp ?? buildEmptySiiIntegrationFormData(),
        [siiIntegrationProp],
    );

    if (companyMissing) {
        return (
            <>
                <Head title={INTEGRATION_SETTINGS_PAGE.title} />
                <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                        Debes seleccionar una empresa para configurar las
                        integraciones.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={INTEGRATION_SETTINGS_PAGE.title} />

            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 lg:max-w-[1400px] lg:flex-row lg:items-start lg:gap-12">
                <IntegrationSettingsSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <Card className="min-w-0 flex-1 gap-0 py-0 shadow-xs">
                    <CardContent className="px-0">
                        <div className="p-6">
                            <IntegrationsTabPanel
                                activeTab={activeTab}
                                companyId={companyId}
                                siiCertificateDownloadUrl={
                                    siiCertificateDownloadUrl
                                }
                                siiIntegration={siiIntegration}
                                siiEconomicActivities={siiEconomicActivities}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

IntegrationsSettingsIndex.layout = {
    breadcrumbs: INTEGRATION_SETTINGS_PAGE.breadcrumbs(),
};

export default IntegrationsSettingsIndex;
