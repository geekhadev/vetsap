<?php

namespace App\Http\Requests\Store;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Store\StoreMasterRecordValidation;
use App\Support\Validation\ProductTypePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductTypeStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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

        return ProductTypePayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string|null, name: string, is_active: bool}
     */
    public function productTypePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return StoreMasterRecordValidation::storePayload($this->selectedCompanyId(), $validated);
    }
}
