<?php

namespace App\Http\Requests\Store;

use App\Support\Validation\ProductPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
{
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
        $companyId = data_get($this->session()->get('company_selected'), 'id');
        $product = $this->route('product');

        if (! is_string($companyId) || $companyId === '' || $product === null) {
            return ['name' => ['required']];
        }

        return ProductPayloadValidationRules::updateRules($companyId, (string) $product->getKey());
    }

    /**
     * @return array{
     *     product_category_id: string,
     *     product_type_id: string,
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

        return ProductPayloadValidationRules::updatePayload($validated);
    }
}
