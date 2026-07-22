<?php

namespace App\Http\Requests\Store;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ProductPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(ProductPayloadValidationRules::mergeNormalizedNullableFields([
            'barcode' => $this->input('barcode'),
            'description' => $this->input('description'),
            'price' => $this->input('price'),
        ]));
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

        return ProductPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{
     *     company_id: string,
     *     product_category_id: string,
     *     name: string,
     *     barcode: string|null,
     *     description: string|null,
     *     price: string|null,
     *     is_active: bool
     * }
     */
    public function productPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ProductPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
