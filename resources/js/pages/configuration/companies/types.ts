export type CompanyOwnerSummary = {
    id: string;
    name: string;
    email: string;
};

export type CompanyListItem = {
    id: string;
    document_type: string;
    document_number: string;
    name: string;
    alias: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    owner: CompanyOwnerSummary | null;
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type CompaniesIndexPageProps = {
    companies: CompanyListItem[];
    can: {
        create: boolean;
    };
};

export type CompanyFormRecord = {
    id: string;
    document_type: string;
    document_number: string;
    name: string;
    alias: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    slug: string | null;
    webSettings: Record<string, string | null>;
};

export type CompanyOfficeListItem = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type SiiEconomicActivityOption = {
    id: number;
    code: string;
    description: string;
};

export type CompaniesFormPageProps = {
    company: CompanyFormRecord | null;
    /** Sucursales secundarias (`is_main = false`) para el tab Sucursales. */
    offices: CompanyOfficeListItem[];
    /** Valores actuales de integración SII (claves `configuration_integrations_sii_*`). */
    siiIntegration?: Record<string, string>;
    /** Catálogo SII para el selector ACTECO en integraciones. */
    siiEconomicActivities?: SiiEconomicActivityOption[];
    /** GET interno para descargar el certificado subido (solo si aplica); `null` si no hay archivo gestionado. */
    siiCertificateDownloadUrl?: string | null;
    can: {
        delete: boolean;
    };
};

export type CompanyFormTabId =
    | 'general'
    | 'sucursales'
    | 'integraciones'
    | 'facturacion'
    | 'web'
    | 'eliminar';

/** Campos enviados con `useForm` en el formulario de empresa. */
export type CompanyFormData = Record<string, string | number>;
