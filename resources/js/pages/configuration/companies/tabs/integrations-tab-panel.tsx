import { Cloud, Landmark } from 'lucide-react';
import { useMemo } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { GoogleIntegrationSubtab } from '@/pages/configuration/companies/tabs/integrations/google-integration-subtab';
import { SiiIntegrationFormSection } from '@/pages/configuration/companies/tabs/integrations/sii-integration-form-section';
import {
    normalizeSiiIntegrationProps,
    SII_INTEGRATION_KEY_LIST,
} from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import { PlaceholderTabPanel } from '@/pages/configuration/companies/tabs/placeholder-tab-panel';
import type { SiiEconomicActivityOption } from '@/pages/configuration/companies/types';

type IntegrationsTabPanelProps = {
    companyId: string | null;
    siiCertificateDownloadUrl?: string | null;
    siiIntegration?: Record<string, string>;
    siiEconomicActivities: SiiEconomicActivityOption[];
};

export function IntegrationsTabPanel({
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
        return (
            <PlaceholderTabPanel message="Guarda la empresa primero para configurar integraciones." />
        );
    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    Integraciones
                </h2>
                <p className="text-muted-foreground text-sm">
                    Conecta servicios externos asociados a esta empresa.
                </p>
            </div>

            <Tabs defaultValue="sii" className="w-full gap-6">
                <TabsList className="grid h-auto min-h-9 w-full max-w-lg grid-cols-2 gap-1 p-1">
                    <TabsTrigger
                        value="sii"
                        className="h-9 w-full gap-2 px-3"
                    >
                        <Landmark aria-hidden className="size-4 shrink-0" />
                        SII
                    </TabsTrigger>
                    <TabsTrigger
                        value="google"
                        className="h-9 w-full gap-2 px-3"
                    >
                        <Cloud aria-hidden className="size-4 shrink-0" />
                        Google
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="sii" className="outline-none">
                    <SiiIntegrationFormSection
                        key={siiFormRemountKey}
                        companyId={companyId}
                        siiCertificateDownloadUrl={siiCertificateDownloadUrl}
                        siiIntegration={siiIntegration}
                        siiEconomicActivities={siiEconomicActivities}
                    />
                </TabsContent>
                <TabsContent value="google" className="outline-none">
                    <GoogleIntegrationSubtab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
