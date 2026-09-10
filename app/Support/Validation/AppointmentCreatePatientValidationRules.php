<?php

namespace App\Support\Validation;

use App\Enums\Medic\PatientSex;
use App\Enums\Sale\CustomerDocumentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class AppointmentCreatePatientValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function rules(string $companyId): array
    {
        $creatingCustomer = blank(request()->input('customer_id'));
        $documentType = request()->input('document_type');

        return [
            'customer_id' => [
                'nullable',
                'uuid',
                Rule::exists('sale_customers', 'id')->where('company_id', $companyId),
            ],
            'document_type' => ['required', Rule::enum(CustomerDocumentType::class)],
            'document_number' => array_values(array_filter([
                'required',
                'string',
                'max:20',
                $creatingCustomer
                    ? Rule::unique('sale_customers', 'document_number')
                        ->where(fn ($query) => $query
                            ->where('company_id', $companyId)
                            ->where('document_type', $documentType))
                    : null,
            ])),
            'customer_name' => [
                Rule::requiredIf($creatingCustomer),
                'nullable',
                'string',
                'max:255',
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
            'record_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('medic_patients', 'record_number')
                    ->where('company_id', $companyId),
            ],
            'species_id' => [
                'required',
                'uuid',
                Rule::exists('medic_species', 'id')
                    ->where(fn ($query) => $query
                        ->where('is_active', true)
                        ->where(function ($inner) use ($companyId): void {
                            $inner->where('company_id', $companyId)
                                ->orWhere(function ($global): void {
                                    $global->where('is_global', true)->whereNull('company_id');
                                });
                        })),
            ],
            'sex' => ['required', Rule::enum(PatientSex::class)],
        ];
    }

    /**
     * @return array{
     *     customer_id: string|null,
     *     document_type: CustomerDocumentType,
     *     document_number: string,
     *     customer_name: string|null,
     *     phone: string|null,
     *     name: string,
     *     record_number: string|null,
     *     species_id: string,
     *     sex: PatientSex,
     * }
     */
    public static function payload(array $validated): array
    {
        $documentType = $validated['document_type'];
        $sex = $validated['sex'];

        return [
            'customer_id' => isset($validated['customer_id']) && is_string($validated['customer_id'])
                && $validated['customer_id'] !== ''
                    ? $validated['customer_id']
                    : null,
            'document_type' => $documentType instanceof CustomerDocumentType
                ? $documentType
                : CustomerDocumentType::from((string) $documentType),
            'document_number' => (string) $validated['document_number'],
            'customer_name' => isset($validated['customer_name']) && is_string($validated['customer_name'])
                && $validated['customer_name'] !== ''
                    ? $validated['customer_name']
                    : null,
            'phone' => $validated['phone'] ?? null,
            'name' => (string) $validated['name'],
            'record_number' => isset($validated['record_number']) && is_string($validated['record_number'])
                && $validated['record_number'] !== ''
                    ? $validated['record_number']
                    : null,
            'species_id' => (string) $validated['species_id'],
            'sex' => $sex instanceof PatientSex
                ? $sex
                : PatientSex::from((string) $sex),
        ];
    }
}
