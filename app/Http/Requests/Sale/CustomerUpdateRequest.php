<?php

namespace App\Http\Requests\Sale;

use App\Support\Validation\CustomerPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CustomerUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(CustomerPayloadValidationRules::mergeNormalizedNullableFields([
            'email' => $this->input('email'),
            'phone' => $this->input('phone'),
            'address' => $this->input('address'),
        ]));
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return CustomerPayloadValidationRules::updateRules();
    }

    /**
     * @return array{name: string, email: string|null, phone: string|null, address: string|null}
     */
    public function customerPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return CustomerPayloadValidationRules::updatePayload($validated);
    }
}
