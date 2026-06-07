import { useMemo } from 'react';
import { GoogleCalendarSubtab } from '@/pages/configuration/companies/tabs/integrations/google-calendar-subtab';
import { GoogleGmailSubtab } from '@/pages/configuration/companies/tabs/integrations/google-gmail-subtab';
import { SiiIntegrationFormSection } from '@/pages/configuration/companies/tabs/integrations/sii-integration-form-section';
import {
    normalizeSiiIntegrationProps,
    SII_INTEGRATION_KEY_LIST,
} from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import type {
    IntegrationTabId,
    SiiEconomicActivityOption,
} from '@/pages/configuration/integration-settings/types';

type IntegrationsTabPanelProps = {
    activeTab: IntegrationTabId;
    companyId: string | null;
    siiCertificateDownloadUrl?: string | null;
    siiIntegration?: Record<string, string>;
    siiEconomicActivities: SiiEconomicActivityOption[];
};

export function IntegrationsTabPanel({
    activeTab,
    companyId,
    siiCertificateDownloadUrl = null,
    siiIntegration: siiIntegrationProp,
    siiEconomicActivities,
}: IntegrationsTabPanelProps) {
    const siiIntegration = useMemo(
        () => normalizeSiiIntegrationProps(siiIntegrationProp ?? {}),
        [siiIntegrationProp],
    );

    const siiFormRemountKey = useMemo(
        () =>
            [
                ...SII_INTEGRATION_KEY_LIST.map((k) => siiIntegration[k] ?? ''),
                siiCertificateDownloadUrl ?? '',
            ].join('\u0001'),
        [siiIntegration, siiCertificateDownloadUrl],
    );

    if (companyId === null) {
        return null;
    }

    return (
        <div className="w-full">
            {activeTab === 'sii' ? (
                <SiiIntegrationFormSection
                    key={siiFormRemountKey}
                    companyId={companyId}
                    siiCertificateDownloadUrl={siiCertificateDownloadUrl}
                    siiIntegration={siiIntegration}
                    siiEconomicActivities={siiEconomicActivities}
                />
            ) : null}

            {activeTab === 'google-calendar' ? (
                <GoogleCalendarSubtab />
            ) : null}

            {activeTab === 'google-gmail' ? <GoogleGmailSubtab /> : null}
        </div>
    );
}
