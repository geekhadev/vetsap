<?php

namespace App\Http\Requests\Store;

use App\Models\Store\ProductType;
use App\Support\Store\StoreMasterRecordValidation;
use App\Support\Validation\ProductTypePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductTypeUpdateRequest extends FormRequest
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
        $productType = $this->route('product_type');
        if (! $productType instanceof ProductType) {
            return ['name' => ['required']];
        }

        return ProductTypePayloadValidationRules::updateRules(
            $productType->company_id,
            $productType->id,
        );
    }

    /**
     * @return array{name: string, is_active: bool}
     */
    public function productTypePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return StoreMasterRecordValidation::updatePayload($validated);
    }
}
