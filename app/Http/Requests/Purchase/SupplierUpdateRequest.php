<?php

namespace App\Http\Requests\Purchase;

use App\Support\Validation\SupplierPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SupplierUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(SupplierPayloadValidationRules::mergeNormalizedNullableFields([
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
        return SupplierPayloadValidationRules::updateRules();
    }

    /**
     * @return array{name: string, email: string|null, phone: string|null, address: string|null}
     */
    public function supplierPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return SupplierPayloadValidationRules::updatePayload($validated);
    }
}
