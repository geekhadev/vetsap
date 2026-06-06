<?php

namespace App\Http\Requests\Store;

use App\Models\Store\ProductCategory;
use App\Support\Store\StoreMasterRecordValidation;
use App\Support\Validation\ProductCategoryPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductCategoryUpdateRequest extends FormRequest
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
        $productCategory = $this->route('product_category');
        if (! $productCategory instanceof ProductCategory) {
            return ['name' => ['required']];
        }

        return ProductCategoryPayloadValidationRules::updateRules(
            $productCategory->company_id,
            $productCategory->id,
        );
    }

    /**
     * @return array{name: string, is_active: bool}
     */
    public function productCategoryPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return StoreMasterRecordValidation::updatePayload($validated);
    }
}
