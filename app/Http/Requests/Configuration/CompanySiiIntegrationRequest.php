<?php

namespace App\Http\Requests\Configuration;

use App\Models\Company;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use App\Support\Validation\CompanySiiIntegrationValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CompanySiiIntegrationRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $optional = [
            CompanySiiIntegrationSettingKeys::PORTAL_USERNAME,
            CompanySiiIntegrationSettingKeys::PORTAL_PASSWORD,
            CompanySiiIntegrationSettingKeys::EXCHANGE_EMAIL,
            CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_TICKETS,
            CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_TICKETS,
            CompanySiiIntegrationSettingKeys::CERTIFICATION_EMAIL_TICKETS,
            CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_INVOICES,
            CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_INVOICES,
            CompanySiiIntegrationSettingKeys::CERTIFICATION_EMAIL_INVOICES,
        ];

        $merged = $this->all();

        foreach ($optional as $field) {
            $value = $merged[$field] ?? null;
            if ($value === '') {
                $merged[$field] = null;
            }
        }

        $this->merge($merged);
    }

    public function authorize(): bool
    {
        $user = $this->user();
        if ($user === null) {
            return false;
        }

        $company = $this->route('company');
        if (! $company instanceof Company) {
            return false;
        }

        return $user->can('update', $company);
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public function rules(): array
    {
        return CompanySiiIntegrationValidationRules::rules();
    }

    /**
     * @return array<string, string|null>
     */
    public function siiPayload(): array
    {
        /** @var array<string, string|null> */
        return $this->safe()->only(CompanySiiIntegrationSettingKeys::all());
    }
}
