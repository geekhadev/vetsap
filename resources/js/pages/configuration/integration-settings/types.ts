export type IntegrationTabId = 'sii' | 'google-calendar' | 'google-gmail';

export type SiiEconomicActivityOption = {
    id: number;
    code: string;
    description: string;
};

export type IntegrationsSettingsIndexPageProps = {
    companyMissing: boolean;
    companyId: string | null;
    siiIntegration: Record<string, string> | null;
    siiEconomicActivities: SiiEconomicActivityOption[];
    siiCertificateDownloadUrl: string | null;
};
