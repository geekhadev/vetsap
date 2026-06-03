/** Claves alineadas al backend (`CompanySiiIntegrationSettingKeys`). */
export const SII_INTEGRATION_KEY_LIST = [
    'configuration_integrations_sii_city',
    'configuration_integrations_sii_direction',
    'configuration_integrations_sii_representante_legal_rut',
    'configuration_integrations_sii_representante_legal_name',
    'configuration_integrations_sii_portal_username',
    'configuration_integrations_sii_portal_password',
    'configuration_integrations_sii_certificate_url',
    'configuration_integrations_sii_certificate_password',
    'configuration_integrations_sii_exchange_email',
    'configuration_integrations_sii_giro',
    'configuration_integrations_sii_acteco',
    'configuration_integrations_sii_resolution_date_tickets',
    'configuration_integrations_sii_resolution_number_tickets',
    'configuration_integrations_sii_certification_email_tickets',
    'configuration_integrations_sii_resolution_date_invoices',
    'configuration_integrations_sii_resolution_number_invoices',
    'configuration_integrations_sii_certification_email_invoices',
] as const;

export type SiiIntegrationFieldKey = (typeof SII_INTEGRATION_KEY_LIST)[number];

export const SII_CERTIFICATE_FILE_FIELD = 'configuration_integrations_sii_certificate_file' as const;

export type SiiIntegrationFormData = Record<SiiIntegrationFieldKey, string> & {
    [SII_CERTIFICATE_FILE_FIELD]: File | null;
};

export function buildEmptySiiIntegrationFormData(): SiiIntegrationFormData {
    return {
        ...(Object.fromEntries(
            SII_INTEGRATION_KEY_LIST.map((k) => [k, '']),
        ) as Record<SiiIntegrationFieldKey, string>),
        [SII_CERTIFICATE_FILE_FIELD]: null,
    };
}

export function normalizeSiiIntegrationProps(
    raw: Record<string, string> | undefined,
): SiiIntegrationFormData {
    const base = buildEmptySiiIntegrationFormData();

    if (!raw) {
        return base;
    }

    for (const key of SII_INTEGRATION_KEY_LIST) {
        base[key] = raw[key] ?? '';
    }

    const legacyCountry = raw['configuration_integrations_sii_country'];

    if (legacyCountry !== undefined && legacyCountry !== '' && base.configuration_integrations_sii_city === '') {
        base.configuration_integrations_sii_city = legacyCountry;
    }

    return base;
}
