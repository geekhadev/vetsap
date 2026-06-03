import { SiiIntegrationSubtab } from '@/pages/configuration/companies/tabs/integrations/sii-integration-subtab';
import { useSiiIntegrationForm } from '@/pages/configuration/companies/tabs/integrations/use-sii-integration-form';
import type { SiiEconomicActivityOption } from '@/pages/configuration/companies/types';

type SiiIntegrationFormSectionProps = {
    companyId: string;
    siiCertificateDownloadUrl?: string | null;
    siiIntegration: Record<string, string>;
    siiEconomicActivities: SiiEconomicActivityOption[];
};

export function SiiIntegrationFormSection({
    companyId,
    siiCertificateDownloadUrl = null,
    siiIntegration,
    siiEconomicActivities,
}: SiiIntegrationFormSectionProps) {
    const { form, submit } = useSiiIntegrationForm({
        companyId,
        siiIntegration,
    });

    return (
        <SiiIntegrationSubtab
            form={form}
            onSubmit={submit}
            siiCertificateDownloadUrl={siiCertificateDownloadUrl}
            siiEconomicActivities={siiEconomicActivities}
        />
    );
}
