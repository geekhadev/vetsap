<?php

namespace App\Http\Requests\Sale;

use App\Enums\Sale\CustomerDocumentType;
use App\Models\Company;
use App\Support\Validation\CustomerPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CustomerStoreRequest extends FormRequest
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
        $companyId = $this->selectedCompanyId();

        if ($companyId === null) {
            return ['name' => ['required']];
        }

        return CustomerPayloadValidationRules::storeRules($companyId);
    }

    public function selectedCompanyId(): ?string
    {
        $id = data_get($this->session()->get('company_selected'), 'id');

        return is_string($id) && $id !== '' ? $id : null;
    }

    public function selectedCompany(): ?Company
    {
        $id = $this->selectedCompanyId();

        if ($id === null) {
            return null;
        }

        return Company::query()->find($id);
    }

    /**
     * @return array{company_id: string, name: string, document_type: CustomerDocumentType, document_number: string, email: string|null, phone: string|null, address: string|null}
     */
    public function customerPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return CustomerPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
