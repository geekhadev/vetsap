import { SiiIntegrationSubtab } from '@/pages/configuration/companies/tabs/integrations/sii-integration-subtab';
import { useSiiIntegrationForm } from '@/pages/configuration/companies/tabs/integrations/use-sii-integration-form';

type SiiIntegrationFormSectionProps = {
    companyId: string;
    siiCertificateDownloadUrl?: string | null;
    siiIntegration: Record<string, string>;
};

export function SiiIntegrationFormSection({
    companyId,
    siiCertificateDownloadUrl = null,
    siiIntegration,
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
        />
    );
}
