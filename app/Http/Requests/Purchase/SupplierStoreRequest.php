<?php

namespace App\Http\Requests\Purchase;

use App\Enums\Purchase\SupplierDocumentType;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\SupplierPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SupplierStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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
        $companyId = $this->selectedCompanyId();

        if ($companyId === null) {
            return ['name' => ['required']];
        }

        return SupplierPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, document_type: SupplierDocumentType, document_number: string, email: string|null, phone: string|null, address: string|null}
     */
    public function supplierPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return SupplierPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
