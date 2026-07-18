<?php

namespace App\Support\Validation;

use App\Enums\Purchase\SupplierDocumentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class SupplierPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        $documentType = request()->input('document_type');

        return [
            'name' => ['required', 'string', 'max:255'],
            'document_type' => ['required', Rule::enum(SupplierDocumentType::class)],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('purchase_suppliers', 'document_number')
                    ->where(fn ($query) => $query
                        ->where('company_id', $companyId)
                        ->where('document_type', $documentType)),
            ],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(): array
    {
        return [
            'document_type' => ['prohibited'],
            'document_number' => ['prohibited'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['email', 'phone', 'address'];
        $merged = $input;

        foreach ($nullable as $field) {
            $value = $merged[$field] ?? null;
            $merged[$field] = ($value === null || $value === '') ? null : $value;
        }

        return $merged;
    }

    /**
     * @return array{company_id: string, name: string, document_type: SupplierDocumentType, document_number: string, email: string|null, phone: string|null, address: string|null}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        $documentType = $validated['document_type'];

        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'document_type' => $documentType instanceof SupplierDocumentType
                ? $documentType
                : SupplierDocumentType::from((string) $documentType),
            'document_number' => (string) $validated['document_number'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ];
    }

    /**
     * @return array{name: string, email: string|null, phone: string|null, address: string|null}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ];
    }
}
