<?php

namespace App\Support\Validation;

use App\Models\Store\ProductType;
use App\Support\Store\StoreMasterRecordValidation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ProductPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return self::baseRules($companyId);
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $productId): array
    {
        $rules = self::baseRules($companyId);
        $rules['name'] = [
            'required',
            'string',
            'max:255',
            Rule::unique('store_products', 'name')
                ->where('company_id', $companyId)
                ->ignore($productId),
        ];
        $rules['barcode'] = [
            'nullable',
            'string',
            'max:64',
            Rule::unique('store_products', 'barcode')
                ->where('company_id', $companyId)
                ->ignore($productId),
        ];

        return $rules;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    private static function baseRules(string $companyId): array
    {
        return [
            'product_category_id' => StoreMasterRecordValidation::belongsToCompanyOrGlobalRules(
                'store_product_categories',
                $companyId,
            ),
            'product_type_id' => self::productTypeIdRules($companyId),
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('store_products', 'name')->where('company_id', $companyId),
            ],
            'barcode' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('store_products', 'barcode')->where('company_id', $companyId),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'tax_treatment' => ['required', 'string', Rule::in(['taxable', 'exempt'])],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * Tipos de producto de la empresa o globales activos, excluyendo el tipo
     * global "Servicios" (los servicios se gestionan en Medicina).
     *
     * @return array<int, ValidationRule|string>
     */
    private static function productTypeIdRules(string $companyId): array
    {
        return [
            'required',
            'uuid',
            Rule::exists('store_product_types', 'id')->where(function ($query) use ($companyId): void {
                $query->where('is_active', true)
                    ->where(function ($inner) use ($companyId): void {
                        $inner->where('company_id', $companyId)
                            ->orWhereNull('company_id');
                    })
                    ->where(function ($inner): void {
                        $inner->whereNotNull('company_id')
                            ->orWhere('name', '!=', ProductType::GLOBAL_SERVICES_NAME);
                    });
            }),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['barcode', 'description', 'price'];
        $merged = $input;

        foreach ($nullable as $field) {
            $value = $merged[$field] ?? null;
            $merged[$field] = ($value === null || $value === '') ? null : $value;
        }

        return $merged;
    }

    /**
     * @return array{
     *     company_id: string,
     *     product_category_id: string,
     *     product_type_id: string,
     *     name: string,
     *     barcode: string|null,
     *     description: string|null,
     *     price: string|null,
     *     tax_treatment: string,
     *     is_active: bool
     * }
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return self::payload($companyId, $validated);
    }

    /**
     * @return array{
     *     product_category_id: string,
     *     product_type_id: string,
     *     name: string,
     *     barcode: string|null,
     *     description: string|null,
     *     price: string|null,
     *     tax_treatment: string,
     *     is_active: bool
     * }
     */
    public static function updatePayload(array $validated): array
    {
        $payload = self::payload('', $validated);
        unset($payload['company_id']);

        return $payload;
    }

    /**
     * @return array{
     *     company_id: string,
     *     product_category_id: string,
     *     product_type_id: string,
     *     name: string,
     *     barcode: string|null,
     *     description: string|null,
     *     price: string|null,
     *     tax_treatment: string,
     *     is_active: bool
     * }
     */
    private static function payload(string $companyId, array $validated): array
    {
        $price = $validated['price'] ?? null;

        return [
            'company_id' => $companyId,
            'product_category_id' => (string) $validated['product_category_id'],
            'product_type_id' => (string) $validated['product_type_id'],
            'name' => (string) $validated['name'],
            'barcode' => $validated['barcode'] ?? null,
            'description' => $validated['description'] ?? null,
            'price' => $price === null ? null : (string) $price,
            'tax_treatment' => (string) ($validated['tax_treatment'] ?? 'taxable'),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }
}
