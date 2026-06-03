<?php

namespace App\Support\Integration;

final class CompanySiiIntegrationSettingKeys
{
    public const CITY = 'configuration_integrations_sii_city';

    public const DIRECTION = 'configuration_integrations_sii_direction';

    public const REPRESENTANTE_LEGAL_RUT = 'configuration_integrations_sii_representante_legal_rut';

    public const REPRESENTANTE_LEGAL_NAME = 'configuration_integrations_sii_representante_legal_name';

    public const PORTAL_USERNAME = 'configuration_integrations_sii_portal_username';

    public const PORTAL_PASSWORD = 'configuration_integrations_sii_portal_password';

    public const CERTIFICATE_URL = 'configuration_integrations_sii_certificate_url';

    public const CERTIFICATE_PASSWORD = 'configuration_integrations_sii_certificate_password';

    public const EXCHANGE_EMAIL = 'configuration_integrations_sii_exchange_email';

    public const GIRO = 'configuration_integrations_sii_giro';

    public const ACTECO = 'configuration_integrations_sii_acteco';

    public const RESOLUTION_DATE_TICKETS = 'configuration_integrations_sii_resolution_date_tickets';

    public const RESOLUTION_NUMBER_TICKETS = 'configuration_integrations_sii_resolution_number_tickets';

    public const CERTIFICATION_EMAIL_TICKETS = 'configuration_integrations_sii_certification_email_tickets';

    public const RESOLUTION_DATE_INVOICES = 'configuration_integrations_sii_resolution_date_invoices';

    public const RESOLUTION_NUMBER_INVOICES = 'configuration_integrations_sii_resolution_number_invoices';

    public const CERTIFICATION_EMAIL_INVOICES = 'configuration_integrations_sii_certification_email_invoices';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::CITY,
            self::DIRECTION,
            self::REPRESENTANTE_LEGAL_RUT,
            self::REPRESENTANTE_LEGAL_NAME,
            self::PORTAL_USERNAME,
            self::PORTAL_PASSWORD,
            self::CERTIFICATE_URL,
            self::CERTIFICATE_PASSWORD,
            self::EXCHANGE_EMAIL,
            self::GIRO,
            self::ACTECO,
            self::RESOLUTION_DATE_TICKETS,
            self::RESOLUTION_NUMBER_TICKETS,
            self::CERTIFICATION_EMAIL_TICKETS,
            self::RESOLUTION_DATE_INVOICES,
            self::RESOLUTION_NUMBER_INVOICES,
            self::CERTIFICATION_EMAIL_INVOICES,
        ];
    }
}
