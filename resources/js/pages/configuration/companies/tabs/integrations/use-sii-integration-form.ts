import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import type { SiiIntegrationFormData } from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import {
    normalizeSiiIntegrationProps,
    SII_CERTIFICATE_FILE_FIELD,
    SII_INTEGRATION_KEY_LIST,
} from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import companies from '@/routes/configuration/companies';

type UseSiiIntegrationFormArgs = {
    companyId: string;
    siiIntegration: Record<string, string>;
};

function snapshotSiiIntegration(raw: Record<string, string>): string {
    return SII_INTEGRATION_KEY_LIST.map((k) => raw[k] ?? '').join('\u0001');
}

export function useSiiIntegrationForm({
    companyId,
    siiIntegration,
}: UseSiiIntegrationFormArgs) {
    const snapshot = snapshotSiiIntegration(siiIntegration);

    const defaults = useMemo(
        () => normalizeSiiIntegrationProps(siiIntegration),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `snapshot` codifica el contenido de `siiIntegration`.
        [snapshot],
    );

    const form = useForm<SiiIntegrationFormData>(defaults);

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();

        form.patch(companies.integrations.sii.update.url(companyId), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.setData(SII_CERTIFICATE_FILE_FIELD, null);
            },
        });
    };

    return { form, submit };
}
