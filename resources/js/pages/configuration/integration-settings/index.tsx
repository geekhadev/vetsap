import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
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

            <SplitSettingsLayout>
                <IntegrationSettingsSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <SplitSettingsPanel>
                    <IntegrationsTabPanel
                        activeTab={activeTab}
                        companyId={companyId}
                        siiCertificateDownloadUrl={
                            siiCertificateDownloadUrl
                        }
                        siiIntegration={siiIntegration}
                        siiEconomicActivities={siiEconomicActivities}
                    />
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}

IntegrationsSettingsIndex.layout = {
    breadcrumbs: INTEGRATION_SETTINGS_PAGE.breadcrumbs(),
};

export default IntegrationsSettingsIndex;
