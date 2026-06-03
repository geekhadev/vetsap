<?php

namespace App\Support\Validation;

use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

final class CompanySiiIntegrationValidationRules
{
    public const CERTIFICATE_FILE_INPUT = 'configuration_integrations_sii_certificate_file';

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function rules(): array
    {
        return [
            CompanySiiIntegrationSettingKeys::CITY => ['required', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::DIRECTION => ['required', 'string', 'max:500'],
            CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_RUT => ['required', 'string', 'max:20'],
            CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_NAME => ['required', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::PORTAL_USERNAME => ['nullable', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::PORTAL_PASSWORD => ['nullable', 'string', 'max:255'],
            self::CERTIFICATE_FILE_INPUT => [
                'nullable',
                'file',
                'max:5120',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $value instanceof UploadedFile) {
                        return;
                    }

                    $ext = strtolower($value->getClientOriginalExtension() ?: $value->guessExtension() ?: '');
                    if (! in_array($ext, ['pfx', 'p12'], true)) {
                        $fail('El certificado debe ser PKCS#12 (extensión .pfx o .p12, mismo formato).');
                    }
                },
            ],
            CompanySiiIntegrationSettingKeys::CERTIFICATE_URL => [
                'required_without:'.self::CERTIFICATE_FILE_INPUT,
                'nullable',
                'string',
                'max:2048',
            ],
            CompanySiiIntegrationSettingKeys::CERTIFICATE_PASSWORD => ['required', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::EXCHANGE_EMAIL => ['nullable', 'string', 'email', 'max:255'],
            CompanySiiIntegrationSettingKeys::GIRO => ['required', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::ACTECO => [
                'required',
                'string',
                Rule::exists('shared_sii_economic_activities', 'code'),
            ],
            CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_TICKETS => ['nullable', 'date', 'before_or_equal:today'],
            CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_TICKETS => ['nullable', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::CERTIFICATION_EMAIL_TICKETS => ['nullable', 'string', 'email', 'max:255'],
            CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_INVOICES => ['nullable', 'date', 'before_or_equal:today'],
            CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_INVOICES => ['nullable', 'string', 'max:255'],
            CompanySiiIntegrationSettingKeys::CERTIFICATION_EMAIL_INVOICES => ['nullable', 'string', 'email', 'max:255'],
        ];
    }
}
