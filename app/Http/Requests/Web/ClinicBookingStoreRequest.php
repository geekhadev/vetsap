<?php

namespace App\Http\Requests\Web;

use App\Support\Validation\WebBookingPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ClinicBookingStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = (string) $this->attributes->get('company_id', '');

        if ($companyId === '') {
            return ['phone' => ['required']];
        }

        return WebBookingPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function bookingPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return $validated;
    }
}
